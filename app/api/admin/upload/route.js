import { isAdmin, deny, putImage, bad } from "@/lib/db";
export async function POST(req) {
  if (!isAdmin()) return deny();
  const { dataUrl } = await req.json(); const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m || dataUrl.length > 900000) return bad("The image is too large or not valid. Try a smaller picture.");
  const name = Date.now() + "-" + Math.random().toString(36).slice(2, 6) + ".jpg";
  await putImage(name, Buffer.from(m[1], "base64"));
  return Response.json({ url: "/api/img/" + name });
}
