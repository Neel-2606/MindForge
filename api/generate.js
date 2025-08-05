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

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid prompt is required",
      })
    }

    // Get API keys
    const mistralKey = process.env.MISTRAL_API_KEY
    const huggingFaceKey = process.env.HUGGING_FACE_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (!mistralKey && !huggingFaceKey && !geminiKey) {
      return res.status(200).json({
        success: true,
        code: createModerateFallbackHTML(type, prompt),
        type: type,
        apiUsed: "fallback",
        timestamp: new Date().toISOString(),
      })
    }

    // Create MODERATE prompt - not too basic, not too complex
    const moderatePrompt = createModeratePrompt(prompt, type)

    console.log(`Generating ${type} with moderate prompt length: ${moderatePrompt.length}`)

    // Try APIs: Mistral -> Hugging Face -> Gemini
    let result = null
    let usedAPI = null

    // Try Mistral first
    if (mistralKey && !result) {
      try {
        console.log("Trying Mistral...")
        result = await callMistralAPI(moderatePrompt, mistralKey)
        if (result) usedAPI = "mistral"
      } catch (error) {
        console.log("Mistral failed:", error.message)
      }
    }

    // Try Hugging Face second
    if (huggingFaceKey && !result) {
      try {
        console.log("Trying Hugging Face...")
        result = await callHuggingFaceAPI(moderatePrompt, huggingFaceKey)
        if (result) usedAPI = "huggingface"
      } catch (error) {
        console.log("Hugging Face failed:", error.message)
      }
    }

    // Try Gemini last
    if (geminiKey && !result) {
      try {
        console.log("Trying Gemini...")
        result = await callGeminiAPI(moderatePrompt, geminiKey)
        if (result) usedAPI = "gemini"
      } catch (error) {
        console.log("Gemini failed:", error.message)
      }
    }

    if (result && result.length > 300) {
      // Clean the result
      let cleanCode = cleanHTMLResult(result)

      // Add basic HTML structure if needed
      if (!cleanCode.toLowerCase().includes("<!doctype") && !cleanCode.toLowerCase().includes("<html")) {
        cleanCode = wrapInModerateHTMLStructure(cleanCode, type)
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

    // All APIs failed - return moderate fallback
    console.log("All APIs failed, returning moderate fallback")
    return res.status(200).json({
      success: true,
      code: createModerateFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Handler error:", error)

    const { prompt = "error", type = "Website" } = req.body || {}

    return res.status(200).json({
      success: true,
      code: createModerateFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
    })
  }
}

// MODERATE Mistral API call
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
          content:
            "You are a web developer. Create clean HTML with internal CSS and JavaScript. Make it look good but not overly complex.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 8192, // Moderate token limit
    }),
  })

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// MODERATE Hugging Face API call
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
        max_new_tokens: 4096, // Moderate token limit
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

// MODERATE Gemini API call
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
          maxOutputTokens: 8192, // Moderate token limit
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

// Create MODERATE prompts - not too simple, not too complex
function createModeratePrompt(userPrompt, projectType) {
  const typeInstructions = {
    Website: "Create a website with header, main content, and footer. Add some CSS styling and basic interactivity.",
    "Mobile App": "Create a mobile app interface with navigation and content sections. Make it touch-friendly.",
    Game: "Create a simple browser game with score display, controls, and basic game mechanics.",
    "AI Bot": "Create a chat interface with message bubbles and input field. Add some interactive features.",
    API: "Create an API documentation page with endpoints list and examples.",
    "AI Tool": "Create a tool interface with input controls and results display area.",
  }

  return `Create a complete HTML file for a ${projectType}.

Requirements:
- Single HTML file with internal CSS and JavaScript
- Responsive design that works on mobile and desktop
- Clean, modern styling with some colors and spacing
- ${typeInstructions[projectType]}

User request: ${userPrompt}

Make it look professional but not overly complex. Return only the HTML code.`
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

// Wrap content in MODERATE HTML structure
function wrapInModerateHTMLStructure(content, type) {
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
      padding: 2rem; 
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 2rem;
      margin: 1rem 0;
    }
    .btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn:hover {
      background: #0056b3;
    }
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .card { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
    </div>
  </div>
  <script>
    console.log('${type} created with MindForge AI');
  </script>
</body>
</html>`
}

// Create MODERATE fallback HTML
function createModerateFallbackHTML(type, prompt) {
  const templates = {
    Website: `
      <style>
        .header { background: #007bff; color: white; padding: 2rem; text-align: center; border-radius: 8px; margin-bottom: 2rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .feature { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
        .feature h3 { color: #007bff; margin-bottom: 1rem; }
        .cta { background: #28a745; color: white; padding: 2rem; text-align: center; border-radius: 8px; margin: 2rem 0; }
        .btn { background: white; color: #28a745; border: none; padding: 1rem 2rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
      </style>
      <div class="header">
        <h1>Welcome to Our Website</h1>
        <p>Professional web solution built with MindForge</p>
      </div>
      <div class="features">
        <div class="feature">
          <h3>🚀 Fast</h3>
          <p>Quick loading and smooth performance</p>
        </div>
        <div class="feature">
          <h3>📱 Responsive</h3>
          <p>Works great on all devices</p>
        </div>
        <div class="feature">
          <h3>🎨 Modern</h3>
          <p>Clean and professional design</p>
        </div>
      </div>
      <div class="cta">
        <h2>Your Request</h2>
        <p>"${prompt.substring(0, 100)}..."</p>
        <button class="btn" onclick="alert('Getting started!')">Get Started</button>
      </div>`,

    "Mobile App": `
      <style>
        .phone { max-width: 350px; margin: 0 auto; background: #000; padding: 10px; border-radius: 25px; }
        .screen { background: #007bff; border-radius: 15px; overflow: hidden; }
        .status { display: flex; justify-content: space-between; padding: 0.5rem 1rem; color: white; font-size: 0.9rem; }
        .app-header { background: rgba(255,255,255,0.1); color: white; padding: 1.5rem; text-align: center; }
        .content { background: #f8f9fa; padding: 1.5rem; min-height: 300px; }
        .menu-item { background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; display: flex; align-items: center; gap: 1rem; }
        .nav { display: flex; background: white; }
        .nav-item { flex: 1; padding: 1rem; text-align: center; color: #666; }
        .nav-item.active { color: #007bff; }
      </style>
      <div class="phone">
        <div class="screen">
          <div class="status">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div class="app-header">
            <h2>Mobile App</h2>
            <p>Your request: "${prompt.substring(0, 40)}..."</p>
          </div>
          <div class="content">
            <div class="menu-item">
              <span>🏠</span>
              <div>
                <h4>Home</h4>
                <p style="color: #666; font-size: 0.9rem;">Main dashboard</p>
              </div>
            </div>
            <div class="menu-item">
              <span>⚙️</span>
              <div>
                <h4>Settings</h4>
                <p style="color: #666; font-size: 0.9rem;">App preferences</p>
              </div>
            </div>
            <div class="menu-item">
              <span>📊</span>
              <div>
                <h4>Stats</h4>
                <p style="color: #666; font-size: 0.9rem;">View analytics</p>
              </div>
            </div>
          </div>
          <div class="nav">
            <div class="nav-item active">🏠</div>
            <div class="nav-item">🔍</div>
            <div class="nav-item">❤️</div>
            <div class="nav-item">👤</div>
          </div>
        </div>
      </div>`,

    Game: `
      <style>
        .game { background: #1a1a1a; color: white; padding: 2rem; border-radius: 12px; text-align: center; max-width: 500px; margin: 0 auto; }
        .game h1 { color: #00ff00; margin-bottom: 1rem; font-size: 2rem; }
        .game-area { background: #333; padding: 2rem; border-radius: 8px; margin: 1rem 0; }
        .score { display: flex; justify-content: space-around; margin: 1rem 0; }
        .score div { background: #444; padding: 1rem; border-radius: 8px; }
        .controls { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .game-btn { background: #00ff00; color: #1a1a1a; border: none; padding: 1rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .game-btn:hover { background: #00cc00; }
      </style>
      <div class="game">
        <h1>🎮 Game</h1>
        <p>Game: "${prompt.substring(0, 60)}..."</p>
        <div class="score">
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">0</div>
            <div>Score</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">1</div>
            <div>Level</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">3</div>
            <div>Lives</div>
          </div>
        </div>
        <div class="game-area">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">🎯 Ready to Play?</p>
          <p>Click Start to begin!</p>
        </div>
        <div class="controls">
          <button class="game-btn" onclick="alert('Game starting!')">Start</button>
          <button class="game-btn" onclick="alert('Instructions: Use arrow keys to play!')">Help</button>
        </div>
      </div>`,
  }

  const template = templates[type] || templates.Website

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
      background: #f0f2f5; 
      padding: 1rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .app { width: 100%; max-width: 800px; }
  </style>
</head>
<body>
  <div class="app">
    ${template}
  </div>
  <script>
    console.log('${type} created with MindForge AI - Moderate version');
  </script>
</body>
</html>`
}
