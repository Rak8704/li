import { load, save, isAdmin, deny, hashPw, normPhone, bad } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!isAdmin()) return deny(); const d = (await load());
  return Response.json({ users: d.users.map(u => { const os = d.orders.filter(o => o.userId === u.id);
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, created: u.created || "", blocked: !!u.blocked, points: u.points || 0, addresses: (u.addresses || []).length, orders: os.length, spent: os.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0) }; }) });
}
export async function PATCH(req) {
  if (!isAdmin()) return deny(); const b = await req.json(); const d = (await load()); const u = d.users.find(x => x.id === b.id); if (!u) return bad("User not found.", 404);
  if (b.action === "edit") {
    const phone = normPhone(b.phone);
    if (!String(b.name || "").trim()) return bad("Enter a name."); if (!/^01\d{9}$/.test(phone)) return bad("Mobile number must be 11 digits, like 01712345678.");
    if (d.users.some(x => x.id !== u.id && x.phone === phone)) return bad("That mobile number belongs to another user.", 409);
    u.name = b.name.trim(); u.phone = phone;
  } else if (b.action === "block") u.blocked = !!b.blocked;
  else if (b.action === "points") {
    const n = Math.trunc(+b.delta); if (!n) return bad("Enter a number of points, like 50 or -20.");
    const before = u.points || 0; u.points = Math.max(0, before + n);
    (u.pointsLog ||= []).unshift({ date: new Date().toISOString(), delta: u.points - before, note: String(b.note || "").trim() || "Adjusted by Livora team" });
  } else if (b.action === "password") {
    if (String(b.password || "").length < 6) return bad("Password must be at least 6 characters."); Object.assign(u, hashPw(b.password));
  } else return bad("Unknown action.");
  await save(d); return Response.json({ ok: true });
}
export async function DELETE(req) {
  if (!isAdmin()) return deny(); const { id } = await req.json(); const d = (await load());
  d.users = d.users.filter(u => u.id !== id); // their past orders stay in the order list
  await save(d); return Response.json({ ok: true });
}
