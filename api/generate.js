export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "MindForge API is working!",
      timestamp: new Date().toISOString(),
      environment: {
        hasMistral: !!process.env.MISTRAL_API_KEY,
        hasHuggingFace: !!process.env.HUGGING_FACE_API_KEY,
        hasGemini: !!process.env.GEMINI_API_KEY,
      },
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt, type = "Website" } = req.body || {}

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid prompt is required",
      })
    }

    // Get API keys with fallback
    const mistralKey = process.env.MISTRAL_API_KEY
    const huggingFaceKey = process.env.HUGGING_FACE_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (!mistralKey && !huggingFaceKey && !geminiKey) {
      return res.status(500).json({
        success: false,
        error: "No API keys configured",
        fallbackCode: createFallbackHTML(type, prompt),
      })
    }

    // Create simple, effective prompt
    const simplePrompt = `Create a complete HTML file for: ${prompt}

Requirements:
- Single HTML file with internal CSS and JavaScript
- Responsive design
- Modern, clean interface
- Type: ${type}

Return only the HTML code, no explanations.`

    console.log(`Generating ${type} with prompt length: ${simplePrompt.length}`)

    // Try APIs in priority order: Mistral -> Hugging Face -> Gemini
    let result = null
    let usedAPI = null

    // Try Mistral first
    if (mistralKey && !result) {
      try {
        console.log("Trying Mistral...")
        result = await callMistralAPI(simplePrompt, mistralKey)
        if (result) usedAPI = "mistral"
      } catch (error) {
        console.log("Mistral failed:", error.message)
      }
    }

    // Try Hugging Face second
    if (huggingFaceKey && !result) {
      try {
        console.log("Trying Hugging Face...")
        result = await callHuggingFaceAPI(simplePrompt, huggingFaceKey)
        if (result) usedAPI = "huggingface"
      } catch (error) {
        console.log("Hugging Face failed:", error.message)
      }
    }

    // Try Gemini last
    if (geminiKey && !result) {
      try {
        console.log("Trying Gemini...")
        result = await callGeminiAPI(simplePrompt, geminiKey)
        if (result) usedAPI = "gemini"
      } catch (error) {
        console.log("Gemini failed:", error.message)
      }
    }

    if (result && result.length > 200) {
      // Clean the result
      let cleanCode = cleanHTMLResult(result)

      // Ensure it's a complete HTML document
      if (!cleanCode.toLowerCase().includes("<!doctype") && !cleanCode.toLowerCase().includes("<html")) {
        cleanCode = wrapInHTMLStructure(cleanCode, type)
      }

      console.log(`Success with ${usedAPI}: ${cleanCode.length} characters`)

      return res.status(200).json({
        success: true,
        code: cleanCode,
        type: type,
        apiUsed: usedAPI,
        timestamp: new Date().toISOString(),
        characterCount: cleanCode.length,
      })
    }

    // All APIs failed - return fallback
    console.log("All APIs failed, returning fallback")
    return res.status(200).json({
      success: true,
      code: createFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      message: "Generated using fallback template",
    })
  } catch (error) {
    console.error("Handler error:", error)

    // Return a working fallback even on error
    const { prompt = "error", type = "Website" } = req.body || {}

    return res.status(200).json({
      success: true,
      code: createFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      message: "Generated using fallback due to error",
    })
  }
}

// Simplified Mistral API call
async function callMistralAPI(prompt, apiKey) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are a web developer. Create complete HTML files with internal CSS and JavaScript. Be concise.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 8192,
    }),
  })

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// Simplified Hugging Face API call
async function callHuggingFaceAPI(prompt, apiKey) {
  const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 4096,
        temperature: 0.3,
        top_p: 0.9,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data[0]?.generated_text : data?.generated_text
}

// Simplified Gemini API call
async function callGeminiAPI(prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
}

// Clean HTML result
function cleanHTMLResult(html) {
  if (!html || typeof html !== "string") return ""

  let cleaned = html.trim()

  // Remove markdown code blocks
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.replace(/^```html\s*/, "").replace(/\s*```$/, "")
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "")
  }

  return cleaned.trim()
}

// Wrap content in HTML structure
function wrapInHTMLStructure(content, type) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      color: #333;
      background: #f5f5f5;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 1rem; 
    }
    @media (max-width: 768px) {
      .container { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
  <script>
    console.log('${type} created with MindForge AI');
  </script>
</body>
</html>`
}

// Create fallback HTML when APIs fail
function createFallbackHTML(type, prompt) {
  const typeTemplates = {
    Website: `
      <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; border-radius: 12px; margin-bottom: 2rem;">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Welcome to Our Website</h1>
        <p style="font-size: 1.2rem; opacity: 0.9;">Built with MindForge AI</p>
      </header>
      <main style="display: grid; gap: 2rem;">
        <section style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 1rem;">About Us</h2>
          <p style="color: #666; line-height: 1.6;">This website was generated based on your request: "${prompt.substring(0, 100)}..."</p>
        </section>
        <section style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 1rem;">Features</h2>
          <ul style="color: #666; line-height: 1.8;">
            <li>Responsive design</li>
            <li>Modern styling</li>
            <li>Clean layout</li>
          </ul>
        </section>
      </main>`,

    "Mobile App": `
      <div style="max-width: 375px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; text-align: center;">
          <h1 style="font-size: 1.5rem;">Mobile App</h1>
        </header>
        <main style="padding: 1rem;">
          <p style="margin-bottom: 1rem; color: #666;">App request: "${prompt.substring(0, 80)}..."</p>
          <div style="display: grid; gap: 1rem;">
            <button style="background: #667eea; color: white; border: none; padding: 1rem; border-radius: 8px; font-size: 1rem;">Get Started</button>
            <button style="background: #f8f9fa; color: #333; border: 1px solid #ddd; padding: 1rem; border-radius: 8px; font-size: 1rem;">Learn More</button>
          </div>
        </main>
      </div>`,

    Game: `
      <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 12px; text-align: center;">
        <h1 style="color: #00ff88; margin-bottom: 1rem; font-size: 2rem;">🎮 Game</h1>
        <p style="margin-bottom: 2rem; color: #ccc;">Game concept: "${prompt.substring(0, 80)}..."</p>
        <div style="background: #333; padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">Score: 0</p>
          <button style="background: #00ff88; color: #1a1a1a; border: none; padding: 1rem 2rem; border-radius: 8px; font-size: 1.1rem; cursor: pointer;" onclick="alert('Game feature coming soon!')">Start Game</button>
        </div>
      </div>`,
  }

  const template = typeTemplates[type] || typeTemplates.Website

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: #f5f5f5; 
      padding: 1rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .app { width: 100%; max-width: 800px; }
    @media (max-width: 768px) {
      body { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="app">
    ${template}
  </div>
  <script>
    console.log('${type} created with MindForge AI - Fallback version');
  </script>
</body>
</html>`
}
