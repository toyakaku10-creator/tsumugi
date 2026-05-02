export async function extractTextFromImage(
  imageBase64: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_CLOUD_VISION_API_KEY is not set");
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const annotation = data.responses?.[0]?.fullTextAnnotation;
  return annotation?.text ?? "";
}
