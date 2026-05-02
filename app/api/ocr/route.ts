import { extractTextFromImage } from "../../../lib/vision";

export async function POST(request: Request) {
  console.log("[OCR] POST /api/ocr called");
  console.log("[OCR] GOOGLE_CLOUD_VISION_API_KEY:", process.env.GOOGLE_CLOUD_VISION_API_KEY ? "SET" : "NOT SET");

  let formData: FormData;
  try {
    formData = await request.formData();
    console.log("[OCR] formData keys:", [...formData.keys()]);
  } catch (err) {
    console.error("[OCR] Failed to parse formData:", err);
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }

  const file = formData.get("image");
  console.log("[OCR] image field:", file ? `${(file as Blob).type} size=${(file as Blob).size}` : "NOT FOUND");

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: "image is required" }, { status: 400 });
  }

  let base64: string;
  try {
    const buffer = await file.arrayBuffer();
    base64 = Buffer.from(buffer).toString("base64");
    console.log("[OCR] base64 length:", base64.length);
  } catch (err) {
    console.error("[OCR] Failed to convert image to base64:", err);
    return Response.json({ error: "Failed to read image data" }, { status: 500 });
  }

  try {
    console.log("[OCR] Calling Vision API...");
    const text = await extractTextFromImage(base64);
    console.log("[OCR] Vision API success, text length:", text.length);
    return Response.json({ text });
  } catch (err) {
    console.error("[OCR] Vision API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Vision API failed" },
      { status: 500 }
    );
  }
}
