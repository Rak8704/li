import { makeToken, isAdmin, adminPw, secure } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req) {
  const { password } = await req.json();
  if (!adminPw()) return Response.json({ error: "ADMIN_PASSWORD is not set in the server environment variables." }, { status: 500 });
  if (password !== adminPw()) return Response.json({ error: "Wrong password" }, { status: 401 });
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `livora_admin=${makeToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
  return res;
}
export function DELETE() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", "livora_admin=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
export function GET() { return Response.json({ admin: isAdmin() }); }
