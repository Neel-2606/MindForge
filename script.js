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

  // Check API availability on page load
  checkAPIStatus();

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

    // Get selected API preference
    const apiSelector = document.getElementById('apiSelector');
    const preferredAPI = apiSelector ? apiSelector.value : null;

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
          type: selectedType,
          preferredAPI: preferredAPI
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Show which API was used
      if (data.apiUsed) {
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
          apiStatus.textContent = `✅ Generated with ${data.apiUsed.toUpperCase()}`;
          apiStatus.className = 'api-status';
        }
      }

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
      const fullOutput = output.trim().startsWith("<!DOCTYPE")
        ? output
        : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedType} - Generated by MindForge</title>
  <style>
    body { 
      padding: 30px; 
      font-family: 'Segoe UI', sans-serif; 
      background: #1b1b1b; 
      color: #eee; 
      line-height: 1.6;
    }
    .mindforge-header {
      background: linear-gradient(135deg, #00fff0, #00bcd4);
      color: #000;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="mindforge-header">
    <h1>🎉 ${selectedType} Generated by MindForge AI</h1>
    <p>Your project has been successfully created!</p>
  </div>
  ${output}
</body>
</html>
`;

      // ✅ Load Preview
      previewFrame.srcdoc = fullOutput;
      previewFrame.style.width = isMobile ? "375px" : "100%";
      previewFrame.style.height = "600px";

      // ✅ Populate Code View
      htmlCode.textContent = fullOutput;
      cssCode.textContent = "/* CSS is embedded within the HTML */";
      jsCode.textContent = "// JavaScript is embedded within the HTML";
      document.getElementById("code-html-view").textContent = fullOutput;
      Prism.highlightAll();

      // Show success message
      console.log(`✅ Successfully generated ${selectedType} (${fullOutput.length} characters)`);

    } catch (err) {
      console.error("Generation Error:", err);
      
      const errorTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - MindForge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .error-container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    h1 { font-size: 2.5em; margin-bottom: 20px; }
    p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
    .error-details { 
      background: rgba(255,255,255,0.1); 
      padding: 20px; 
      border-radius: 10px; 
      margin: 20px 0; 
      text-align: left;
      font-family: monospace;
      font-size: 0.9em;
    }
    .retry-btn {
      background: #fff;
      color: #ff6b6b;
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
      box-shadow: 0 5px 15px rgba(255,255,255,0.4);
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>❌ Generation Failed</h1>
    <p>Sorry, we couldn't generate your ${selectedType}. Here's what went wrong:</p>
    
    <div class="error-details">
      <strong>Error:</strong> ${err.message}<br>
      <strong>Request:</strong> ${userInput}<br>
      <strong>Type:</strong> ${selectedType}<br>
      <strong>Time:</strong> ${new Date().toLocaleString()}
    </div>
    
    <button class="retry-btn" onclick="location.reload()">🔄 Try Again</button>
    <button class="retry-btn" onclick="history.back()">← Go Back</button>
  </div>
</body>
</html>`;

      previewFrame.srcdoc = errorTemplate;
      alert(`Generation failed: ${err.message}\n\nPlease check your API key and try again.`);
    } finally {
      // Reset button state
      generateBtn.textContent = "Generate with AI";
      generateBtn.disabled = false;
    }
  };

  // 🛠 Toolbar Buttons
  const toolButtons = [
    {
      text: "💾 Save", id: "saveProject", onClick: () => {
        localStorage.setItem("mindforge_project", JSON.stringify({
          html: htmlCode.textContent,
          css: cssCode.textContent,
          js: jsCode.textContent
        }));
        alert("Project saved to browser.");
      }
    },
    {
      text: "📂 Load", id: "loadProject", onClick: () => {
        const data = localStorage.getItem("mindforge_project");
        if (!data) return alert("No saved project found.");
        const proj = JSON.parse(data);
        htmlCode.textContent = proj.html;
        cssCode.textContent = proj.css;
        jsCode.textContent = proj.js;
        previewFrame.srcdoc = `<html><head><style>${proj.css}</style></head><body>${proj.html}<script>${proj.js}</script></body></html>`;
        Prism.highlightAll();
      }
    },
    {
      text: "📱 Toggle Device", id: "toggleDevice", onClick: () => {
        isMobile = !isMobile;
        previewFrame.style.width = isMobile ? "375px" : "100%";
      }
    },
    {
      text: "🔍 Fullscreen", id: "fullscreenToggle", onClick: () => {
        document.getElementById("previewPane").classList.toggle("fullscreen");
      }
    },
    {
      text: "🔁 Regenerate", id: "regenerateBtn", onClick: () => generateBtn.click()
    },
    {
      text: "⬇️ Download", id: "downloadBtn", onClick: () => {
        const zip = `<!DOCTYPE html><html><head><style>${cssCode.textContent}</style></head><body>${htmlCode.textContent}<script>${jsCode.textContent}</script></body></html>`;
        const blob = new Blob([zip], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mindforge.html";
        a.click();
      }
    },
    {
      text: "🌓 Toggle Theme", id: "themeToggle", onClick: () => {
        document.body.classList.toggle("light");
        previewFrame.contentWindow.document.body?.classList?.toggle("dark");
      }
    },
    {
      text: "🌐 How to Deploy", id: "deployBtn", onClick: () => {
        document.getElementById("deployModal").style.display = "flex";
      }
    },
    {
      text: "📄 View Code Files", id: "viewCodeFiles", onClick: () => {
        document.getElementById("code-html-view").innerHTML = `<code class="language-html">${htmlCode.textContent}</code>`;
        document.getElementById("code-css-view").innerHTML = `<code class="language-css">${cssCode.textContent}</code>`;
        document.getElementById("code-js-view").innerHTML = `<code class="language-js">${jsCode.textContent}</code>`;
        Prism.highlightAll();
        document.getElementById("codeModal").style.display = "flex";
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

  // API Status Checking Function
  async function checkAPIStatus() {
    const apiStatus = document.getElementById('apiStatus');
    if (!apiStatus) return;

    try {
      // Make a test request to check API availability
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'test',
          type: 'Website'
        })
      });

      const data = await response.json();
      
      if (data.error && data.error.includes('No API keys configured')) {
        apiStatus.textContent = '❌ No API keys configured';
        apiStatus.className = 'api-status error';
      } else if (data.error && data.error.includes('No available APIs')) {
        apiStatus.textContent = '⚠️ API keys invalid or unavailable';
        apiStatus.className = 'api-status warning';
      } else {
        apiStatus.textContent = '✅ APIs available';
        apiStatus.className = 'api-status';
      }
    } catch (error) {
      apiStatus.textContent = '❌ API check failed';
      apiStatus.className = 'api-status error';
    }
  }
});