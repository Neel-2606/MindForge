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
      buildSection.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 🚀 Navbar Build
  document.querySelector('a[href="#build"]').addEventListener("click", e => {
    e.preventDefault();
    buildSection.style.display = "block";
    buildSection.scrollIntoView({ behavior: "smooth" });
  });

  // 🎯 Start Building
  startBtn.addEventListener("click", () => {
    buildSection.style.display = "block";
    buildSection.scrollIntoView({ behavior: "smooth" });
  });

  // ⚙️ Generate Project
  generateBtn.onclick = async () => {
    const userInput = promptInput.value.trim();
    if (!userInput) return alert("Please enter your project idea.");

    previewArea.style.display = "block";
    previewArea.scrollIntoView({ behavior: "smooth" });

    previewFrame.srcdoc = `<body style="padding:50px; font-family:sans-serif;">⏳ Generating...</body>`;

    let styledPrompt = "";

    // 🎯 Smart Prompt per type
    switch (selectedType) {
      case "Website":
        styledPrompt = `Generate a fully responsive, modern HTML portfolio website with internal CSS.
It should include:
- A hero section with title and intro
- 3 project cards (image, title, desc)
- Clean layout, styled with internal <style> tag
- No external CSS or JS

User wants: ${userInput}`;
        break;

      case "Mobile App":
        styledPrompt = `Create a mobile-style HTML/CSS UI that looks like a native mobile app.
- Include a top navbar, content section, and bottom nav bar
- Use only internal CSS for styling
- Simulate an app layout inside the browser

App idea: ${userInput}`;
        break;

      case "Game":
        styledPrompt = `Build a simple game in HTML, CSS, and JavaScript.
- Include UI layout and game logic
- Use internal <style> and <script> blocks
- Examples: Tic-Tac-Toe, Rock Paper Scissors, or similar

Game idea: ${userInput}`;
        break;

      case "AI Bot":
        styledPrompt = `Design an AI chatbot UI using HTML, CSS, and JS.
- Should include input box, chat window, and send button
- Add styles to make it clean and responsive
- JS should simulate basic bot reply

Bot idea: ${userInput}`;
        break;

      case "API":
        styledPrompt = `Create a styled API tester tool in HTML, CSS, and JavaScript.
- Include fields for URL, method, and headers
- Button to send request (simulate with dummy fetch)
- Response display area
- Use internal CSS, no external frameworks

Tool idea: ${userInput}`;
        break;

      case "AI Tool":
        styledPrompt = `Create a web-based AI utility tool using HTML, CSS, and JS.
- Include input area, output display, and submit button
- Clean, responsive UI
- Internal CSS and inline JS
- No external libraries

Tool idea: ${userInput}`;
        break;

      default:
        styledPrompt = `Generate a complete, styled HTML+CSS+JS layout for this idea:
${userInput}`;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: styledPrompt, type: selectedType }),
      });

      const data = await res.json();
      const output = data.code;

      if (!output) throw new Error("No code returned");

      // ✅ Load into iframe
      previewFrame.srcdoc = output;
      previewFrame.style.width = isMobile ? "375px" : "100%";
      previewFrame.style.height = "600px";

      // ✅ Update code viewers
      htmlCode.textContent = output;
      cssCode.textContent = "/* CSS is included in HTML */";
      jsCode.textContent = "// JS is inside HTML";

      document.getElementById("code-html-view").textContent = output;
      Prism.highlightAll();

    } catch (err) {
      console.error("Generation Error:", err);
      previewFrame.srcdoc = `<body style="padding:50px; font-family:sans-serif;">❌ Error generating. Try again.</body>`;
      alert("Failed to generate project. Please try again.");
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
        previewFrame.srcdoc = `<html><head><style>${proj.css}</style></head><body>${proj.html}<script>${proj.js}<\/script></body></html>`;
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
        const zip = `<html><head><style>${cssCode.textContent}</style></head><body>${htmlCode.textContent}<script>${jsCode.textContent}<\/script></body></html>`;
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
});
