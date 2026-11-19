import { load, save, isAdmin, deny, currentUser, normPhone, bad } from "@/lib/db";
import { LOYALTY, couponDiscount } from "@/lib/loyalty";
export const dynamic = "force-dynamic";
export async function GET(req) {
  if (new URL(req.url).searchParams.get("mine")) { const u = (await currentUser()); if (!u) return bad("Please sign in.", 401); return Response.json({ orders: (await load()).orders.filter(o => o.userId === u.id) }); }
  if (!isAdmin()) return deny(); return Response.json({ orders: (await load()).orders });
}
export async function PATCH(req) {
  if (!isAdmin()) return deny();
  const { id, status, note } = await req.json(); const d = (await load()); const o = d.orders.find(o => o.id === id); if (!o) return bad("Order not found.", 404);
  const now = new Date().toISOString();
  if (note !== undefined) o.courier = String(note).slice(0, 120);
  if (status && status !== o.status) {
    o.status = status; (o.history ||= [{ status: "New", date: o.date }]).push({ status, date: now });
    const u = o.userId && d.users.find(u => u.id === o.userId);
    if (status === "Delivered" && u && !o.pointsAwarded) { const n = Math.floor(o.total / 100 * LOYALTY.perHundred); if (n > 0) { u.points = (u.points || 0) + n; (u.pointsLog ||= []).unshift({ date: now, delta: n, note: `Order ${o.id} delivered` }); } o.pointsAwarded = n; }
    if (status === "Cancelled" && !o.cancelHandled) {
      o.items.forEach(l => { const p = d.products.find(p => p.id === l.id); if (p) p.stock += l.qty; });
      if (u && o.pointsUsed) { u.points = (u.points || 0) + o.pointsUsed; (u.pointsLog ||= []).unshift({ date: now, delta: o.pointsUsed, note: `Order ${o.id} cancelled, points returned` }); }
      o.cancelHandled = true;
    }
  }
  await save(d); return Response.json({ ok: true });
}
export async function POST(req) {
  const b = await req.json(); const d = (await load()); const s = d.settings; const me = (await currentUser()); const user = me && d.users.find(u => u.id === me.id);
  b.phone = normPhone(b.phone);
  if (!b.name?.trim()) return bad("Enter your full name.");
  if (!/^01\d{9}$/.test(b.phone)) return bad("Mobile number must be 11 digits, like 01712345678.");
  if ((b.address || "").trim().length < 8) return bad("Enter your full address (at least 8 characters).");
  const pay = b.pay, w = s.wallets[pay];
  if (!(pay === "cod" ? s.codEnabled : w && w.enabled && w.number)) return bad(`Payment method "${pay}" is not available. Check Admin → Payments & delivery.`);
  if (pay !== "cod" && !(b.trxId || "").trim()) return bad("Enter the transaction ID from your payment.");
  const lines = []; let sub = 0;
  for (const it of b.items || []) {
    const p = d.products.find(p => p.id === it.id); const qty = Math.floor(+it.qty);
    if (!p || qty < 1) continue;
    if (p.stock < qty) return bad(`${p.name}: only ${p.stock} left in stock.`);
    lines.push({ id: p.id, name: p.name, price: p.price, qty }); sub += p.price * qty;
  }
  if (!lines.length) return bad("Your cart is empty.");
  let disc = 0, coupon = null;
  if (b.coupon) { if (!user) return bad("Log in to use a coupon."); coupon = d.coupons.find(c => c.code === String(b.coupon).trim().toUpperCase()); const [v, m] = couponDiscount(coupon, sub, user); if (m) return bad(m); disc = v; }
  let pts = 0;
  if (+b.usePoints > 0) { if (!user) return bad("Log in to use loyalty points."); pts = Math.max(0, Math.min(Math.floor(+b.usePoints), user.points || 0, Math.floor((sub - disc) * LOYALTY.maxPct / 100 / LOYALTY.taka))); }
  const now = new Date().toISOString();
  lines.forEach(l => { d.products.find(p => p.id === l.id).stock -= l.qty; });
  if (coupon) { coupon.used = (coupon.used || 0) + 1; (coupon.usedBy ||= []).push(user.id); }
  if (pts) { user.points -= pts; (user.pointsLog ||= []).unshift({ date: now, delta: -pts, note: "Used at checkout" }); }
  const ship = sub >= s.freeOver ? 0 : s.deliveryFee; const total = sub - disc - pts * LOYALTY.taka + ship;
  const order = { id: "LV" + Date.now().toString().slice(-6), userId: user?.id || null, date: now, name: b.name.trim(), phone: b.phone, city: b.city, address: b.address.trim(), pay, trxId: b.trxId || "", items: lines, subtotal: sub, couponCode: coupon?.code || "", discount: disc, pointsUsed: pts, delivery: ship, total, status: "New", history: [{ status: "New", date: now }] };
  d.orders.unshift(order); await save(d); return Response.json({ order });
}
