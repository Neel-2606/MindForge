document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".card");
  const buildSection = document.getElementById("build");
  const previewArea = document.getElementById("previewArea");
  const promptInput = document.getElementById("promptInput");
  const generateBtn = document.getElementById("generateBtn");
  const previewFrame = document.getElementById("previewFrame");
  const htmlCode = document.getElementById("htmlCode");
  const cssCode = document.getElementById("cssCode");
  const jsCode = document.getElementById("jsCode");
  const toolbar = document.querySelector(".toolbar");
  const startBtn = document.getElementById("startBtn");

  let selectedType = "Website";
  let isMobile = false;

  // 🃏 Card Clicks
  cards.forEach(card => {
    card.addEventListener("click", () => {
      selectedType = card.getAttribute("data-type");
      buildSection.style.display = "block";
      promptInput.placeholder = `Describe the ${selectedType.toLowerCase()} you want to build...`;
      
      // Smooth scroll to build section with navbar offset
      const navbarHeight = 80;
      const targetPosition = buildSection.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  // 🚀 Smooth Scrolling for Navbar Links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Calculate offset for fixed navbar (adjust 80px based on your navbar height)
        const navbarHeight = 80;
        const targetPosition = targetSection.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Special handling for build section
        if (targetId === '#build') {
          buildSection.style.display = "block";
        }
      }
    });
  });

  // 🎯 Start Building
  startBtn.addEventListener("click", () => {
    buildSection.style.display = "block";
    
    // Smooth scroll to build section with navbar offset
    const navbarHeight = 80;
    const targetPosition = buildSection.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });

  // 🚀 Generate Button
  generateBtn.onclick = async () => {
    const userInput = promptInput.value.trim();
    if (!userInput) return alert("Please enter your project idea.");

    // Show loading state
    generateBtn.textContent = "⏳ Generating...";
    generateBtn.disabled = true;

    previewArea.style.display = "block";
    previewArea.scrollIntoView({ behavior: "smooth" });
    previewFrame.srcdoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      height: 100vh;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Poppins', sans-serif;
      color: #00fff0;
    }

    .loader-container {
      text-align: center;
    }

    .loader {
      font-size: 2.5em;
      font-weight: bold;
      text-shadow: 0 0 20px rgba(0, 255, 240, 0.8);
      animation: pulse 1.5s ease-in-out infinite, glow 2s ease-in-out infinite alternate;
      margin-bottom: 20px;
    }

    .loading-text {
      font-size: 1.2em;
      opacity: 0.8;
      animation: fadeInOut 2s ease-in-out infinite;
    }

    .progress-bar {
      width: 300px;
      height: 4px;
      background: rgba(0, 255, 240, 0.2);
      border-radius: 2px;
      margin: 20px auto;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00fff0, #00bcd4);
      border-radius: 2px;
      animation: progress 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }

    @keyframes glow {
      0% { text-shadow: 0 0 20px rgba(0, 255, 240, 0.8); }
      100% { text-shadow: 0 0 30px rgba(0, 255, 240, 1), 0 0 40px rgba(0, 255, 240, 0.6); }
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="loader-container">
    <div class="loader">🧠</div>
    <div class="loading-text">MindForge AI is crafting your ${selectedType}...</div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div style="font-size: 0.9em; opacity: 0.7; margin-top: 20px;">
      This may take 10-30 seconds depending on complexity
    </div>
  </div>
</body>
</html>
`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userInput, 
          type: selectedType 
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle both project structure and regular code
      let output = data.code || data.fallback;

      if (!output || output.trim().length < 100) {
        output = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedType} - MindForge</title>
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
      max-width: 600px;
    }
    h1 { font-size: 2.5em; margin-bottom: 20px; color: #00fff0; }
    p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
    .error { 
      background: rgba(255,0,0,0.2); 
      padding: 20px; 
      border-radius: 10px; 
      margin: 20px 0; 
      border: 1px solid rgba(255,0,0,0.3);
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
      margin: 10px;
    }
    .retry-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(0,255,240,0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Generation Issue</h1>
    <p>The AI generation encountered a problem. Here's what happened:</p>
    
    <div class="error">
      <h3>Details</h3>
      <p><strong>Request:</strong> ${userInput}</p>
      <p><strong>Type:</strong> ${selectedType}</p>
      <p><strong>Error:</strong> Generated code was too short or invalid</p>
    </div>
    
    <button class="retry-btn" onclick="location.reload()">🔄 Try Again</button>
    <button class="retry-btn" onclick="history.back()">← Go Back</button>
  </div>
  
  <script>
    // Add some interactive features
    document.querySelectorAll('.retry-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        this.textContent = '🔄 Processing...';
        this.disabled = true;
      });
    });
  </script>
</body>
</html>`;
      }

      // 🧠 Ensure proper HTML structure
      // Show the generated code in preview and code view
      previewFrame.srcdoc = output;
      
      // Show raw code in code tabs
      htmlCode.textContent = output;
      
      // Extract CSS and JS from the HTML
      const cssMatch = output.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      const jsMatch = output.match(/<script[^>]*>([\s\S]*?)<\/script>/);

      cssCode.textContent = cssMatch ? cssMatch[1].trim() : "/* No CSS found */";
      jsCode.textContent = jsMatch ? jsMatch[1].trim() : "/* No JavaScript found */";

      // Show preview area
      previewArea.style.display = "block";

      // Auto-scroll to preview
      previewArea.scrollIntoView({ behavior: "smooth" });

      console.log(`✅ Generated ${selectedType} successfully!`);
      console.log(`API Used: ${data.apiUsed || 'fallback'}`);
      console.log(`Model: ${data.model || 'template'}`);

    } catch (error) {
      console.error("Generation failed:", error);
      
      // Show error in preview
      previewFrame.srcdoc = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #e74c3c; margin-bottom: 20px;">⚠️ Generation Failed</h2>
          <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
          <p style="color: #999; font-size: 14px;">
            Please check your API keys in the .env file or try again later.
          </p>
        </div>
      `;
      
      htmlCode.textContent = `// Error: ${error.message}`;
      cssCode.textContent = "/* Generation failed */";
      jsCode.textContent = "/* Generation failed */";
      
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "✨ Generate";
    }
  }

  // 📱 Mobile Detection
  function detectMobile() {
    return window.innerWidth <= 768;
  }

  // 🔄 Update mobile state on resize
  window.addEventListener("resize", () => {
    isMobile = detectMobile();
  });

  // 🎯 Toolbar Buttons
  const toolButtons = [
    {
      id: "copyBtn",
      text: "📋 Copy HTML",
      onClick: () => {
        navigator.clipboard.writeText(htmlCode.textContent);
        const btn = document.getElementById("copyBtn");
        const originalText = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = originalText, 2000);
      },
    },
    {
      id: "downloadBtn", 
      text: "💾 Download",
      onClick: () => {
        const blob = new Blob([htmlCode.textContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedType.toLowerCase()}-mindforge.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    {
      id: "newTabBtn",
      text: "🔗 Open in New Tab", 
      onClick: () => {
        const newWindow = window.open();
        newWindow.document.write(htmlCode.textContent);
        newWindow.document.close();
      }
    },
    {
      id: "shareBtn",
      text: "🚀 Share",
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: `${selectedType} - MindForge`,
            text: "Check out this AI-generated project!",
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          const btn = document.getElementById("shareBtn");
          const originalText = btn.textContent;
          btn.textContent = "🔗 Link Copied!";
          setTimeout(() => btn.textContent = originalText, 2000);
        }
      }
    }
  ];

  toolButtons.forEach(btn => {
    const el = document.createElement("button");
    el.id = btn.id;
    el.innerText = btn.text;
    el.addEventListener("click", btn.onClick);
    toolbar.appendChild(el);
  });
});