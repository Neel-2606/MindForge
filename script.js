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
    let basePrompt = promptInput.value.trim();

let styledPrompt = "";

if (selectedType === "Website") {
  styledPrompt = `
You are an expert web developer.
Generate a modern, responsive HTML+CSS website based on the following description:
- Use internal CSS (inside <style>) for styling.
- Add a hero section, multiple content sections, and clean layout.
- Make it mobile-friendly.
- No external libraries.

User prompt: ${basePrompt}
`;
}
else if (selectedType === "Mobile App") {
  styledPrompt = `
You're a UI/UX expert. 
Generate a responsive mobile app UI layout using HTML and CSS (simulating mobile app layout in browser).
- Design a top navbar, content area, and bottom nav bar.
- Style it to look like a native mobile app interface.
- Use internal <style> CSS.
- No external libraries.

App description: ${basePrompt}
`;
}
else if (selectedType === "Game") {
  styledPrompt = `
You're a game developer using HTML/JS/CSS.
Create a basic game layout (like Tic-Tac-Toe or platformer).
- Include styled HTML layout and interactive JavaScript.
- Add start button, canvas or grid, and a basic game loop.
- Style nicely using internal CSS.
- No external libraries.

Game idea: ${basePrompt}
`;
}
else if (selectedType === "AI Tool") {
  styledPrompt = `
Generate a responsive AI-based tool UI in HTML/CSS/JS.
- Add input fields, output area, and buttons.
- Make it clean, minimal, and styled.
- Use internal CSS and JavaScript logic inside <script> tag.
- No external libraries.

Tool description: ${basePrompt}
`;
}
else if (selectedType === "API") {
  styledPrompt = `
Simulate an API documentation or interactive API testing UI.
- Create a layout in HTML/CSS with input fields, send button, and response area.
- Use JavaScript to simulate a fetch request and display dummy JSON.
- Style it clearly for developers.

API idea: ${basePrompt}
`;
}
else {
  styledPrompt = `
You're a creative AI coder. Generate a styled and working project in HTML, CSS, and JS based on this prompt:
${basePrompt}

Requirements:
- Responsive design
- Internal CSS
- Clean, modern layout
- No external libraries
`;
}

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
