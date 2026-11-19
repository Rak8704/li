import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { products as seed } from "./products";
// Storage: Upstash Redis when its env vars exist (Vercel), otherwise local files (npm run dev).
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "store.json");
export const UPLOADS = path.join(DIR, "uploads");
const RURL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const RTOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const remote = !!(RURL && RTOKEN);
const K = { core: "livora:core", users: "livora:users", orders: "livora:orders" };
async function redis(cmd, p = "") {
  const r = await fetch(RURL + p, { method: "POST", headers: { Authorization: `Bearer ${RTOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd), cache: "no-store" });
  const j = await r.json(); if (j.error) throw new Error("Redis: " + j.error); return j;
}
export const WALLETS = ["bKash", "Nagad", "Rocket", "Upay"];
const wallet = (number = "", type = "Personal", enabled = true) => ({ number, type, enabled });
const defaults = { products: seed.map(p => ({ ...p, stock: 20 })), orders: [], users: [], settings: { wallets: {}, codEnabled: true, deliveryFee: 80, freeOver: 5000 } };
function migrate(d) {
  d.users ||= []; d.orders ||= []; d.coupons ||= []; const s = (d.settings ||= {});
  if (!s.wallets || !Object.keys(s.wallets).length) s.wallets = { bKash: wallet(s.bkash, s.bkashType, s.bkashEnabled !== false), Nagad: wallet(s.nagad, s.nagadType, s.nagadEnabled !== false) };
  WALLETS.forEach(w => { s.wallets[w] ||= wallet(); });
  return d;
}
export async function load() {
  if (remote) {
    const [core, users, orders] = (await redis(["MGET", K.core, K.users, K.orders])).result;
    if (!core) { const d = migrate(structuredClone(defaults)); await save(d); return d; }
    return migrate({ ...JSON.parse(core), users: users ? JSON.parse(users) : [], orders: orders ? JSON.parse(orders) : [] });
  }
  try { return migrate(JSON.parse(fs.readFileSync(FILE, "utf8"))); } catch { const d = migrate(structuredClone(defaults)); await save(d); return d; }
}
export async function save(d) {
  if (remote) { const { users, orders, ...core } = d; await redis([["SET", K.core, JSON.stringify(core)], ["SET", K.users, JSON.stringify(users)], ["SET", K.orders, JSON.stringify(orders)]], "/pipeline"); return; }
  if (process.env.VERCEL) throw new Error("Database not connected. In Vercel open Storage, add Upstash Redis, then redeploy.");
  fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
}
export async function putImage(name, buf) {
  if (remote) { await redis(["SET", "livora:img:" + name, buf.toString("base64")]); return; }
  if (process.env.VERCEL) throw new Error("Database not connected.");
  fs.mkdirSync(UPLOADS, { recursive: true }); fs.writeFileSync(path.join(UPLOADS, name), buf);
}
export async function getImage(name) {
  if (remote) { const v = (await redis(["GET", "livora:img:" + name])).result; return v ? Buffer.from(v, "base64") : null; }
  try { return fs.readFileSync(path.join(UPLOADS, name)); } catch { return null; }
}
// ---- admin
const prod = process.env.NODE_ENV === "production";
export const secure = prod ? "; Secure" : "";
export const adminPw = () => process.env.ADMIN_PASSWORD || (prod ? "" : "livora123");
export const makeToken = () => crypto.createHash("sha256").update(adminPw() + "livora-salt").digest("hex");
export const isAdmin = () => !!adminPw() && cookies().get("livora_admin")?.value === makeToken();
export const deny = () => Response.json({ error: "Not signed in" }, { status: 401 });
// ---- customers
export const bad = (m, status = 400) => Response.json({ error: m }, { status });
export const normPhone = p => String(p || "").replace(/[\s-]/g, "").replace(/^(\+?88)/, "");
const secret = () => { const s = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || (prod ? "" : "livora-dev-secret"); if (!s) throw new Error("Set AUTH_SECRET in the environment variables."); return s; };
export function hashPw(pw, salt = crypto.randomBytes(16).toString("hex")) { return { salt, hash: crypto.scryptSync(pw, salt, 64).toString("hex") }; }
export function checkPw(pw, u) { const h = crypto.scryptSync(String(pw), u.salt, 64), b = Buffer.from(u.hash, "hex"); return b.length === h.length && crypto.timingSafeEqual(b, h); }
export const userToken = id => id + "." + crypto.createHmac("sha256", secret()).update(id).digest("hex");
export async function currentUser() {
  const v = cookies().get("livora_user")?.value; if (!v || userToken(v.split(".")[0]) !== v) return null;
  const u = (await load()).users.find(u => u.id === v.split(".")[0]); return u && !u.blocked ? u : null;
}
export const publicUser = u => u && { id: u.id, name: u.name, email: u.email, phone: u.phone, address: u.address || "", city: u.city || "Dhaka" };
export const withUserCookie = (res, id) => { res.headers.append("Set-Cookie", `livora_user=${userToken(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`); return res; };
