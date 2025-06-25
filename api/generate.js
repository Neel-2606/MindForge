import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { prompt, type } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant generating frontend project code." },
        { role: "user", content: `Make ${type} based on prompt: ${prompt}. Provide full HTML+CSS+JS in one HTML doc.` }
      ],
    });

    if (!completion.data.choices?.[0]?.message?.content) {
      console.error("OpenAI returned empty content:", completion.data);
      return res.status(500).json({ error: "Empty content from OpenAI", details: completion.data });
    }

    const code = completion.data.choices[0].message.content;
    return res.status(200).json({ code });

  } catch (err) {
    console.error("🛑 /api/generate Error:", err.response?.data || err.message || err);
    return res.status(500).json({ error: "OpenAI API error", details: err.response?.data || err.message });
  }
}
