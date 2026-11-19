import { load } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { const d = (await load()); return Response.json({ products: d.products, settings: d.settings }); }
