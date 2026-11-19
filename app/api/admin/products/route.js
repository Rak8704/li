import { load, save, isAdmin, deny } from "@/lib/db";
export const dynamic = "force-dynamic";
const clean = b => ({ name: String(b.name || "").trim(), category: String(b.category || "General").trim(), price: Math.max(0, +b.price || 0), old: +b.old > 0 ? +b.old : undefined, stock: Math.max(0, Math.floor(+b.stock || 0)), desc: String(b.desc || ""), image: b.image || "", tint: b.tint || "#ead7b0", emoji: b.emoji || "🏠", tags: b.isNew ? ["new"] : [] });
export async function POST(req) {
  if (!isAdmin()) return deny();
  const b = await req.json(); if (!b.name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });
  const d = (await load()); const id = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) + "-" + Math.random().toString(36).slice(2, 6);
  d.products.unshift({ id, ...clean(b) }); await save(d); return Response.json({ ok: true });
}
export async function PUT(req) {
  if (!isAdmin()) return deny();
  const b = await req.json(); const d = (await load()); const i = d.products.findIndex(p => p.id === b.id);
  if (i < 0) return Response.json({ error: "Not found" }, { status: 404 });
  d.products[i] = { id: b.id, ...clean(b) }; await save(d); return Response.json({ ok: true });
}
export async function DELETE(req) {
  if (!isAdmin()) return deny();
  const { id } = await req.json(); const d = (await load()); d.products = d.products.filter(p => p.id !== id); await save(d); return Response.json({ ok: true });
}
