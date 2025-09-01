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
      message: "MindForge AI is working with FREE APIs!",
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
        hasGroq: !!process.env.GROQ_API_KEY,
        version: "2.0.0",
        models: ["claude-3.5-sonnet (free)", "llama-3.1-70b (free)"]
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

    // 🔒 ENHANCED MODERATION
    const bannedWords = [
      "sex", "porn", "nude", "nsfw", "drugs", "weapon", "violence", "kill", "murder",
      "terrorist", "rape", "blood", "gore", "suicide", "abuse", "adult", "xxx", "hentai",
      "hack", "exploit", "malware", "virus"
    ];
    const lowerPrompt = prompt.toLowerCase();
    const foundBanned = bannedWords.find(word => lowerPrompt.includes(word));

    if (foundBanned) {
      return res.status(400).json({
        success: false,
        error: `Inappropriate content detected: "${foundBanned}" is not allowed.`,
      });
    }

    // Get API keys - prioritize free options
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!openRouterKey && !groqKey) {
      return res.status(200).json({
        success: true,
        code: createAdvancedFallbackHTML(type, prompt),
        type: type,
        apiUsed: "fallback",
        timestamp: new Date().toISOString(),
        message: "No free API keys configured. Using advanced fallback."
      })
    }

    // Create advanced prompt
    const advancedPrompt = createAdvancedPrompt(prompt, type)

    console.log(`Generating ${type} with free AI APIs...`)

    let result = null
    let usedAPI = null

    // Try OpenRouter first (free Claude access)
    if (openRouterKey && !result) {
      try {
        console.log("Trying OpenRouter (Free Claude)...")
        result = await callOpenRouterAPI(advancedPrompt, openRouterKey)
        if (result) usedAPI = "openrouter-claude"
      } catch (error) {
        console.log("OpenRouter failed:", error.message)
      }
    }

    // Try Groq as backup (free high-speed)
    if (groqKey && !result) {
      try {
        console.log("Trying Groq (Free)...")
        result = await callGroqAPI(advancedPrompt, groqKey)
        if (result) usedAPI = "groq-llama"
      } catch (error) {
        console.log("Groq failed:", error.message)
      }
    }

    if (result && result.length > 500) {
      // Clean and enhance the result
      let cleanCode = cleanHTMLResult(result)

      // Ensure proper HTML structure
      if (!cleanCode.toLowerCase().includes("<!doctype") && !cleanCode.toLowerCase().includes("<html")) {
        cleanCode = wrapInAdvancedHTMLStructure(cleanCode, type)
      }

      console.log(`✅ Success with ${usedAPI}: ${cleanCode.length} characters`)

      return res.status(200).json({
        success: true,
        code: cleanCode,
        type: type,
        apiUsed: usedAPI,
        timestamp: new Date().toISOString(),
        characterCount: cleanCode.length,
        model: usedAPI
      })
    }

    // All APIs failed - return advanced fallback
    console.log("All free APIs failed, returning advanced fallback")
    return res.status(200).json({
      success: true,
      code: createAdvancedFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Handler error:", error)

    const { prompt = "error", type = "Website" } = req.body || {}

    return res.status(200).json({
      success: true,
      code: createAdvancedFallbackHTML(type, prompt),
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
}

// 🆓 FREE OpenRouter API call (Free Claude access)
async function callOpenRouterAPI(prompt, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://mindforge.vercel.app",
      "X-Title": "MindForge AI"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        {
          role: "system",
          content: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications with:

🎨 DESIGN EXCELLENCE:
- Modern, clean, and visually appealing interfaces
- Responsive design that works perfectly on all devices
- Professional color schemes and typography
- Smooth animations and transitions
- Intuitive user experience

💻 TECHNICAL EXCELLENCE:
- Clean, semantic HTML5 structure
- Modern CSS3 with Flexbox/Grid layouts
- Vanilla JavaScript with ES6+ features
- Cross-browser compatibility
- Performance optimized code
- Accessibility best practices

🚀 ADVANCED FEATURES:
- Interactive components and functionality
- Local storage for data persistence
- Form validation and user feedback
- Loading states and error handling
- Progressive enhancement
- Mobile-first responsive design

Always return complete, production-ready HTML files with embedded CSS and JavaScript. Make it look professional and modern, not basic or template-like.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 8192
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// 🆓 FREE Groq API call (High-speed inference)
async function callGroqAPI(prompt, apiKey) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications with advanced features, responsive design, and clean code. Always return complete HTML files with embedded CSS and JavaScript.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 8192
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// 🚀 Create ADVANCED prompts for Claude Sonnet
function createAdvancedPrompt(userPrompt, projectType) {
  const typeInstructions = {
    Website: `Create a modern, professional website with:
- Hero section with compelling visuals
- Navigation with smooth scrolling
- Feature sections with cards/grids
- Contact/CTA sections
- Footer with social links
- Animations and hover effects
- Mobile-first responsive design`,
    
    "Mobile App": `Create a mobile app interface with:
- Native-like UI components
- Touch-friendly interactions
- Bottom navigation or tab bar
- Card-based layouts
- Swipe gestures support
- Loading states and transitions
- iOS/Android design patterns`,
    
    Game: `Create an interactive browser game with:
- Game canvas or grid system
- Score tracking and levels
- Keyboard/touch controls
- Game state management
- Sound effects (optional)
- Pause/restart functionality
- Responsive game area`,
    
    "AI Bot": `Create an AI chat interface with:
- Message bubbles with timestamps
- Typing indicators
- Auto-scroll to latest message
- Input validation
- Message history
- Dark/light theme toggle
- Responsive chat layout`,
    
    API: `Create an API documentation site with:
- Interactive endpoint explorer
- Code examples in multiple languages
- Authentication guides
- Response schemas
- Try-it-now functionality
- Search and filtering
- Professional developer experience`,
    
    "AI Tool": `Create an AI-powered tool with:
- Clean input/output interface
- Real-time processing indicators
- Result visualization
- Export/download options
- Settings and preferences
- Usage analytics display
- Professional dashboard layout`
  }

  return `Create a complete, production-ready HTML file for a ${projectType}.

🎯 PROJECT REQUIREMENTS:
${typeInstructions[projectType]}

📝 USER REQUEST: "${userPrompt}"

🎨 DESIGN STANDARDS:
- Modern, clean, and professional appearance
- Consistent color scheme and typography
- Smooth animations and micro-interactions
- Intuitive user experience
- Mobile-first responsive design
- Accessibility compliant (WCAG 2.1)

💻 TECHNICAL REQUIREMENTS:
- Single HTML file with embedded CSS and JavaScript
- Modern CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- Cross-browser compatible
- Performance optimized
- SEO-friendly structure

🚀 ADVANCED FEATURES TO INCLUDE:
- Interactive components
- Form validation (if applicable)
- Local storage for user preferences
- Loading states and error handling
- Keyboard navigation support
- Touch/gesture support for mobile

Return ONLY the complete HTML code. Make it look like a professional, modern application that users would actually want to use.`
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

// 🚀 Wrap content in ADVANCED HTML structure
function wrapInAdvancedHTMLStructure(content, type) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge AI</title>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --secondary: #f1f5f9;
      --accent: #06b6d4;
      --text: #1e293b;
      --text-light: #64748b;
      --bg: #ffffff;
      --bg-alt: #f8fafc;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.6; 
      color: var(--text);
      background: linear-gradient(135deg, var(--bg-alt) 0%, var(--secondary) 100%);
      min-height: 100vh;
    }
    
    .mindforge-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 2rem; 
    }
    
    .mindforge-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--bg);
      border-radius: 16px;
      box-shadow: var(--shadow);
    }
    
    .mindforge-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    
    .mindforge-header p {
      color: var(--text-light);
      font-size: 1.1rem;
    }
    
    .mindforge-content {
      background: var(--bg);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      padding: 3rem;
      margin: 2rem 0;
      position: relative;
      overflow: hidden;
    }
    
    .mindforge-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }
    
    .btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: var(--shadow);
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .mindforge-container { padding: 1rem; }
      .mindforge-content { padding: 2rem; }
      .mindforge-header h1 { font-size: 2rem; }
    }
    
    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .mindforge-content {
      animation: fadeInUp 0.6s ease-out;
    }
  </style>
</head>
<body>
  <div class="mindforge-container">
    <div class="mindforge-header">
      <h1>🚀 ${type} Generated</h1>
      <p>Powered by Claude Sonnet & MindForge AI</p>
    </div>
    <div class="mindforge-content">
      ${content}
    </div>
  </div>
  <script>
    console.log('✨ ${type} created with MindForge AI v2.0 + Claude Sonnet');
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
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

// 🚀 Create ADVANCED fallback HTML
function createAdvancedFallbackHTML(type, prompt) {
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
    console.log('✨ ${type} created with MindForge AI v2.0 - Advanced Fallback');
  </script>
</body>
</html>`
}
