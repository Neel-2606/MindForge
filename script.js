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

      // Handle new project structure format
      if (data.projectStructure) {
        displayProjectStructure(data.projectStructure, data.framework);
        return;
      }

      // Fallback to old format
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

  // 🚀 Display modern framework project structure
  function displayProjectStructure(projectStructure, framework) {
    const { files, setupInstructions, features } = projectStructure;
    
    // Create live preview by converting React/Next.js to vanilla HTML
    const livePreview = createLivePreview(files, framework);
    
    // Update preview with actual rendered application
    previewFrame.srcdoc = livePreview;

    // Update code view with project files
    const allFilesHtml = Object.entries(files).map(([fileName, content]) => `
      <div style="margin-bottom: 2rem; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
        <div style="background: #2d3748; color: white; padding: 0.5rem 1rem; font-weight: bold;">
          📄 ${fileName}
        </div>
        <pre style="background: #1a202c; color: #e2e8f0; padding: 1rem; margin: 0; overflow-x: auto;"><code>${content}</code></pre>
      </div>
    `).join('');

    document.getElementById("code-html-view").innerHTML = allFilesHtml;
    htmlCode.textContent = `// Modern ${framework.toUpperCase()} Project Structure\n// ${Object.keys(files).length} files generated\n\n${Object.entries(files).map(([name, content]) => `// ${name}\n${content}\n\n`).join('')}`;
    
    // Show success message
    console.log(`✅ Generated modern ${framework} project with ${Object.keys(files).length} files`);
  }

  // 🎨 Create live preview from React/Next.js files
  function createLivePreview(files, framework) {
    // Extract main component content and convert to vanilla HTML
    const mainComponent = files['src/App.jsx'] || files['pages/index.js'] || files['app/page.tsx'] || '';
    const stylesContent = files['src/index.css'] || files['styles/globals.css'] || '';
    
    // Convert JSX/TSX to HTML by extracting the visual structure
    let htmlContent = extractHTMLFromComponent(mainComponent);
    let cssContent = extractCSSFromStyles(stylesContent);
    
    // Add Tailwind CSS via CDN for styling
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview - ${framework}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/framer-motion@10/dist/framer-motion.js"></script>
  <style>
    ${cssContent}
    
    /* Additional animations and effects */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
    .animate-slide-in-left { animation: slideInLeft 0.6s ease-out; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    
    /* Hover effects */
    .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
    .hover-glow:hover { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    
    /* Gradient backgrounds */
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .gradient-text { 
      background: linear-gradient(45deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
</head>
<body>
  ${htmlContent}
  
  <script>
    // Add interactive effects
    document.addEventListener('DOMContentLoaded', function() {
      // Animate elements on scroll
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);
      
      // Observe all sections
      document.querySelectorAll('section, .card, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
      });
      
      // Add hover effects to buttons and cards
      document.querySelectorAll('button, .card').forEach(el => {
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.05)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });
      });
      
      // Typing animation for hero text
      const heroTitle = document.querySelector('h1');
      if (heroTitle && heroTitle.textContent.length > 0) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        const typeWriter = () => {
          if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
          }
        };
        setTimeout(typeWriter, 500);
      }
    });
  </script>
</body>
</html>`;
  }

  // Extract HTML structure from React component
  function extractHTMLFromComponent(componentCode) {
    if (!componentCode) return '<div class="p-8 text-center"><h1 class="text-4xl font-bold gradient-text">Welcome to Your App</h1></div>';
    
    // Remove imports and exports
    let content = componentCode.replace(/import.*?from.*?;/g, '');
    content = content.replace(/export.*?{/g, '{');
    
    // Extract JSX return statement
    const returnMatch = content.match(/return\s*\(([\s\S]*?)\);?\s*}/);
    if (returnMatch) {
      let jsx = returnMatch[1].trim();
      
      // Convert JSX to HTML
      jsx = jsx.replace(/className=/g, 'class=');
      jsx = jsx.replace(/\{[^}]*\}/g, (match) => {
        // Handle simple variable replacements
        if (match.includes('title') || match.includes('name')) return 'Portfolio';
        if (match.includes('description')) return 'Full Stack Developer';
        if (match.includes('email')) return 'contact@example.com';
        return match.replace(/[{}]/g, '');
      });
      
      // Add animation classes
      jsx = jsx.replace(/(<div|<section|<header|<main)/g, '$1 class="animate-fade-in-up"');
      jsx = jsx.replace(/(<h1|<h2|<h3)/g, '$1 class="gradient-text"');
      jsx = jsx.replace(/(<button)/g, '$1 class="hover-scale hover-glow"');
      
      return jsx;
    }
    
    // Fallback: create a basic structure
    return `
      <div class="min-h-screen gradient-bg">
        <header class="p-6 animate-fade-in-up">
          <nav class="flex justify-between items-center max-w-6xl mx-auto">
            <h1 class="text-2xl font-bold text-white">Portfolio</h1>
            <div class="space-x-6">
              <a href="#" class="text-white hover:text-blue-300">Home</a>
              <a href="#" class="text-white hover:text-blue-300">About</a>
              <a href="#" class="text-white hover:text-blue-300">Projects</a>
              <a href="#" class="text-white hover:text-blue-300">Contact</a>
            </div>
          </nav>
        </header>
        
        <main class="max-w-6xl mx-auto px-6 py-20">
          <section class="text-center mb-20 animate-fade-in-up">
            <h1 class="text-6xl font-bold gradient-text mb-6">Full Stack Developer</h1>
            <p class="text-xl text-white/80 mb-8">Creating amazing digital experiences</p>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg hover-scale hover-glow">
              Get In Touch
            </button>
          </section>
          
          <section class="grid md:grid-cols-3 gap-8 animate-slide-in-left">
            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl hover-scale">
              <h3 class="text-xl font-bold text-white mb-4">Frontend</h3>
              <p class="text-white/80">React, Next.js, TypeScript</p>
            </div>
            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl hover-scale">
              <h3 class="text-xl font-bold text-white mb-4">Backend</h3>
              <p class="text-white/80">Node.js, Python, PostgreSQL</p>
            </div>
            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl hover-scale">
              <h3 class="text-xl font-bold text-white mb-4">Design</h3>
              <p class="text-white/80">Figma, Tailwind CSS, Framer Motion</p>
            </div>
          </section>
        </main>
      </div>`;
  }

  // Extract CSS from styles file
  function extractCSSFromStyles(stylesCode) {
    if (!stylesCode) return '';
    
    // Remove Tailwind imports and keep custom CSS
    let css = stylesCode.replace(/@import.*?;/g, '');
    css = css.replace(/@tailwind.*?;/g, '');
    
    return css;
  }
});