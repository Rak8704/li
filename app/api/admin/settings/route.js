import { load, save, isAdmin, deny, normPhone, WALLETS } from "@/lib/db";
export async function PUT(req) {
  if (!isAdmin()) return deny();
  const b = await req.json(); const d = (await load()); const wallets = {};
  WALLETS.forEach(k => { const w = b.wallets?.[k] || {}; wallets[k] = { number: normPhone(w.number), type: w.type || "Personal", enabled: !!w.enabled }; });
  d.settings = { wallets, codEnabled: !!b.codEnabled, deliveryFee: Math.max(0, +b.deliveryFee || 0), freeOver: Math.max(0, +b.freeOver || 0) };
  await save(d); return Response.json({ ok: true });
}
