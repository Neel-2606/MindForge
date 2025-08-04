export default async function handler(req, res) {
  console.log("=== MINDFORGE NEXT-LEVEL GENERATION API ===");
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
      message: "MindForge Next-Level Generation API is working!",
      timestamp: new Date().toISOString(),
      environment: {
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasMistral: !!process.env.MISTRAL_API_KEY,
        hasHuggingFace: !!process.env.HUGGING_FACE_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      capabilities: [
        "Advanced HTML/CSS/JS generation",
        "Modern design with animations",
        "Responsive layouts",
        "Interactive features",
        "Accessibility and SEO"
      ],
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
        console.log(`Attempting next-level generation with ${apiName.toUpperCase()} API...`);
        
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

        if (result && typeof result === 'string' && result.trim().length > 1000) {
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
          
          // Add next-level enhancements
          cleanedOutput = addNextLevelEnhancements(cleanedOutput, type);
          
          console.log(`🚀 Next-level success: Generated ${type} with ${apiName.toUpperCase()} (${cleanedOutput.length} characters)`);
          
          // Return success response
          return res.status(200).json({
            success: true,
            code: cleanedOutput,
            type: type,
            apiUsed: apiName,
            timestamp: new Date().toISOString(),
            characterCount: cleanedOutput.length,
            wordCount: cleanedOutput.split(/\s+/).length,
            lineCount: cleanedOutput.split('\n').length,
            prompt: prompt.substring(0, 100) + "...",
            features: getNextLevelFeatures(type)
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
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  try {
    console.log("🤖 Calling Mistral API...");
    
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "MindForge/NextLevel/2.5",
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
        max_tokens: 32768,
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
      throw new Error("Mistral API request timed out after 60 seconds");
    }
    
    console.error("❌ Mistral API error:", error.message);
    throw error;
  }
}

// Hugging Face API integration with multiple model fallbacks
async function generateWithHuggingFace(prompt, apiKey) {
  const models = [
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "meta-llama/Llama-2-70b-chat-hf",
    "google/gemma-7b-it",
    "bigcode/starcoder2-15b",
    "codellama/CodeLlama-34b-Instruct-hf"
  ];
  
  let lastError;
  
  for (const model of models) {
    try {
      console.log(`🤗 Trying Hugging Face model: ${model}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "MindForge/NextLevel/2.5",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 8192,
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
      
      if (generatedText && generatedText.trim().length > 1000) {
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
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
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
        maxOutputTokens: 32768,
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
          "User-Agent": "MindForge/NextLevel/2.5",
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
      throw new Error("Gemini API request timed out after 60 seconds");
    }
    
    console.error("❌ Gemini API error:", error.message);
    throw error;
  }
}

// Create enhanced prompt with comprehensive requirements
function createEnhancedPrompt(userPrompt, projectType) {
  const basePrompt = `You are an elite full-stack developer with 20+ years of experience creating groundbreaking, production-ready web applications. You specialize in cutting-edge technologies and create revolutionary applications that redefine user experience.
CRITICAL TASK: Generate a complete, standalone ${projectType} using ONLY HTML with internal CSS and JavaScript.
ABSOLUTE NEXT-LEVEL REQUIREMENTS:
1. Create a SINGLE HTML file with everything included (no external dependencies)
2. Use <style> tag for all CSS (no external stylesheets)
3. Use <script> tag for all JavaScript (no external scripts)
4. Make it fully responsive and mobile-first with adaptive layouts
5. Use advanced CSS techniques (CSS Grid, Flexbox, Custom Properties, Animations, Transitions)
6. Include complex interactive features and smooth animations
7. Use a beautiful, modern design with excellent UX/UI and micro-interactions
8. Ensure the code is clean, well-commented, and production-ready
9. Include proper error handling, loading states, and offline functionality
10. Optimize for performance, accessibility, and SEO
PROJECT TYPE: ${projectType}
USER REQUEST: ${userPrompt}
NEXT-LEVEL DESIGN REQUIREMENTS:
- Use modern color schemes with gradients, shadows, and glass morphism
- Implement smooth transitions, physics-based animations, and micro-interactions
- Add hover effects, focus states, and visual feedback
- Use modern typography with proper hierarchy and variable fonts
- Include skeleton screens and loading animations
- Make it feel premium, polished, and revolutionary
- Implement dark/light mode with automatic detection
- Add parallax effects and scroll animations
- Include 3D transforms and perspective effects
- Use SVG animations and filters
NEXT-LEVEL TECHNICAL REQUIREMENTS:
- Use semantic HTML5 elements with ARIA roles
- Implement proper meta tags, viewport settings, and structured data
- Add comprehensive ARIA labels and keyboard navigation
- Use CSS custom properties for theming and dynamic updates
- Include responsive breakpoints (mobile, tablet, desktop, widescreen)
- Add proper error boundaries, fallbacks, and graceful degradation
- Optimize for Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
- Implement lazy loading for images and non-critical content
- Add resource hints (preconnect, prefetch, preload)
- Include service worker for offline functionality
- Implement web vitals monitoring
OUTPUT FORMAT:
- Output ONLY the complete HTML code
- Do not include explanations or markdown
- Start with <!DOCTYPE html>
- Include comprehensive comments in the code
- Ensure all functionality works out of the box
- Target 90+ scores on Lighthouse performance, accessibility, SEO, and best practices
Generate a NEXT-LEVEL ${projectType} that will revolutionize the web with its quality, functionality, design, and performance:`

  // Add type-specific enhancements
  const typeSpecificEnhancements = {
    Website: `
NEXT-LEVEL WEBSITE-SPECIFIC REQUIREMENTS:
- Create a multi-section landing page with hero, features, about, testimonials, pricing, and contact
- Include smooth scrolling navigation with active section highlighting
- Add call-to-action buttons with hover effects and micro-interactions
- Implement a contact form with validation, error handling, and success states
- Use modern card layouts with hover effects, animations, and 3D transforms
- Include testimonials with carousel/slider functionality
- Add portfolio sections with filtering and lightbox functionality
- Implement social media integration with sharing functionality
- Add dark/light mode toggle with persistent preference
- Include search functionality with autocomplete
- Add newsletter signup with email validation and success animation
- Implement parallax scrolling effects
- Add scroll-triggered animations
- Include accessibility panel with font size, contrast, and reading mode controls
- Add language localization support
- Implement analytics tracking (client-side only)
- Add cookie consent banner with preferences
- Include sitemap and robots.txt meta tags
- Add Open Graph and Twitter Card meta tags`,

    "Mobile App": `
NEXT-LEVEL MOBILE APP-SPECIFIC REQUIREMENTS:
- Design for touch interactions and mobile gestures (swipe, pinch, tap, hold)
- Include bottom navigation or tab bar with smooth transitions
- Add pull-to-refresh functionality with custom animation
- Implement swipe gestures for navigation and actions
- Use mobile-optimized forms with appropriate input types
- Include offline functionality indicators and sync status
- Add haptic feedback simulation for user actions
- Implement mobile-first responsive design with adaptive layouts
- Include app-like loading states and skeleton screens
- Add mobile-specific animations and transitions
- Implement gesture-based navigation
- Add biometric authentication simulation
- Include push notification simulation
- Add camera and media capture simulation
- Implement geolocation features
- Add vibration API simulation
- Include battery status simulation
- Add network connectivity detection
- Implement local notifications simulation
- Add voice input simulation`,

    Game: `
NEXT-LEVEL GAME-SPECIFIC REQUIREMENTS:
- Create engaging gameplay mechanics with physics simulation
- Include score tracking, high scores, and leaderboards with local storage
- Add sound effects and visual feedback with Web Audio API
- Implement game state management with pause, resume, and save/load
- Include multiple difficulty levels with adaptive AI
- Add power-ups, special abilities, and combos
- Create smooth game animations with requestAnimationFrame
- Include game over and restart functionality with animations
- Add tutorial or instructions with interactive walkthrough
- Implement save/load game state with local storage
- Add achievements system with unlock animations
- Include level progression with unlockable content
- Add particle effects and explosions
- Implement procedural generation
- Add multiplayer simulation with local storage
- Include difficulty scaling
- Add visual effects (blur, glow, distortion)
- Implement camera effects (shake, zoom, follow)
- Add time-based challenges
- Include resource management
- Add inventory system`,

    "AI Bot": `
NEXT-LEVEL AI BOT-SPECIFIC REQUIREMENTS:
- Create a conversational interface with message bubbles and typing indicators
- Include user input validation and processing with error states
- Add response generation simulation with thinking animations
- Implement conversation history with search and filtering
- Add quick reply buttons with animations
- Create smooth message animations and transitions
- Include bot avatar with expressions and animations
- Add conversation export functionality (text, PDF, JSON)
- Implement voice input and output simulation
- Include message reactions and editing
- Add file attachment simulation
- Implement conversation threading
- Add read receipts and delivery status
- Include typing indicators for multiple participants
- Add message search and filtering
- Implement conversation tagging
- Add auto-suggestions and predictive text
- Include sentiment analysis simulation
- Add language translation simulation
- Implement conversation analytics`,

    API: `
NEXT-LEVEL API-SPECIFIC REQUIREMENTS:
- Create a comprehensive API documentation interface with interactive testing
- Include endpoint explorer with search, filtering, and categorization
- Add request/response examples with code snippets in multiple languages
- Implement authentication demonstration with OAuth flow simulation
- Include rate limiting indicators and reset timers
- Add API status monitoring with uptime statistics
- Create endpoint testing with request builder
- Include code snippet generation in multiple languages
- Add API key management interface with creation and revocation
- Implement request history tracking with search
- Add response validation and schema validation
- Include error code documentation with examples
- Implement webhook simulation
- Add API versioning interface
- Include rate limit visualization
- Add usage analytics and statistics
- Implement team collaboration features
- Add environment management (dev, staging, prod)
- Include API change logs
- Add security scanning simulation
- Implement performance monitoring`,

    "AI Tool": `
NEXT-LEVEL AI TOOL-SPECIFIC REQUIREMENTS:
- Create specialized AI functionality interface with advanced controls
- Include input preprocessing and validation with error states
- Add result visualization with charts, graphs, and animations
- Implement batch processing capabilities with progress tracking
- Include export functionality (JSON, CSV, PDF, PNG)
- Add progress indicators and loading states with animations
- Create result comparison features with side-by-side views
- Include tool configuration options with presets
- Add usage analytics and statistics with visualizations
- Implement result sharing functionality with social media
- Add collaboration features with shared workspaces
- Include version history and rollback
- Add template library with customization
- Implement workflow automation
- Add conditional logic and branching
- Include data validation and cleansing
- Add integration simulation with other tools
- Implement API connectivity simulation
- Add custom scripting support
- Include AI model selection and tuning`,
  };
  
  const typeEnhancement = typeSpecificEnhancements[projectType] || "";
  return basePrompt + typeEnhancement;
}

