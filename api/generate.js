// File: /api/generate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: "Prompt and type are required" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // use "gpt-4" if your key supports it
        messages: [
          {
            role: "system",
            content: `You are an expert ${type.toLowerCase()} developer. Generate clean HTML, CSS, and JS code as required.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiOutput = data.choices[0]?.message?.content;

    return res.status(200).json({ code: aiOutput });
  } catch (err) {
    return res.status(500).json({ error: "AI request failed", details: err.message });
  }
}
