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

  // 🎯 FOCUSED AI PROMPT - SINGLE HTML FILE
  const focusedPrompt = `
You are an expert web developer. Create a BEAUTIFUL, FUNCTIONAL, and MODERN ${type} in a SINGLE HTML file.

🎯 REQUIREMENTS:
- Create ONE complete HTML file with everything included
- Use <style> tag for ALL CSS (no external files)
- Use <script> tag for ALL JavaScript (no external files)
- Make it responsive and mobile-friendly
- Use modern CSS (flexbox, grid, animations)
- Include interactive features where appropriate
- Use beautiful, modern design with good UX

🎨 DESIGN FEATURES:
- Modern color scheme with gradients
- Smooth animations and transitions
- Glassmorphism or neumorphism effects
- Responsive design for all devices
- Beautiful typography and spacing
- Interactive hover effects
- Loading animations

⚡ FUNCTIONALITY:
- Fully interactive and responsive
- Modern JavaScript features (ES6+)
- Local storage for data persistence
- Form validation and user feedback
- Smooth scrolling and navigation
- Mobile-first design approach

PROJECT TYPE: ${type}
USER REQUEST: ${prompt}

IMPORTANT RULES:
1. Output ONLY the complete HTML code
2. Do NOT include explanations or markdown
3. Start with <!DOCTYPE html>
4. Include proper meta tags and viewport
5. Use semantic HTML elements
6. Add smooth animations and transitions
7. Make it visually appealing
8. Include error handling in JavaScript
9. Ensure accessibility features

Generate a complete, beautiful ${type} that matches the user's request. Output ONLY the HTML code:
`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: focusedPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7, // Balanced creativity
      topK: 40, // Good diversity
      topP: 0.95, // High quality sampling
      maxOutputTokens: 8192, // Reasonable token limit
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
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
