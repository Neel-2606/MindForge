export default async function handler(req, res) {
  console.log("=== MindForge Generate API Called ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Timestamp:", new Date().toISOString());

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return res.status(200).end();
  }

  // GET method for testing
  if (req.method === "GET") {
    console.log("GET request - API is working");
    return res.status(200).json({
      message: "MindForge Generate API is working!",
      timestamp: new Date().toISOString(),
      environment: {
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasMistral: !!process.env.MISTRAL_API_KEY,
        hasHuggingFace: !!process.env.HUGGING_FACE_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      usage: "Send POST request with { prompt, type } in body"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, type = "Website", preferredAPI } = req.body;
    
    console.log("Request received:", {
      promptLength: prompt?.length,
      type,
      preferredAPI,
      bodySize: req.body ? JSON.stringify(req.body).length : 0
    });

    // Validate required fields
    if (!prompt || prompt.trim().length === 0) {
      console.error("Missing or empty prompt");
      return res.status(400).json({
        error: "Missing or empty prompt",
        message: "Please provide a non-empty prompt"
      });
    }

    if (!type || !["Website", "Mobile App", "Game", "AI Tool", "API", "AI Bot"].includes(type)) {
      console.error("Invalid type:", type);
      return res.status(400).json({
        error: "Invalid type",
        message: "Type must be one of: Website, Mobile App, Game, AI Tool, API, AI Bot"
      });
    }

    // Get API keys from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const mistralApiKey = process.env.MISTRAL_API_KEY?.trim();
    const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY?.trim();

    console.log("Environment variables check:", {
      hasGemini: !!geminiApiKey,
      hasMistral: !!mistralApiKey,
      hasHuggingFace: !!huggingFaceApiKey,
      geminiLength: geminiApiKey?.length || 0,
      mistralLength: mistralApiKey?.length || 0,
      huggingFaceLength: huggingFaceApiKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    // Check if at least one API key is available
    if (!geminiApiKey && !mistralApiKey && !huggingFaceApiKey) {
      console.error("No API keys found in environment variables");
      return res.status(500).json({
        error: "No API keys configured",
        message: "Please add at least one API key to your Vercel environment variables",
        needed: ["GEMINI_API_KEY", "MISTRAL_API_KEY", "HUGGING_FACE_API_KEY"],
        help: "Visit https://vercel.com/docs/projects/environment-variables to learn how to add environment variables"
      });
    }

    // Create enhanced prompt for better output
    const enhancedPrompt = createEnhancedPrompt(prompt, type);
    
    // Determine API priority
    const apiPriority = [];
    
    // Add preferred API first if specified and available
    if (preferredAPI && preferredAPI === "mistral" && mistralApiKey) {
      apiPriority.push("mistral");
    } else if (preferredAPI && preferredAPI === "gemini" && geminiApiKey) {
      apiPriority.push("gemini");
    } else if (preferredAPI && preferredAPI === "huggingface" && huggingFaceApiKey) {
      apiPriority.push("huggingface");
    }
    
    // Add remaining available APIs in order of preference
    if (mistralApiKey && !apiPriority.includes("mistral")) {
      apiPriority.push("mistral");
    }
    if (huggingFaceApiKey && !apiPriority.includes("huggingface")) {
      apiPriority.push("huggingface");
    }
    if (geminiApiKey && !apiPriority.includes("gemini")) {
      apiPriority.push("gemini");
    }

    console.log("API selection:", { apiPriority });

    // Try APIs in order
    const errors = [];
    let lastResult = null;

    for (const apiName of apiPriority) {
      try {
        console.log(`Attempting generation with ${apiName.toUpperCase()} API...`);
        
        let result;
        
        switch (apiName) {
          case "mistral":
            result = await generateWithMistral(enhancedPrompt, mistralApiKey);
            break;
          case "huggingface":
            result = await generateWithHuggingFace(enhancedPrompt, huggingFaceApiKey);
            break;
          case "gemini":
            result = await generateWithGemini(enhancedPrompt, geminiApiKey);
            break;
          default:
            continue;
        }

        if (result && typeof result === 'string' && result.trim().length > 100) {
          // Clean and enhance the generated code
          let cleanedOutput = result.trim();
          
          // Remove markdown code blocks if present
          if (cleanedOutput.startsWith("```html")) {
            cleanedOutput = cleanedOutput.replace(/^```html\s*/, "").replace(/\s*```$/, "");
          } else if (cleanedOutput.startsWith("```")) {
            cleanedOutput = cleanedOutput.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }
          
          // Ensure proper HTML structure
          if (!cleanedOutput.toLowerCase().startsWith("<!doctype") && 
              !cleanedOutput.toLowerCase().startsWith("<!doctype html")) {
            cleanedOutput = createFullHTMLStructure(cleanedOutput, type, apiName);
          }
          
          console.log(`✅ Successfully generated ${type} with ${apiName.toUpperCase()} (${cleanedOutput.length} characters)`);
          
          // Return success response
          return res.status(200).json({
            success: true,
            code: cleanedOutput,
            type: type,
            apiUsed: apiName,
            timestamp: new Date().toISOString(),
            characterCount: cleanedOutput.length,
            prompt: prompt.substring(0, 100) + "..."
          });
        } else {
          const errorMsg = `${apiName}: Generated content too short (${result?.length || 0} chars) or not a string`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          lastResult = result;
        }
      } catch (error) {
        const errorMsg = `${apiName.toUpperCase()} API error: ${error.message}`;
        console.error(errorMsg, { stack: error.stack });
        errors.push(errorMsg);
        continue;
      }
    }

    // All APIs failed - return comprehensive error with fallback
    console.error("All APIs failed to generate content", errors);
    
    const fallbackHTML = createFallbackHTML(type, prompt, apiPriority, errors);
    
    return res.status(500).json({
      success: false,
      error: "All APIs failed to generate content",
      availableAPIs: apiPriority,
      errors: errors,
      fallbackCode: fallbackHTML,
      debug: {
        prompt: prompt.substring(0, 100) + "...",
        type: type,
        preferredAPI: preferredAPI,
        finalPriority: apiPriority,
        lastResult: lastResult ? String(lastResult).substring(0, 200) + "..." : "No result"
      },
      help: "Check your API keys and ensure they have sufficient quota. Visit https://console.gemini.google.com/, https://console.mistral.ai/, or https://huggingface.co/settings/tokens to verify your API keys."
    });
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      help: "An unexpected error occurred. Check your Vercel logs for more details."
    });
  }
}

// Mistral AI API integration with enhanced error handling
async function generateWithMistral(prompt, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
  
  try {
    console.log("🤖 Calling Mistral API...");
    
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "MindForge/2.0",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "You are an expert full-stack developer with 15+ years of experience creating extraordinary, production-ready web applications. Focus on quality, modern design, and exceptional user experience. Generate complete, standalone HTML files with internal CSS and JavaScript."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 16384,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Mistral API error: ${result.error.message || JSON.stringify(result.error)}`);
    }
    
    const content = result?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from Mistral API");
    }
    
    console.log(`✅ Mistral API success: ${content.length} characters`);
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      throw new Error("Mistral API request timed out after 45 seconds");
    }
    
    console.error("❌ Mistral API error:", error.message);
    throw error;
  }
}

// Hugging Face API integration with multiple model fallbacks
async function generateWithHuggingFace(prompt, apiKey) {
  const models = [
    "mistralai/Mistral-7B-Instruct-v0.2",
    "meta-llama/Llama-2-70b-chat-hf",
    "google/gemma-7b-it",
    "bigcode/starcoder",
    "facebook/blenderbot-400M-distill"
  ];
  
  let lastError;
  
  for (const model of models) {
    try {
      console.log(`🤗 Trying Hugging Face model: ${model}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "MindForge/2.0",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 4096,
            temperature: 0.4,
            top_p: 0.9,
            do_sample: true,
            repetition_penalty: 1.1,
            length_penalty: 1.0,
            no_repeat_ngram_size: 3,
          },
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Hugging Face API HTTP ${response.status} (${model}): ${errorText}`);
        continue;
      }
      
      const result = await response.json();
      
      if (result.error) {
        lastError = new Error(`Hugging Face API error (${model}): ${result.error}`);
        continue;
      }
      
      const generatedText = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
      
      if (generatedText && generatedText.trim().length > 100) {
        console.log(`✅ Hugging Face success with ${model}: ${generatedText.length} characters`);
        return generatedText;
      }
      
      lastError = new Error(`Generated text too short from ${model}: ${generatedText?.length || 0} chars`);
    } catch (error) {
      if (error.name === "AbortError") {
        lastError = new Error(`Hugging Face API timeout (${model})`);
      } else {
        lastError = error;
      }
      console.error(`❌ Hugging Face ${model} error:`, error.message);
      continue;
    }
  }
  
  throw lastError || new Error("All Hugging Face models failed");
}

// Gemini API integration with enhanced configuration
async function generateWithGemini(prompt, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  try {
    console.log("🔮 Calling Gemini API...");
    
    const requestBody = {
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
        candidateCount: 1,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "MindForge/2.0",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      },
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Gemini API error: ${result.error.message || JSON.stringify(result.error)}`);
    }
    
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content returned from Gemini API");
    }
    
    console.log(`✅ Gemini API success: ${content.length} characters`);
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      throw new Error("Gemini API request timed out after 45 seconds");
    }
    
    console.error("❌ Gemini API error:", error.message);
    throw error;
  }
}

// Enhanced prompt creation with comprehensive requirements
function createEnhancedPrompt(userPrompt, projectType) {
  const basePrompt = `You are an expert full-stack developer with 15+ years of experience creating extraordinary, production-ready web applications. You specialize in modern web technologies and create stunning, functional applications that exceed expectations.
CRITICAL TASK: Generate a complete, standalone ${projectType} using ONLY HTML with internal CSS and JavaScript.
ABSOLUTE REQUIREMENTS:
1. Create a SINGLE HTML file with everything included (no external dependencies)
2. Use <style> tag for all CSS (no external stylesheets)
3. Use <script> tag for all JavaScript (no external scripts)
4. Make it fully responsive and mobile-first
5. Use modern CSS techniques (CSS Grid, Flexbox, Custom Properties, Animations)
6. Include interactive features and smooth animations
7. Use a beautiful, modern design with excellent UX/UI
8. Ensure the code is clean, well-commented, and production-ready
9. Include proper error handling and loading states
10. Optimize for performance and accessibility
PROJECT TYPE: ${projectType}
USER REQUEST: ${userPrompt}
DESIGN REQUIREMENTS:
- Use modern color schemes with gradients and shadows
- Implement smooth transitions and micro-interactions
- Add hover effects and visual feedback
- Use modern typography with proper hierarchy
- Include loading animations and skeleton screens
- Make it feel premium and polished
TECHNICAL REQUIREMENTS:
- Use semantic HTML5 elements
- Implement proper meta tags and viewport settings
- Add ARIA labels for accessibility
- Use CSS custom properties for theming
- Include responsive breakpoints (mobile, tablet, desktop)
- Add proper error boundaries and fallbacks
- Optimize for Core Web Vitals
OUTPUT FORMAT:
- Output ONLY the complete HTML code
- Do not include explanations or markdown
- Start with <!DOCTYPE html>
- Include comprehensive comments in the code
- Ensure all functionality works out of the box
Generate an extraordinary ${projectType} that will impress users with its quality, functionality, and design:`;
  
  // Add type-specific enhancements
  const typeSpecificEnhancements = {
    Website: `
WEBSITE-SPECIFIC REQUIREMENTS:
- Create a multi-section landing page with hero, features, about, and contact
- Include navigation with smooth scrolling
- Add call-to-action buttons with hover effects
- Implement a contact form with validation
- Use modern card layouts and grid systems
- Include testimonials or portfolio sections
- Add social media integration elements
- Implement dark/light mode toggle
- Include search functionality if relevant
- Add newsletter signup with email validation`,
    "Mobile App": `
MOBILE APP-SPECIFIC REQUIREMENTS:
- Design for touch interactions and mobile gestures
- Include bottom navigation or tab bar
- Add pull-to-refresh functionality
- Implement swipe gestures for navigation
- Use mobile-optimized forms and inputs
- Include offline functionality indicators
- Add haptic feedback simulation
- Implement mobile-first responsive design
- Include app-like loading states
- Add mobile-specific animations and transitions`,
    Game: `
GAME-SPECIFIC REQUIREMENTS:
- Create engaging gameplay mechanics
- Include score tracking and leaderboards
- Add sound effects and visual feedback
- Implement game state management
- Include multiple difficulty levels
- Add power-ups or special abilities
- Create smooth game animations
- Include game over and restart functionality
- Add tutorial or instructions
- Implement save/load game state`,
    "AI Bot": `
AI BOT-SPECIFIC REQUIREMENTS:
- Create a conversational interface
- Include message bubbles and typing indicators
- Add user input validation and processing
- Implement response generation simulation
- Include conversation history
- Add quick reply buttons
- Create smooth message animations
- Include bot avatar and personality
- Add conversation export functionality
- Implement voice input simulation`,
    API: `
API-SPECIFIC REQUIREMENTS:
- Create a comprehensive API documentation interface
- Include interactive endpoint testing
- Add request/response examples
- Implement authentication demonstration
- Include rate limiting indicators
- Add API status monitoring
- Create endpoint explorer with search
- Include code snippet generation
- Add API key management interface
- Implement request history tracking`,
    "AI Tool": `
AI TOOL-SPECIFIC REQUIREMENTS:
- Create specialized AI functionality interface
- Include input preprocessing and validation
- Add result visualization and formatting
- Implement batch processing capabilities
- Include export functionality (JSON, CSV, etc.)
- Add progress indicators and loading states
- Create result comparison features
- Include tool configuration options
- Add usage analytics and statistics
- Implement result sharing functionality`,
  };
  
  const typeEnhancement = typeSpecificEnhancements[projectType] || "";
  return basePrompt + typeEnhancement;
}

// Create full HTML structure when needed
function createFullHTMLStructure(content, type, apiUsed) {
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${type} generated by MindForge AI">
    <meta name="keywords" content="${type.toLowerCase()}, web development, AI generated">
    <meta name="author" content="MindForge AI">
    <title>${type} - MindForge AI</title>
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --accent-color: #f093fb;
            --text-color: #333;
            --bg-color: #fff;
            --shadow: 0 10px 30px rgba(0,0,0,0.1);
            --border-radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            min-height: 100vh;
            overflow-x: hidden;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @media (max-width: 768px) {
            :root { --border-radius: 8px; }
            .container { padding: 15px; }
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        button:focus, input:focus, textarea:focus, select:focus {
            outline: 2px solid var(--accent-color);
            outline-offset: 2px;
        }
    </style></head><body>
    <div class="container">
        <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin-bottom: 10px;">🎉 ${type} Generated Successfully!</h1>
            <p style="color: rgba(255,255,255,0.8);">Created by MindForge AI using ${apiUsed.toUpperCase()}</p>
        </header>
        <main>
            ${content}
        </main>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Add smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
            // Add intersection observer for animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            document.querySelectorAll('section, .card, .feature, .container').forEach(el => {
                observer.observe(el);
            });
            // Enhanced error handling
            window.addEventListener('error', function(e) {
                console.error('Application error:', e.error);
            });
            // Performance monitoring
            if ('performance' in window) {
                window.addEventListener('load', function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                });
            }
        });
    </script></body></html>`;
}

// Create comprehensive fallback HTML
function createFallbackHTML(type, prompt, availableAPIs, errors) {
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${type} - MindForge Fallback</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 20px; opacity: 0.9; }
        .error { 
            background: rgba(255,0,0,0.2); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
            text-align: left;
            font-size: 0.9em;
        }
        .retry-btn {
            background: #00fff0;
            color: #000;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 16px;
        }
        .retry-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,255,240,0.4);
        }
        .info { 
            background: rgba(255,255,255,0.1); 
            padding: 15px; 
            border-radius: 10px; 
            margin: 15px 0; 
            text-align: left;
            font-size: 0.9em;
        }
    </style></head><body>
    <div class="container">
        <h1>🚀 ${type}</h1>
        <p>Your ${type.toLowerCase()} is ready to be built!</p>
        <div class="error">
            <h3>⚠️ Generation Status</h3>
            <p><strong>Issue:</strong> All AI APIs encountered problems during generation.</p>
            <p><strong>Original Request:</strong> ${prompt.substring(0, 150)}${prompt.length > 150 ? "..." : ""}</p>
        </div>
        <div class="info">
            <h4>📊 Debug Information</h4>
            <p><strong>Available APIs:</strong> ${availableAPIs.join(", ") || "None"}</p>
            <p><strong>Errors:</strong></p>
            <ul style="margin-left: 20px; margin-top: 5px;">
                ${errors.map((error) => `<li>${error}</li>`).join("")}
            </ul>
        </div>
        <button class="retry-btn" onclick="location.reload()">🔄 Try Again</button>
        <div style="margin-top: 20px; font-size: 0.8em; opacity: 0.7;">
            <p>💡 Tip: Check your environment variables and API quotas</p>
            <p>🔧 Need help? Visit our documentation at https://mind-forge-five.vercel.app/</p>
        </div>
    </div>
    <script>
        document.querySelector('.retry-btn').addEventListener('click', function() {
            this.textContent = '🔄 Retrying...';
            this.disabled = true;
            setTimeout(() => location.reload(), 1000);
        });
        // Add fade-in animation
        document.querySelector('.container').style.animation = 'fadeIn 1s ease-in';
        // Add CSS for fade-in
        const style = document.createElement('style');
        style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }';
        document.head.appendChild(style);
    </script></body></html>`;
}