import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const createFallbackHTML = (prompt, type) => {
  const typeTemplates = {
    Website: `
      <style>
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 16px; margin-bottom: 3rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
        .hero p { font-size: 1.3rem; opacity: 0.9; margin-bottom: 2rem; }
        .cta-btn { background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; }
        .cta-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .feature-card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); }
        .feature-icon { font-size: 3rem; margin-bottom: 1rem; }
        .feature-card h3 { color: #333; margin-bottom: 1rem; font-size: 1.5rem; }
        .feature-card p { color: #666; line-height: 1.6; }
      </style>
      <header class="hero">
        <h1>Welcome to Our Platform</h1>
        <p>Built with cutting-edge technology and modern design principles</p>
        <button class="cta-btn" onclick="alert('Getting started!')">Get Started</button>
      </header>
      <main>
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Fast Performance</h3>
            <p>Lightning-fast loading times and smooth interactions for the best user experience.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile First</h3>
            <p>Fully responsive design that works perfectly on all devices and screen sizes.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Modern Design</h3>
            <p>Beautiful, clean interface with attention to detail and user experience.</p>
          </div>
        </div>
        <section style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 3rem; border-radius: 16px; text-align: center; margin: 3rem 0;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">Your Request</h2>
          <p style="font-size: 1.1rem; opacity: 0.9;">"${prompt.substring(0, 150)}..."</p>
        </section>
      </main>`,

    "Mobile App": `
      <style>
        .phone-frame { max-width: 375px; margin: 0 auto; background: #000; padding: 8px; border-radius: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .screen { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 22px; overflow: hidden; }
        .status-bar { display: flex; justify-content: space-between; padding: 0.5rem 1rem; color: white; font-size: 0.9rem; font-weight: 500; }
        .app-header { background: rgba(255,255,255,0.1); color: white; padding: 1.5rem 1rem; text-align: center; backdrop-filter: blur(10px); }
        .app-content { background: #f8f9fa; padding: 1.5rem; min-height: 400px; }
        .feature-list { display: grid; gap: 1rem; margin: 1rem 0; }
        .feature-item { background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
        .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .bottom-nav { display: flex; background: white; border-top: 1px solid #eee; }
        .nav-item { flex: 1; padding: 1rem; text-align: center; color: #666; cursor: pointer; transition: all 0.3s ease; }
        .nav-item.active { color: #667eea; background: rgba(102, 126, 234, 0.1); }
      </style>
      <div class="phone-frame">
        <div class="screen">
          <div class="status-bar">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div class="app-header">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Mobile App</h1>
            <p style="opacity: 0.9;">Your request: "${prompt.substring(0, 60)}..."</p>
          </div>
          <div class="app-content">
            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-icon">🏠</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Home</h4>
                  <p style="color: #666; font-size: 0.9rem;">Main dashboard</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚙️</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Settings</h4>
                  <p style="color: #666; font-size: 0.9rem;">App preferences</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Analytics</h4>
                  <p style="color: #666; font-size: 0.9rem;">View statistics</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom-nav">
            <div class="nav-item active">🏠</div>
            <div class="nav-item">🔍</div>
            <div class="nav-item">❤️</div>
            <div class="nav-item">👤</div>
          </div>
        </div>
      </div>`,

    Game: `
      <style>
        .game-container { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 2rem; border-radius: 20px; text-align: center; max-width: 600px; margin: 0 auto; }
        .game-header { margin-bottom: 2rem; }
        .game-title { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #00ff88, #00ccff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .game-area { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 3rem; margin: 2rem 0; border: 2px solid rgba(255,255,255,0.1); }
        .score-board { display: flex; justify-content: space-around; margin-bottom: 2rem; }
        .score-item { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; backdrop-filter: blur(10px); }
        .score-value { font-size: 2rem; font-weight: bold; color: #00ff88; }
        .game-controls { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .game-btn { background: linear-gradient(135deg, #00ff88, #00ccff); color: #1e3c72; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
        .game-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,255,136,0.3); }
        .game-btn.secondary { background: rgba(255,255,255,0.2); color: white; }
      </style>
      <div class="game-container">
        <div class="game-header">
          <h1 class="game-title">🎮 Game Zone</h1>
          <p style="opacity: 0.9; font-size: 1.1rem;">Game concept: "${prompt.substring(0, 80)}..."</p>
        </div>
        <div class="score-board">
          <div class="score-item">
            <div class="score-value">0</div>
            <div>Score</div>
          </div>
          <div class="score-item">
            <div class="score-value">1</div>
            <div>Level</div>
          </div>
          <div class="score-item">
            <div class="score-value">3</div>
            <div>Lives</div>
          </div>
        </div>
        <div class="game-area">
          <p style="font-size: 1.3rem; margin-bottom: 1rem;">🎯 Ready to Play?</p>
          <p style="opacity: 0.8;">Click Start to begin your adventure!</p>
        </div>
        <div class="game-controls">
          <button class="game-btn" onclick="startGame()">Start Game</button>
          <button class="game-btn secondary" onclick="showInstructions()">Instructions</button>
          <button class="game-btn secondary" onclick="showHighScores()">High Scores</button>
        </div>
      </div>
      <script>
        function startGame() { alert('🎮 Game starting soon! Get ready!'); }
        function showInstructions() { alert('📖 Use arrow keys to move, space to jump!'); }
        function showHighScores() { alert('🏆 Your best score: 0 points'); }
      </script>`,
  }

  return typeTemplates[type] || `<p>No template available for ${type}</p>`
}

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
        fallbackCode: createEnhancedFallbackHTML(type, prompt),
      })
    }

    // Create enhanced prompt for better design
    const enhancedPrompt = createEnhancedPrompt(prompt, type)

    console.log(`Generating ${type} with enhanced prompt length: ${enhancedPrompt.length}`)

    // Try APIs in priority order: Mistral -> Hugging Face -> Gemini
    let result = null
    let usedAPI = null

    // Try Mistral first
    if (mistralKey && !result) {
      try {
        console.log("Trying Mistral...")
        result = await callMistralAPI(enhancedPrompt, mistralKey)
        if (result) usedAPI = "mistral"
      } catch (error) {
        console.log("Mistral failed:", error.message)
      }
    }

    // Try Hugging Face second
    if (huggingFaceKey && !result) {
      try {
        console.log("Trying Hugging Face...")
        result = await callHuggingFaceAPI(enhancedPrompt, huggingFaceKey)
        if (result) usedAPI = "huggingface"
      } catch (error) {
        console.log("Hugging Face failed:", error.message)
      }
    }

    // Try Gemini last
    if (geminiKey && !result) {
      try {
        console.log("Trying Gemini...")
        result = await callGeminiAPI(enhancedPrompt, geminiKey)
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
        cleanCode = wrapInEnhancedHTMLStructure(cleanCode, type)
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

    // All APIs failed - return enhanced fallback
    console.log("All APIs failed, returning enhanced fallback")
    return res.status(200).json({
      success: true,
      code: createEnhancedFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      message: "Generated using enhanced fallback template",
    })
  } catch (error) {
    console.error("Handler error:", error)

    // Return a working fallback even on error
    const { prompt = "error", type = "Website" } = req.body || {}

    return res.status(200).json({
      success: true,
      code: createEnhancedFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      message: "Generated using fallback due to error",
    })
  }
}

// Enhanced Mistral API call with better system prompt
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
            "You are an expert web developer who creates beautiful, modern, responsive websites. You specialize in clean HTML with internal CSS and JavaScript. Your designs are professional, visually appealing, and user-friendly with smooth animations and modern styling.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 12288,
    }),
  })

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// Enhanced Hugging Face API call
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
        max_new_tokens: 6144,
        temperature: 0.4,
        top_p: 0.9,
        do_sample: true,
        repetition_penalty: 1.1,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data[0]?.generated_text : data?.generated_text
}

// Enhanced Gemini API call
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
          temperature: 0.4,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 12288,
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

// Create enhanced prompts for better design output
function createEnhancedPrompt(userPrompt, projectType) {
  const typeSpecificInstructions = {
    Website: `Create a modern, professional website with:
- Hero section with gradient background and call-to-action
- Navigation menu with smooth scrolling
- Feature cards with icons and hover effects
- Contact/footer section
- Responsive grid layout`,

    "Mobile App": `Create a mobile app interface with:
- App-like design with phone frame styling
- Bottom navigation or tab bar
- Card-based content layout
- Touch-friendly buttons and interactions
- Status bar and mobile-optimized spacing`,

    Game: `Create an interactive browser game with:
- Game area with score display
- Control buttons and game mechanics
- Visual feedback and animations
- Start/pause/reset functionality
- Gaming-themed colors and styling`,

    "AI Bot": `Create a chat bot interface with:
- Message bubbles for conversation
- Input field with send button
- Chat history display
- Typing indicators and animations
- Modern messaging app styling`,

    API: `Create an API documentation interface with:
- Endpoint list with methods (GET, POST, etc.)
- Request/response examples
- Interactive testing interface
- Code snippets and documentation
- Developer-friendly layout`,

    "AI Tool": `Create an AI tool interface with:
- Input controls and configuration options
- Processing/loading states
- Results display area
- Export/download functionality
- Professional tool-like design`,
  }

  return `Create a complete, standalone HTML file for a ${projectType}.

DESIGN REQUIREMENTS:
- Single HTML file with internal CSS and JavaScript only
- Modern, professional design with gradients and shadows
- Responsive layout that works on all screen sizes
- Smooth animations and hover effects (0.3s transitions)
- Clean typography with proper font hierarchy
- Interactive elements with JavaScript functionality
- ${typeSpecificInstructions[projectType]}

STYLING GUIDELINES:
- Use CSS Grid and Flexbox for layouts
- Add subtle box-shadows and border-radius (8-16px)
- Include hover effects and micro-interactions
- Use modern color schemes (avoid basic colors)
- Add loading states and visual feedback
- Ensure 44px minimum touch targets for mobile

USER REQUEST: ${userPrompt}

Generate ONLY the complete HTML code with internal CSS and JavaScript. Make it visually appealing and professional.`
}

// Clean HTML result (same as before)
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

// Enhanced HTML structure wrapper
function wrapInEnhancedHTMLStructure(content, type) {
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
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 2rem; 
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      padding: 2rem;
      margin: 1rem 0;
      transition: transform 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .card { padding: 1.5rem; }
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
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  </script>
</body>
</html>`
}

// Enhanced fallback HTML templates
function createEnhancedFallbackHTML(type, prompt) {
  const typeTemplates = {
    Website: `
      <style>
        .hero { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 4rem 2rem; 
          text-align: center; 
          border-radius: 20px; 
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .hero h1 { 
          font-size: 3.5rem; 
          margin-bottom: 1rem; 
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .hero p { 
          font-size: 1.3rem; 
          opacity: 0.9; 
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }
        .cta-btn { 
          background: rgba(255,255,255,0.2); 
          color: white; 
          border: 2px solid rgba(255,255,255,0.3); 
          padding: 1.2rem 2.5rem; 
          border-radius: 50px; 
          font-size: 1.1rem; 
          cursor: pointer; 
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .cta-btn:hover { 
          background: rgba(255,255,255,0.3); 
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .features { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 2rem; 
          margin: 3rem 0; 
        }
        .feature-card { 
          background: white; 
          padding: 2.5rem; 
          border-radius: 20px; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
          transition: all 0.3s ease;
          text-align: center;
        }
        .feature-card:hover { 
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .feature-icon { 
          font-size: 3.5rem; 
          margin-bottom: 1.5rem;
          display: block;
        }
        .feature-card h3 { 
          color: #333; 
          margin-bottom: 1rem; 
          font-size: 1.6rem;
          font-weight: 600;
        }
        .feature-card p { 
          color: #666; 
          line-height: 1.7;
          font-size: 1.1rem;
        }
        .request-section {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          margin: 3rem 0;
          position: relative;
          overflow: hidden;
        }
        .request-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .request-section h2 {
          font-size: 2.2rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }
        .request-section p {
          font-size: 1.2rem;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
      </style>
      <header class="hero">
        <h1>🚀 Welcome to Our Platform</h1>
        <p>Built with cutting-edge technology and modern design principles</p>
        <button class="cta-btn" onclick="alert('🎉 Getting started with your journey!')">Get Started</button>
      </header>
      <main>
        <div class="features">
          <div class="feature-card">
            <span class="feature-icon">⚡</span>
            <h3>Lightning Fast</h3>
            <p>Experience blazing-fast performance with optimized loading times and smooth interactions for the ultimate user experience.</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">📱</span>
            <h3>Mobile First</h3>
            <p>Fully responsive design that adapts beautifully to all devices and screen sizes, ensuring perfect functionality everywhere.</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🎨</span>
            <h3>Modern Design</h3>
            <p>Beautiful, clean interface with attention to detail, smooth animations, and user experience that delights and engages.</p>
          </div>
        </div>
        <section class="request-section">
          <h2>✨ Your Custom Request</h2>
          <p>"${prompt.substring(0, 200)}${prompt.length > 200 ? "..." : ""}"</p>
        </section>
      </main>`,

    "Mobile App": `
      <style>
        .phone-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 2rem;
        }
        .phone-frame { 
          width: 375px; 
          background: linear-gradient(145deg, #1e1e1e, #2a2a2a); 
          padding: 12px; 
          border-radius: 35px; 
          box-shadow: 0 25px 80px rgba(0,0,0,0.4);
          position: relative;
        }
        .phone-frame::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 6px;
          background: #333;
          border-radius: 3px;
        }
        .screen { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          border-radius: 25px; 
          overflow: hidden;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
        }
        .status-bar { 
          display: flex; 
          justify-content: space-between; 
          padding: 0.8rem 1.5rem; 
          color: white; 
          font-size: 0.9rem; 
          font-weight: 600;
          background: rgba(0,0,0,0.1);
        }
        .app-header { 
          background: rgba(255,255,255,0.15); 
          color: white; 
          padding: 2rem 1.5rem; 
          text-align: center; 
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .app-content { 
          background: #f8f9fa; 
          padding: 2rem 1.5rem; 
          min-height: 450px; 
        }
        .feature-list { 
          display: grid; 
          gap: 1.5rem; 
          margin: 1.5rem 0; 
        }
        .feature-item { 
          background: white; 
          padding: 1.5rem; 
          border-radius: 16px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
          display: flex; 
          align-items: center; 
          gap: 1.5rem;
          transition: all 0.3s ease;
        }
        .feature-item:hover {
          transform: translateX(8px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        .feature-icon { 
          width: 50px; 
          height: 50px; 
          background: linear-gradient(135deg, #667eea, #764ba2); 
          border-radius: 15px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-size: 1.5rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .bottom-nav { 
          display: flex; 
          background: white; 
          border-top: 1px solid #eee;
          box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
        }
        .nav-item { 
          flex: 1; 
          padding: 1.2rem; 
          text-align: center; 
          color: #999; 
          cursor: pointer; 
          transition: all 0.3s ease;
          font-size: 1.5rem;
        }
        .nav-item.active { 
          color: #667eea; 
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.1);
        }
        .nav-item:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }
      </style>
      <div class="phone-container">
        <div class="phone-frame">
          <div class="screen">
            <div class="status-bar">
              <span>9:41</span>
              <span>🔋 100%</span>
            </div>
            <div class="app-header">
              <h1 style="font-size: 1.8rem; margin-bottom: 0.5rem; font-weight: 700;">📱 Mobile App</h1>
              <p style="opacity: 0.9; font-size: 1rem;">Your request: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"</p>
            </div>
            <div class="app-content">
              <div class="feature-list">
                <div class="feature-item">
                  <div class="feature-icon">🏠</div>
                  <div>
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #333;">Home Dashboard</h4>
                    <p style="color: #666; font-size: 0.95rem;">Your personalized main screen</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">⚙️</div>
                  <div>
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #333;">Settings & Preferences</h4>
                    <p style="color: #666; font-size: 0.95rem;">Customize your app experience</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📊</div>
                  <div>
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #333;">Analytics & Insights</h4>
                    <p style="color: #666; font-size: 0.95rem;">Track your progress and statistics</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🔔</div>
                  <div>
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #333;">Smart Notifications</h4>
                    <p style="color: #666; font-size: 0.95rem;">Stay updated with important alerts</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bottom-nav">
              <div class="nav-item active">🏠</div>
              <div class="nav-item">🔍</div>
              <div class="nav-item">❤️</div>
              <div class="nav-item">👤</div>
            </div>
          </div>
        </div>
      </div>`,

    Game: `
      <style>
        .game-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          padding: 1rem;
        }
        .game-container { 
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); 
          color: white; 
          padding: 3rem; 
          border-radius: 25px; 
          text-align: center; 
          max-width: 700px; 
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }
        .game-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="rgba(255,255,255,0.03)"/></svg>');
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }
        .game-header { 
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }
        .game-title { 
          font-size: 3rem; 
          margin-bottom: 1rem; 
          background: linear-gradient(45deg, #00ff88, #00ccff); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent;
          font-weight: 800;
          text-shadow: 0 0 30px rgba(0,255,136,0.5);
        }
        .game-area { 
          background: rgba(0,0,0,0.4); 
          border-radius: 20px; 
          padding: 3rem; 
          margin: 2rem 0; 
          border: 2px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }
        .score-board { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem; 
        }
        .score-item { 
          background: rgba(255,255,255,0.15); 
          padding: 1.5rem; 
          border-radius: 15px; 
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .score-item:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-5px);
        }
        .score-value { 
          font-size: 2.5rem; 
          font-weight: bold; 
          color: #00ff88;
          text-shadow: 0 0 20px rgba(0,255,136,0.5);
        }
        .score-label {
          font-size: 1rem;
          opacity: 0.9;
          margin-top: 0.5rem;
        }
        .game-controls { 
          display: flex; 
          gap: 1.5rem; 
          justify-content: center; 
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .game-btn { 
          background: linear-gradient(135deg, #00ff88, #00ccff); 
          color: #1e3c72; 
          border: none; 
          padding: 1.2rem 2.5rem; 
          border-radius: 50px; 
          font-size: 1.1rem; 
          font-weight: bold; 
          cursor: pointer; 
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(0,255,136,0.3);
        }
        .game-btn:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 15px 40px rgba(0,255,136,0.4);
          filter: brightness(1.1);
        }
        .game-btn.secondary { 
          background: rgba(255,255,255,0.2); 
          color: white;
          box-shadow: 0 8px 25px rgba(255,255,255,0.1);
        }
        .game-btn.secondary:hover {
          background: rgba(255,255,255,0.3);
          box-shadow: 0 15px 40px rgba(255,255,255,0.2);
        }
      </style>
      <div class="game-wrapper">
        <div class="game-container">
          <div class="game-header">
            <h1 class="game-title">🎮 Game Arena</h1>
            <p style="opacity: 0.9; font-size: 1.2rem; margin-bottom: 1rem;">Epic Gaming Experience</p>
            <p style="opacity: 0.8; font-size: 1rem;">Game concept: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}"</p>
          </div>
          <div class="score-board">
            <div class="score-item">
              <div class="score-value">0</div>
              <div class="score-label">Score</div>
            </div>
            <div class="score-item">
              <div class="score-value">1</div>
              <div class="score-label">Level</div>
            </div>
            <div class="score-item">
              <div class="score-value">3</div>
              <div class="score-label">Lives</div>
            </div>
            <div class="score-item">
              <div class="score-value">00:00</div>
              <div class="score-label">Time</div>
            </div>
          </div>
          <div class="game-area">
            <p style="font-size: 1.5rem; margin-bottom: 1.5rem;">🎯 Ready for Action?</p>
            <p style="opacity: 0.8; font-size: 1.1rem;">Click Start to begin your epic gaming adventure!</p>
          </div>
          <div class="game-controls">
            <button class="game-btn" onclick="startGame()">🚀 Start Game</button>
            <button class="game-btn secondary" onclick="showInstructions()">📖 Instructions</button>
            <button class="game-btn secondary" onclick="showHighScores()">🏆 High Scores</button>
          </div>
        </div>
      </div>
      <script>
        function startGame() { 
          alert('🎮 Game starting! Get ready for an amazing experience!'); 
          // Add game start logic here
        }
        function showInstructions() { 
          alert('📖 Game Instructions:\\n\\n• Use arrow keys to move\\n• Space bar to jump/action\\n• Collect items for points\\n• Avoid obstacles\\n• Have fun!'); 
        }
        function showHighScores() { 
          alert('🏆 High Scores:\\n\\n1. Player1: 15,420 pts\\n2. Player2: 12,850 pts\\n3. You: 0 pts\\n\\nTime to beat the record!'); 
        }
      </script>`,
  }

  const template = typeTemplates[type] || typeTemplates.Website

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      min-height: 100vh;
      color: #333;
    }
    @media (max-width: 768px) {
      body { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  ${template}
  <script>
    console.log('${type} created with MindForge AI - Enhanced version');
  </script>
</body>
</html>`
}
