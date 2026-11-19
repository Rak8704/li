import { load, save, currentUser, checkPw, hashPw, normPhone, publicUser, bad } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ user: publicUser((await currentUser())) }); }
export async function PATCH(req) {
  const me = (await currentUser()); if (!me) return bad("Please sign in.", 401);
  const b = await req.json(); const d = (await load()); const u = d.users.find(x => x.id === me.id);
  if (b.newPassword !== undefined) {
    if (!checkPw(b.currentPassword || "", u)) return bad("Current password is wrong.");
    if (String(b.newPassword).length < 6) return bad("New password must be at least 6 characters.");
    Object.assign(u, hashPw(b.newPassword));
  } else {
    const phone = normPhone(b.phone);
    if (!String(b.name || "").trim()) return bad("Enter your full name.");
    if (!/^01\d{9}$/.test(phone)) return bad("Mobile number must be 11 digits, like 01712345678.");
    if (d.users.some(x => x.id !== u.id && x.phone === phone)) return bad("That mobile number is used by another account.", 409);
    Object.assign(u, { name: b.name.trim(), phone, address: String(b.address || "").trim(), city: String(b.city || "Dhaka").trim() });
  }
  await save(d); return Response.json({ user: publicUser(u) });
}
