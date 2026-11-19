import { load, currentUser, normPhone, bad } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const q = new URL(req.url).searchParams; const id = (q.get("id") || "").trim().toUpperCase(); const u = (await currentUser());
  const o = (await load()).orders.find(o => o.id === id);
  if (!o || !((u && o.userId === u.id) || (q.get("phone") && normPhone(q.get("phone")) === o.phone))) return bad("No order found. Check the order number and the mobile number used for the order.", 404);
  return Response.json({ order: { id: o.id, date: o.date, status: o.status, history: o.history || [{ status: "New", date: o.date }], courier: o.courier || "", items: o.items, total: o.total, pay: o.pay, city: o.city } });
}
