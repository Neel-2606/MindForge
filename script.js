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

  // 🚀 Generate Button
  generateBtn.onclick = async () => {
    const userInput = promptInput.value.trim();
    if (!userInput) return alert("Please enter your project idea.");

    previewArea.style.display = "block";
    previewArea.scrollIntoView({ behavior: "smooth" });
    previewFrame.srcdoc = `<body style="padding:50px; font-family:sans-serif;">⏳ Generating...</body>`;

    // ✨ Smart Gemini Prompt
    const styledPrompt = `
You are a senior front-end developer.
Generate a complete, beautiful, responsive HTML project using ONLY internal CSS and JavaScript.
Your output MUST:
- Include full <!DOCTYPE html>, <html>, <head>, <body>
- Use a <style> tag for internal CSS
- Use a <script> tag for interactive features
- Be fully styled and look modern
- NOT use any external files or libraries

User wants a ${selectedType}:
${userInput}
    `;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: styledPrompt, type: selectedType }),
      });

      const data = await res.json();
      let output = data.code;

      if (!output || output.trim().length < 50) {
        output = `
<!DOCTYPE html>
<html><head><style>
body { background:#111; color:white; font-family:sans-serif; padding:50px; text-align:center; }
h1 { color:#00fff0; }
</style></head>
<body>
<h1>⚠️ Generation Failed</h1>
<p>The AI didn't return a valid template. Try changing your prompt or refreshing.</p>
</body></html>`;
      }

      // 🧠 Wrap if partial HTML
      const fullOutput = output.trim().startsWith("<!DOCTYPE")
        ? output
        : `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>MindForge Output</title>
<style>
  body { padding: 30px; font-family: sans-serif; background: #1b1b1b; color: #eee; }
</style>
</head>
<body>
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
      cssCode.textContent = "/* CSS is inside the HTML */";
      jsCode.textContent = "// JS is inside the HTML";
      document.getElementById("code-html-view").textContent = fullOutput;
      Prism.highlightAll();

    } catch (err) {
      console.error("Gemini Error:", err);
      previewFrame.srcdoc = `<body style="padding:50px;">❌ Generation failed. Try again.</body>`;
      alert("Error generating. Please try again.");
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
});

