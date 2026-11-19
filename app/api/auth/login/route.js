import { load, checkPw, normPhone, publicUser, withUserCookie, bad } from "@/lib/db";
export async function POST(req) {
  const b = await req.json(); const id = String(b.identifier || "").trim().toLowerCase();
  const u = (await load()).users.find(u => u.email === id || u.phone === normPhone(id));
  if (!u || !checkPw(b.password || "", u)) return bad("Wrong email, mobile number or password.", 401);
  if (u.blocked) return bad("This account has been blocked. Please contact Livora support.", 403);
  return withUserCookie(Response.json({ user: publicUser(u) }), u.id);
}
export async function DELETE() { const r = Response.json({ ok: true }); r.headers.append("Set-Cookie", "livora_user=; Path=/; HttpOnly; Max-Age=0"); return r; }
