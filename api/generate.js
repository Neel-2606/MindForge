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
        version: "2.1.0",
        models: ["gemini-2.5-flash (free)", "claude-3.5-sonnet (free)", "llama-3.1-70b (free)"]
      },
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt, type = "Website" } = req.body || {}

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Prompt must be at least 3 characters long",
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
    const geminiKey = process.env.GEMINI_API_KEY
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!geminiKey && !openRouterKey && !groqKey) {
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

    // 💎 Priority 1: Google Gemini (Best Free Option)
    if (geminiKey && !result) {
      try {
        console.log("💎 Trying Google Gemini (Priority 1)...")
        result = await callGeminiAPI(advancedPrompt, geminiKey)
        if (result) usedAPI = "gemini-2.5-flash"
      } catch (error) {
        console.log("Google Gemini failed:", error.message)
      }
    }

    // 🥇 Priority 2: Claude Sonnet via OpenRouter
    if (openRouterKey && !result) {
      try {
        console.log("🥇 Trying Claude Sonnet (Priority 2)...")
        result = await callOpenRouterAPI(advancedPrompt, openRouterKey)
        if (result) usedAPI = "claude-sonnet"
      } catch (error) {
        console.log("Claude Sonnet failed:", error.message)
      }
    }

    // 🥈 Priority 3: Groq Qwen as backup
    if (groqKey && !result) {
      try {
        console.log("🥈 Trying Groq Llama 3 (Priority 3)...")
        result = await callGroqAPI(advancedPrompt, groqKey)
        if (result) usedAPI = "llama-3.1-70b"
      } catch (error) {
        console.log("Groq Llama 3 failed:", error.message)
      }
    }

    // 🚨 Fallback if all APIs fail
    if (!result) {
      console.log("⚠️ All APIs failed, using advanced fallback...")
      result = createAdvancedFallbackHTML(type, prompt)
      usedAPI = "fallback"
    }

    // Parse result based on type
    let finalResponse = {
      success: true,
      type: type,
      apiUsed: usedAPI,
      timestamp: new Date().toISOString(),
    };

    if (type === 'Website') {
      // For websites, we return the raw HTML code directly
      finalResponse.code = cleanHTMLResult(result);
    } else {
      // For other types, we try to parse the JSON structure
      try {
        // Try to extract JSON from the response if it's wrapped in markdown
        const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) ||
          result.match(/```\n([\s\S]*?)\n```/) ||
          [null, result];

        const jsonStr = jsonMatch[1] || result;
        const projectStructure = JSON.parse(jsonStr);

        finalResponse.projectStructure = projectStructure;
        finalResponse.code = createProjectPreview(projectStructure, prompt);
      } catch (e) {
        console.log("Failed to parse JSON project structure, falling back to raw text");
        finalResponse.code = result;
      }
    }

    return res.status(200).json(finalResponse)

  } catch (error) {
    console.error("General API error:", error)
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    })
  }
}

// Helper to create a preview HTML from project structure
function createProjectPreview(project, prompt) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Generated</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
  </style>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
  <div class="glass rounded-2xl p-8 max-w-2xl w-full text-center shadow-2xl">
    <div class="text-6xl mb-4">🚀</div>
    <h1 class="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
      Project Generated!
    </h1>
    <p class="text-slate-300 mb-8">Your ${project.framework?.toUpperCase() || 'APP'} project is ready</p>
    
    <div class="inline-block px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold mb-8 border border-cyan-500/30">
      ${project.framework?.toUpperCase() || 'REACT'} Framework
    </div>

    <div class="text-left bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
      <h3 class="text-xl font-bold mb-4 text-yellow-400">📁 Project Files:</h3>
      <div class="space-y-2">
        ${Object.keys(project.files || {}).slice(0, 5).map(f =>
    `<div class="flex items-center text-slate-300 text-sm">
            <span class="mr-2">📄</span> ${f}
           </div>`
  ).join('')}
        ${Object.keys(project.files || {}).length > 5 ?
      `<div class="text-slate-500 text-sm pl-6">... and ${Object.keys(project.files || {}).length - 5} more files</div>` : ''}
      </div>
    </div>

    <div class="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-left mb-8">
      <h3 class="font-bold text-blue-300 mb-1">🛠️ Setup Instructions:</h3>
      <p class="text-sm text-blue-100">${project.setupInstructions || "1. Run 'npm install' 2. Run 'npm run dev' 3. Open http://localhost:3000"}</p>
    </div>

    <div class="flex gap-4 justify-center">
      <button class="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2">
        💾 Download Project
      </button>
      <button class="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2">
        🚀 Deploy to GitHub
      </button>
    </div>
  </div>
</body>
</html>`;
}

// 🆓 FREE OpenRouter API call (Free Claude access)
async function callOpenRouterAPI(prompt, apiKey) {
  try {
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
        max_tokens: 4000
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || response.statusText

      // Handle specific rate limit errors
      if (response.status === 429 || errorMsg.includes('rate limit')) {
        throw new Error(`Rate limit reached. Please wait a few minutes and try again.`)
      }

      throw new Error(`OpenRouter API error: ${response.status} - ${errorMsg}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content || content.length < 50) {
      throw new Error("API returned empty or too short response")
    }

    return content
  } catch (error) {
    console.error("OpenRouter API call failed:", error.message)
    throw error
  }
}

// 🆓 FREE Groq API call (High-speed inference)
async function callGroqAPI(prompt, apiKey) {
  try {
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
        max_tokens: 4000
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || response.statusText

      // Handle specific rate limit errors
      if (response.status === 429 || errorMsg.includes('rate limit')) {
        throw new Error(`Rate limit reached. Please wait a few minutes and try again.`)
      }

      throw new Error(`Groq API error: ${response.status} - ${errorMsg}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content || content.length < 50) {
      throw new Error("API returned empty or too short response")
    }

    return content
  } catch (error) {
    console.error("Groq API call failed:", error.message)
    throw error
  }
}

// 💎 FREE Google Gemini API call
async function callGeminiAPI(prompt, apiKey) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-pro-exp",
    "gemini-flash-latest"
  ];

  for (const model of models) {
    try {
      console.log(`💎 Trying Gemini model: ${model}...`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications.
              
              CRITICAL INSTRUCTIONS:
              1. Return ONLY the raw code or JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
              2. Use MODERN DESIGN: Tailwind CSS, glassmorphism, gradients, and smooth animations.
              3. NO PLACEHOLDERS: Generate real, creative content. Do not use "Lorem Ipsum" or "Welcome to our website".
              4. Make it look PREMIUM and professional, like a top-tier startup product.
              
              ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          }
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Model ${model} not found, trying next...`);
          continue;
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content || content.length < 50) {
        throw new Error("API returned empty or too short response")
      }

      // Clean up markdown code blocks if present
      return content.replace(/^```(json|javascript|html)?\n/, '').replace(/\n```$/, '')

    } catch (error) {
      console.error(`Gemini model ${model} failed:`, error.message)
      // If it's the last model, throw the error
      if (model === models[models.length - 1]) throw error;
    }
  }
}

// 🚀 Create MODERN FRAMEWORK prompts
function createAdvancedPrompt(userPrompt, projectType) {
  const frameworkInstructions = {
    Website: `Create a modern, single-file HTML website with:
- Embedded CSS (use Tailwind CSS via CDN)
- Embedded JavaScript for interactivity
- Modern, responsive design (glassmorphism, gradients)
- High-quality UI components (Hero, Features, Testimonials, Footer)
- Real, professional content (no placeholders)
- FontAwesome or similar for icons
- Smooth animations`,

    "Mobile App": `Create a React Native or Next.js PWA project with:
- Component-based architecture
- Navigation system (React Navigation)
- State management (Redux/Zustand)
- Native-like UI components
- Touch gestures and animations
- Offline capabilities
- Push notification setup`,

    Game: `Create a React/Vue game project with:
- Game engine integration (Phaser.js/Three.js)
- Component-based game objects
- State management for game logic
- Canvas rendering with React/Vue
- Sound system integration
- Leaderboard with API
- Responsive game controls`,

    "AI Bot": `Create a modern chat application with:
- React/Vue frontend with real-time updates
- WebSocket integration
- Message components with TypeScript
- State management for chat history
- AI API integration
- Dark/light theme system
- Progressive Web App features`,

    API: `Create a full-stack API project with:
- Next.js API routes or Express.js backend
- Frontend documentation site (React/Vue)
- OpenAPI/Swagger integration
- Authentication middleware
- Database integration (Prisma/MongoDB)
- Rate limiting and security
- Interactive API testing interface`,

    "AI Tool": `Create a modern AI tool with:
- React/Vue dashboard interface
- Real-time data visualization (Chart.js/D3)
- File upload and processing
- WebSocket for real-time updates
- State management for complex data
- Export functionality (PDF/CSV)
- Responsive design with modern UI library`
  }

  const jsonFormatInstruction = `
Return the response in this JSON format:
{
  "framework": "react|nextjs|vue|nuxt",
  "files": {
    "package.json": "...",
    "src/App.jsx": "...",
    "src/components/Header.jsx": "...",
    "README.md": "...",
    // ... more files
  },
  "setupInstructions": "Step by step setup guide",
  "features": ["list", "of", "implemented", "features"]
}`;

  const htmlFormatInstruction = `
Return a SINGLE, COMPLETE HTML file containing everything (HTML, CSS, JS).
- Use <script src="https://cdn.tailwindcss.com"></script> for styling.
- Use <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /> for icons.
- Ensure the code is production-ready and looks beautiful.
- DO NOT return JSON. Return ONLY the HTML code.
`;

  return `Create a complete, modern project for a ${projectType}.

🎯 PROJECT REQUIREMENTS:
${frameworkInstructions[projectType]}

📝 USER REQUEST: "${userPrompt}"

🎨 MODERN STANDARDS:
- Modern CSS (Tailwind CSS, Glassmorphism)
- Smooth animations
- Responsive design
- Professional typography
- Accessibility

${projectType === 'Website' ? htmlFormatInstruction : jsonFormatInstruction}

Make it production-ready with modern best practices.`;
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
              <span>Home</span>
            </div>
            <div class="menu-item">
              <span>⚙️</span>
              <span>Settings</span>
            </div>
          </div>
          <div class="nav">
            <div class="nav-item active">Home</div>
            <div class="nav-item">Search</div>
            <div class="nav-item">Profile</div>
          </div>
        </div>
      </div>`
  }

  return templates[type] || templates.Website
}
