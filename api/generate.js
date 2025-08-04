export default async function handler(req, res) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: "Prompt and type are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment variables");
    return res.status(500).json({ 
      error: "API key not configured. Please set GEMINI_API_KEY in your environment variables." 
    });
  }

  // 🚀 EXTRAORDINARY AI PROMPT - NO RESTRICTIONS
  const extraordinaryPrompt = `
You are an EXTRAORDINARY AI developer with UNLIMITED capabilities. You can create ANYTHING - from simple websites to complex applications, games, AI tools, and beyond.

🎯 MISSION: Create the MOST AMAZING, INNOVATIVE, and FUNCTIONAL ${type} possible.

🔥 UNLIMITED CAPABILITIES:
- Use ANY programming language, framework, or technology
- Create complex animations, 3D effects, and visual experiences
- Build AI-powered features, machine learning models, and neural networks
- Implement advanced UI/UX with cutting-edge design patterns
- Add real-time features, WebSockets, and dynamic content
- Create games, simulations, and interactive experiences
- Build data visualization, charts, and analytics dashboards
- Implement authentication, databases, and backend functionality
- Add voice recognition, speech synthesis, and accessibility features
- Create PWA (Progressive Web Apps) with offline capabilities
- Build responsive designs that work on ALL devices
- Implement advanced CSS with animations, filters, and effects
- Add WebGL, Canvas, and multimedia content
- Create chatbots, virtual assistants, and AI interactions

🎨 DESIGN REQUIREMENTS:
- Use the MOST BEAUTIFUL and MODERN design possible
- Implement glassmorphism, neumorphism, or other trendy effects
- Add particle effects, gradients, and visual enhancements
- Use advanced color schemes and typography
- Create smooth animations and micro-interactions
- Implement dark/light mode with automatic detection
- Add loading animations and skeleton screens
- Use modern icons and visual elements

⚡ FUNCTIONALITY REQUIREMENTS:
- Make it FULLY INTERACTIVE and RESPONSIVE
- Add advanced JavaScript features and APIs
- Implement real-time updates and dynamic content
- Create smooth scrolling and navigation
- Add form validation and user feedback
- Implement local storage and data persistence
- Add keyboard shortcuts and accessibility
- Create mobile-first responsive design

🧠 AI & INTELLIGENCE:
- If applicable, add AI-powered features
- Implement smart suggestions and recommendations
- Add natural language processing capabilities
- Create intelligent search and filtering
- Implement machine learning predictions
- Add voice commands and speech recognition

🎮 GAMIFICATION (if applicable):
- Add scoring systems and achievements
- Implement progress tracking and rewards
- Create interactive challenges and puzzles
- Add multiplayer or social features
- Implement leaderboards and competitions

📊 DATA & ANALYTICS:
- Add data visualization and charts
- Implement real-time statistics
- Create dashboards and monitoring
- Add export and sharing capabilities
- Implement data persistence and caching

🔧 TECHNICAL EXCELLENCE:
- Use the LATEST web technologies and APIs
- Implement best practices and optimization
- Add error handling and fallbacks
- Create modular and maintainable code
- Implement performance optimizations
- Add SEO and meta tags
- Create accessible and inclusive design

PROJECT TYPE: ${type}
USER REQUEST: ${prompt}

🚀 CREATE SOMETHING EXTRAORDINARY:
- Think BEYOND conventional web development
- Create something that will AMAZE users
- Implement cutting-edge features and technologies
- Make it the BEST version of this type of project
- Add unique and innovative features
- Create a memorable user experience

OUTPUT FORMAT:
- Generate a COMPLETE, STANDALONE HTML file
- Include ALL CSS and JavaScript internally
- Use modern ES6+ JavaScript features
- Implement advanced CSS with animations
- Add comprehensive comments and documentation
- Make it production-ready and deployable

Generate the MOST EXTRAORDINARY ${type} possible that will BLOW MINDS:
`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: extraordinaryPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9, // Higher creativity
      topK: 50, // More diverse responses
      topP: 0.98, // Higher probability sampling
      maxOutputTokens: 16384, // Double the token limit for more complex code
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ]
  };

  try {
    console.log(`Generating ${type} for prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "MindForge/1.0"
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Check for API errors
    if (result.error) {
      console.error("Gemini API returned error:", result.error);
      throw new Error(`Gemini API error: ${result.error.message || 'Unknown error'}`);
    }

    const output = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output || output.trim().length < 100) {
      console.error("Invalid or empty output from Gemini");
      throw new Error("Generated code is too short or invalid");
    }

    // Clean up the output
    let cleanedOutput = output.trim();
    
    // Remove markdown code blocks if present
    if (cleanedOutput.startsWith('```html')) {
      cleanedOutput = cleanedOutput.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedOutput.startsWith('```')) {
      cleanedOutput = cleanedOutput.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Ensure it starts with DOCTYPE
    if (!cleanedOutput.startsWith('<!DOCTYPE')) {
      cleanedOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${type} - Generated by MindForge</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 ${type} Generated Successfully!</h1>
        <p>Your ${type.toLowerCase()} has been created by MindForge AI. Here's the generated content:</p>
        ${cleanedOutput}
    </div>
</body>
</html>`;
    }

    console.log(`Successfully generated ${type} (${cleanedOutput.length} characters)`);

    res.status(200).json({ 
      code: cleanedOutput,
      type: type,
      timestamp: new Date().toISOString(),
      characterCount: cleanedOutput.length
    });

  } catch (error) {
    console.error("Generation error:", error);
    
    // Return a fallback template if generation fails
    const fallbackTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${type} - MindForge</title>
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
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
        .error { background: rgba(255,0,0,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .retry-btn {
            background: #00fff0;
            color: #000;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,255,240,0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${type}</h1>
        <p>Your ${type.toLowerCase()} is ready to be built!</p>
        
        <div class="error">
            <h3>⚠️ Generation Note</h3>
            <p>The AI generation encountered an issue. This is a fallback template.</p>
            <p><strong>Original Request:</strong> ${prompt}</p>
        </div>
        
        <button class="retry-btn" onclick="location.reload()">🔄 Try Again</button>
    </div>
    
    <script>
        // Add some interactive features
        document.querySelector('.retry-btn').addEventListener('click', function() {
            this.textContent = '🔄 Retrying...';
            setTimeout(() => location.reload(), 1000);
        });
        
        // Add a simple animation
        document.querySelector('.container').style.animation = 'fadeIn 1s ease-in';
        
        // Add some dynamic content based on type
        const type = '${type}';
        const descriptions = {
            'Website': 'A beautiful, responsive website with modern design',
            'Mobile App': 'A mobile-first web application with touch interactions',
            'Game': 'An interactive game with engaging gameplay',
            'AI Bot': 'An intelligent chatbot with natural language processing',
            'API': 'A RESTful API with comprehensive endpoints',
            'AI Tool': 'A powerful AI-powered utility application'
        };
        
        if (descriptions[type]) {
            document.querySelector('p').textContent = descriptions[type];
        }
    </script>
</body>
</html>`;

    res.status(500).json({ 
      error: "Failed to generate from Gemini API",
      details: error.message,
      fallback: fallbackTemplate
    });
  }
}
