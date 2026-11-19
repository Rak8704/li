import { load, save, isAdmin, deny, bad } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { if (!isAdmin()) return deny(); return Response.json({ coupons: (await load()).coupons }); }
export async function POST(req) {
  if (!isAdmin()) return deny(); const b = await req.json(); const d = (await load()); const code = String(b.code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return bad("Enter a coupon code."); if (d.coupons.some(c => c.code === code)) return bad("That code already exists.");
  const value = +b.value; if (!(value > 0)) return bad("Enter a discount value."); if (b.type === "percent" && value > 100) return bad("Percent discount cannot be over 100.");
  d.coupons.unshift({ code, type: b.type === "percent" ? "percent" : "fixed", value, minOrder: Math.max(0, +b.minOrder || 0), expires: b.expires || "", maxUses: Math.max(0, Math.floor(+b.maxUses || 0)), note: String(b.note || ""), public: !!b.public, active: true, used: 0, usedBy: [] });
  await save(d); return Response.json({ ok: true });
}
export async function PUT(req) { if (!isAdmin()) return deny(); const { code, active } = await req.json(); const d = (await load()); const c = d.coupons.find(c => c.code === code); if (c) c.active = !!active; await save(d); return Response.json({ ok: true }); }
export async function DELETE(req) { if (!isAdmin()) return deny(); const { code } = await req.json(); const d = (await load()); d.coupons = d.coupons.filter(c => c.code !== code); await save(d); return Response.json({ ok: true }); }
