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
    const prompt = promptInput.value.trim();
    if (!prompt) return alert("Please enter your project idea.");

    previewArea.style.display = "block";
    previewArea.scrollIntoView({ behavior: "smooth" });

    previewFrame.srcdoc = `<body style="padding:50px; font-family:sans-serif;">⏳ Generating...</body>`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: selectedType }),
      });

      const data = await res.json();
      const output = data.code;

      if (!output) throw new Error("No code returned");

      // Load output into iframe
      previewFrame.srcdoc = output;

      // Show HTML in code viewer
      htmlCode.textContent = output;
      cssCode.textContent = "/* CSS included inside HTML */";
      jsCode.textContent = "// JS included inside HTML";

      // Show code in modal viewer
      document.getElementById("code-html-view").textContent = output;

      Prism.highlightAll();
    } catch (err) {
      console.error("Error generating:", err);
      previewFrame.srcdoc = `<body style="padding:50px; font-family:sans-serif;">❌ Error generating. Try again.</body>`;
      alert("Failed to generate project. Try again or check backend.");
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
        previewFrame.contentWindow.document.body.classList.toggle("dark");
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
