// Shared by server and browser. Edit these numbers to change the loyalty rules.
export const LOYALTY = { perHundred: 2, taka: 1, maxPct: 50 }; // 2 points per ৳100 spent, 1 point = ৳1, max 50% of an order payable with points
export function couponDiscount(c, sub, user) {
  if (!c || !c.active) return [0, "This coupon code is not valid."];
  if (c.expires && new Date(c.expires + "T23:59:59") < new Date()) return [0, "This coupon has expired."];
  if (c.maxUses && (c.used || 0) >= c.maxUses) return [0, "This coupon has been fully used."];
  if (sub < (c.minOrder || 0)) return [0, `Spend at least ৳${c.minOrder} to use this coupon.`];
  if (user && c.usedBy?.includes(user.id)) return [0, "You have already used this coupon."];
  const v = c.type === "percent" ? Math.round(sub * c.value / 100) : c.value;
  return [Math.min(v, sub), ""];
}
