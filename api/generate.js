export default async function handler(req, res) {
  console.log("=== MINDFORGE API ===")
  console.log("Method:", req.method, "Time:", new Date().toISOString())

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "MindForge API is working!",
      environment: {
        hasMistral: !!process.env.MISTRAL_API_KEY,
        hasHuggingFace: !!process.env.HUGGING_FACE_API_KEY,
        hasGemini: !!process.env.GEMINI_API_KEY,
      },
      status: "ready",
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt, type = "Website" } = req.body

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // Get API keys
    const mistralKey = process.env.MISTRAL_API_KEY?.trim()
    const huggingFaceKey = process.env.HUGGING_FACE_API_KEY?.trim()
    const geminiKey = process.env.GEMINI_API_KEY?.trim()

    if (!mistralKey && !huggingFaceKey && !geminiKey) {
      return res.status(500).json({ error: "No API keys configured" })
    }

    // Create optimized prompt (much shorter)
    const optimizedPrompt = createOptimizedPrompt(prompt, type)

    // API priority: Mistral → Hugging Face → Gemini
    const apis = []
    if (mistralKey) apis.push({ name: "mistral", key: mistralKey })
    if (huggingFaceKey) apis.push({ name: "huggingface", key: huggingFaceKey })
    if (geminiKey) apis.push({ name: "gemini", key: geminiKey })

    console.log(
      "Trying APIs in order:",
      apis.map((a) => a.name),
    )

    // Try each API
    for (const api of apis) {
      try {
        console.log(`Trying ${api.name}...`)
        let result

        switch (api.name) {
          case "mistral":
            result = await generateWithMistral(optimizedPrompt, api.key)
            break
          case "huggingface":
            result = await generateWithHuggingFace(optimizedPrompt, api.key)
            break
          case "gemini":
            result = await generateWithGemini(optimizedPrompt, api.key)
            break
        }

        if (result && result.length > 500) {
          // Clean the result
          let cleanCode = result.trim()

          // Remove markdown code blocks
          if (cleanCode.startsWith("```html")) {
            cleanCode = cleanCode.replace(/^```html\s*/, "").replace(/\s*```$/, "")
          } else if (cleanCode.startsWith("```")) {
            cleanCode = cleanCode.replace(/^```\s*/, "").replace(/\s*```$/, "")
          }

          // Ensure proper HTML structure
          if (!cleanCode.toLowerCase().includes("<!doctype")) {
            cleanCode = addBasicHTMLStructure(cleanCode, type)
          }

          console.log(`✅ Success with ${api.name}: ${cleanCode.length} chars`)

          return res.status(200).json({
            success: true,
            code: cleanCode,
            type: type,
            apiUsed: api.name,
            timestamp: new Date().toISOString(),
            characterCount: cleanCode.length,
          })
        }
      } catch (error) {
        console.error(`${api.name} failed:`, error.message)
        continue
      }
    }

    // All APIs failed
    return res.status(500).json({
      success: false,
      error: "All APIs failed to generate content",
      fallbackCode: createSimpleFallback(type, prompt),
    })
  } catch (error) {
    console.error("Handler error:", error)
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    })
  }
}

// Optimized Mistral API call
async function generateWithMistral(prompt, apiKey) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)

  try {
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
              "You are an expert web developer. Create complete, standalone HTML files with internal CSS and JavaScript. Make them responsive and modern.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 16384,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const result = await response.json()
    return result?.choices?.[0]?.message?.content
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Optimized Hugging Face API call
async function generateWithHuggingFace(prompt, apiKey) {
  const models = [
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "codellama/CodeLlama-34b-Instruct-hf",
    "meta-llama/Llama-2-70b-chat-hf",
  ]

  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
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
            do_sample: true,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        const text = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text
        if (text && text.length > 500) {
          return text
        }
      }
    } catch (error) {
      console.error(`HF model ${model} failed:`, error.message)
      continue
    }
  }

  throw new Error("All Hugging Face models failed")
}

// Optimized Gemini API call
async function generateWithGemini(prompt, apiKey) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)

  try {
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
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 16384,
          },
        }),
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    return result?.candidates?.[0]?.content?.parts?.[0]?.text
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Create much shorter, more effective prompts
function createOptimizedPrompt(userPrompt, projectType) {
  const typeInstructions = {
    Website: "Create a modern, responsive website with navigation, hero section, and footer.",
    "Mobile App": "Create a mobile-first app interface with touch-friendly navigation and smooth animations.",
    Game: "Create an interactive browser game with controls, scoring, and game mechanics.",
    "AI Bot": "Create a chat interface with message bubbles, input field, and conversation history.",
    API: "Create an API documentation interface with endpoints, examples, and testing tools.",
    "AI Tool": "Create a specialized tool interface with input controls, processing, and results display.",
  }

  return `Create a complete, standalone HTML file for a ${projectType}.

Requirements:
- Single HTML file with internal CSS and JavaScript
- Responsive design that works on all devices
- Modern, clean UI with smooth animations
- ${typeInstructions[projectType] || "Professional interface with good UX"}

User Request: ${userPrompt}

Generate ONLY the complete HTML code, no explanations.`
}

// Add basic HTML structure if missing
function addBasicHTMLStructure(content, type) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    @media (max-width: 768px) {
      .container {
        padding: 0.5rem;
      }
    }
  </style>
</head>
<body>
  ${content}
  <script>
    console.log('${type} created with MindForge AI');
  </script>
</body>
</html>`
}

// Simple fallback when all APIs fail
function createSimpleFallback(type, prompt) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MindForge - Generation Error</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 2rem;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #2a2a2a;
      padding: 2rem;
      border-radius: 12px;
    }
    h1 { color: #ff006e; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; opacity: 0.8; }
    .retry-btn {
      background: #3a86ff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Generation Failed</h1>
    <p>Unable to generate your ${type} at this time.</p>
    <p>Request: ${prompt.substring(0, 100)}...</p>
    <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>`
}
