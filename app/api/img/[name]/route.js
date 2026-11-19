import path from "path";
import { getImage } from "@/lib/db";
export const dynamic = "force-dynamic";
const types = { ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
export async function GET(_, { params }) {
  const name = path.basename(params.name); const buf = await getImage(name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(buf, { headers: { "Content-Type": types[path.extname(name).toLowerCase()] || "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" } });
}
