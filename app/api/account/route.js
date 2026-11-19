import { load, save, currentUser, publicUser, normPhone, bad } from "@/lib/db";
export const dynamic = "force-dynamic";
const live = c => c.active && c.public && !(c.expires && new Date(c.expires + "T23:59:59") < new Date()) && !(c.maxUses && (c.used || 0) >= c.maxUses);
export async function GET() {
  const u = (await currentUser()); if (!u) return bad("Please sign in.", 401); const d = (await load());
  return Response.json({ user: publicUser(u), wishlist: u.wishlist || [], addresses: u.addresses || [], points: u.points || 0, pointsLog: (u.pointsLog || []).slice(0, 40),
    coupons: d.coupons.filter(live).map(c => ({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder || 0, expires: c.expires || "", note: c.note || "", used: !!c.usedBy?.includes(u.id) })),
    orders: d.orders.filter(o => o.userId === u.id) });
}
export async function POST(req) {
  const me = (await currentUser()); if (!me) return bad("Please sign in.", 401);
  const b = await req.json(); const d = (await load()); const u = d.users.find(x => x.id === me.id); u.wishlist ||= []; u.addresses ||= [];
  if (b.action === "wishlist") { u.wishlist = u.wishlist.includes(b.id) ? u.wishlist.filter(x => x !== b.id) : [...u.wishlist, b.id]; }
  else if (b.action === "saveAddress") {
    const a = { id: b.id || "a" + Math.random().toString(36).slice(2, 8), label: String(b.label || "Home").trim(), name: String(b.name || "").trim(), phone: normPhone(b.phone), city: String(b.city || "").trim(), address: String(b.address || "").trim() };
    if (!a.name) return bad("Enter the receiver's name."); if (!/^01\d{9}$/.test(a.phone)) return bad("Mobile number must be 11 digits, like 01712345678.");
    if (!a.city) return bad("Enter the city."); if (a.address.length < 8) return bad("Enter the full address (at least 8 characters).");
    const i = u.addresses.findIndex(x => x.id === a.id); a.isDefault = !!b.isDefault || (i < 0 ? u.addresses.length === 0 : u.addresses[i].isDefault);
    if (a.isDefault) u.addresses.forEach(x => (x.isDefault = false));
    i < 0 ? u.addresses.push(a) : (u.addresses[i] = a);
  } else if (b.action === "deleteAddress") { u.addresses = u.addresses.filter(x => x.id !== b.id); if (u.addresses.length && !u.addresses.some(x => x.isDefault)) u.addresses[0].isDefault = true; }
  else if (b.action === "defaultAddress") u.addresses.forEach(x => (x.isDefault = x.id === b.id));
  else return bad("Unknown action.");
  await save(d); return Response.json({ ok: true, wishlist: u.wishlist, addresses: u.addresses });
}
