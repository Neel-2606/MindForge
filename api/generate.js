import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: "Missing prompt or type in request body" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY in environment");
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert web developer that generates full working HTML projects with inline CSS and JS.`,
        },
        {
          role: "user",
          content: `Make a ${type} based on this idea: "${prompt}". Return only complete working code wrapped in one HTML file.`,
        },
      ],
      temperature: 0.7,
    });

    const code = completion.data.choices?.[0]?.message?.content;

    if (!code) {
      console.error("⚠️ Empty code response from OpenAI:", completion.data);
      return res.status(500).json({ error: "OpenAI returned empty code." });
    }

    return res.status(200).json({ code });

  } catch (err) {
    console.error("🛑 API Error:", err.response?.data || err.message || err);
    return res.status(500).json({
      error: "OpenAI API error",
      details: err.response?.data || err.message || "Unknown error",
    });
  }
}
