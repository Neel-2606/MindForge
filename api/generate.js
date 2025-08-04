export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt, type } = req.body
    
    if (!prompt || !type) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "Please provide both prompt and type" 
      })
    }

    // Test which API keys are available
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
    const mistralApiKey = process.env.MISTRAL_API_KEY?.trim()
    const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY?.trim()

    // Log for debugging (this will appear in Vercel logs)
    console.log("Available APIs:", {
      gemini: !!geminiApiKey,
      mistral: !!mistralApiKey,
      huggingFace: !!huggingFaceApiKey
    })

    // Use Gemini as primary fallback
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: `Create a complete HTML file for a ${type} with this description: ${prompt}. Include all CSS and JavaScript in the same file.` }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          const content = data.candidates[0].content.parts[0].text
          
          // Clean the response
          let cleaned = content.replace(/```html/g, '').replace(/```/g, '').trim()
          if (!cleaned.startsWith('<!DOCTYPE html')) {
            cleaned = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${cleaned}</head><body></body></html>`
          }
          
          return res.status(200).json({ 
            success: true, 
            code: cleaned,
            apiUsed: "gemini"
          })
        }
      } catch (error) {
        console.error("Gemini error:", error)
      }
    }

    // If Gemini fails, try Mistral
    if (mistralApiKey) {
      try {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mistralApiKey}`
          },
          body: JSON.stringify({
            model: "mistral-tiny",
            messages: [{
              role: "user",
              content: `Create HTML for a ${type}: ${prompt}. Include all CSS and JS in the file.`
            }],
            max_tokens: 2048
          })
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices[0].message.content
          const cleaned = content.replace(/```html/g, '').replace(/```/g, '').trim()
          
          return res.status(200).json({ 
            success: true, 
            code: cleaned,
            apiUsed: "mistral"
          })
        }
      } catch (error) {
        console.error("Mistral error:", error)
      }
    }

    // All APIs failed
    return res.status(500).json({
      success: false,
      error: "No AI service available",
      message: "Please check your API keys in Vercel environment variables"
    })

  } catch (error) {
    console.error("Handler error:", error)
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    })
  }
}