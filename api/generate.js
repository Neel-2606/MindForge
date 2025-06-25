export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: "Prompt and type are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an expert AI developer. Generate a complete ${type} project inside a single HTML file (with internal CSS and JS). Don't include explanation. Prompt: ${prompt}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    const output = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) throw new Error("No output from Gemini");

    res.status(200).json({ code: output });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to generate from Gemini" });
  }
}
