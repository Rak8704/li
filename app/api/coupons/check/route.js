import { load, currentUser, bad } from "@/lib/db";
import { couponDiscount } from "@/lib/loyalty";
export async function POST(req) {
  const u = (await currentUser()); if (!u) return bad("Log in to use a coupon.", 401);
  const { code, subtotal } = await req.json(); const c = (await load()).coupons.find(c => c.code === String(code || "").trim().toUpperCase());
  const [discount, msg] = couponDiscount(c, +subtotal || 0, u); if (msg) return bad(msg);
  return Response.json({ code: c.code, discount });
}
