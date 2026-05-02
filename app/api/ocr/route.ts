import { extractTextFromImage } from "../../../lib/vision";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: "image is required" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const text = await extractTextFromImage(base64);
  return Response.json({ text });
}
