import { load, save, hashPw, normPhone, publicUser, withUserCookie, bad } from "@/lib/db";
export async function POST(req) {
  const b = await req.json(); const d = (await load());
  const email = String(b.email || "").trim().toLowerCase(), phone = normPhone(b.phone), name = String(b.name || "").trim();
  if (!name) return bad("Enter your full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Enter a valid email address.");
  if (!/^01\d{9}$/.test(phone)) return bad("Mobile number must be 11 digits, like 01712345678.");
  if (String(b.password || "").length < 6) return bad("Password must be at least 6 characters.");
  if (d.users.some(u => u.email === email || u.phone === phone)) return bad("An account with this email or mobile number already exists.", 409);
  const u = { id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, email, phone, ...hashPw(b.password), address: "", city: "Dhaka", created: new Date().toISOString() };
  d.users.push(u); await save(d);
  return withUserCookie(Response.json({ user: publicUser(u) }), u.id);
}
