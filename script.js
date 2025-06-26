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
  const codePane = document.querySelector(".code-pane"); // Get the code-pane element
  const codeTabs = document.querySelectorAll(".tab");
  const codeContents = document.querySelectorAll(".code-content pre");


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

  // Tab switching logic for code pane
  codeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Deactivate all tabs and hide all content
      codeTabs.forEach(t => t.classList.remove("active"));
      codeContents.forEach(c => c.style.display = "none");

      // Activate the clicked tab
      tab.classList.add("active");

      // Show the corresponding content
      const tabType = tab.getAttribute("data-tab");
      document.getElementById(`${tabType}Code`).style.display = "block";
    });
  });


  // 🚀 Generate Button
  generateBtn.onclick = async () => {
    const userInput = promptInput.value.trim();
    if (!userInput) return alert("Please enter your project idea.");

    previewArea.style.display = "block";
    codePane.style.display = "block"; // Ensure code pane is visible
    previewArea.scrollIntoView({ behavior: "smooth" });

    // Show loading state in iframe
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
      background: #0f0f0f;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Poppins', sans-serif;
    }

    .loader {
      font-size: 30px;
      font-weight: bold;
      color: #00fff0;
      text-shadow: 0 0 10px rgba(0, 255, 240, 0.6);
      animation: pulse 1.5s ease-in-out infinite, pop 2.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }

    @keyframes pop {
      0% { transform: scale(1); }
      80% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
  </style>
</head>
<body>
  <div class="loader">⏳ Generating with AI...</div>
</body>
</html>
`;

    // ⭐ NEW & IMPROVED GEMINI PROMPT ⭐
    const geminiPrompt = `
You are an expert, highly skilled, and meticulous frontend developer specializing in modern HTML, CSS, and vanilla JavaScript. Your goal is to generate **production-ready, visually stunning, and fully responsive** web pages based on user requests.

**Instructions:**
1.  **Generate a complete, single HTML file.** All CSS must be contained within a <style> tag in the <head>, and all JavaScript must be contained within a <script> tag at the end of the <body> (just before the closing </body> tag).
2.  **Do NOT use any external libraries, frameworks, or preprocessors.** All code must be pure HTML, CSS, and vanilla JavaScript.
3.  **Structure:** Ensure the page has a clear and logical structure, including, but not limited to:
    * A responsive header with a navigation bar.
    * A prominent hero section.
    * At least three distinct content sections relevant to the user's request.
    * A professional footer.
4.  **Design & Aesthetics:**
    * Implement a **modern, clean, and visually appealing design**.
    * Use appropriate typography, color palettes, and spacing for a polished look.
    * Ensure the layout is **fully responsive** and looks great on desktop, tablet, and mobile devices.
    * Include relevant and placeholder content (e.g., "Lorem Ipsum" for text, placeholder images) that makes the design feel complete.
5.  **Interactivity (JavaScript):** Include practical and modern JavaScript for common web interactions. Examples include:
    * Smooth scrolling to anchor links.
    * A responsive navigation menu (e.g., hamburger menu on mobile).
    * Basic form validation if a form is present.
    * Subtle hover effects or animations where appropriate.
6.  **Code Quality:**
    * Write clean, well-organized, and commented code.
    * Use semantic HTML5 elements.
    * Ensure CSS is well-structured and uses modern properties.
    * JavaScript should be efficient and follow best practices.
7.  **Output Format:** Your *entire* response must be a single HTML file wrapped in a Markdown code block like this:
    \`\`\`html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Website</title>
        <style>
            /* Your CSS here */
        </style>
    </head>
    <body>
        <script>
            // Your JavaScript here
        </script>
    </body>
    </html>
    \`\`\`

User's Request: Generate a ${selectedType} for a user that wants: ${userInput}
    `;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: geminiPrompt }), // Send the new prompt
      });

      const data = await res.json();
      let output = data.code;

      // ⭐ IMPROVED PARSING OF GEMINI'S MARKDOWN OUTPUT ⭐
      // Use regex to find content inside the ```html ... ``` block
      const htmlMatch = output.match(/```html\s*([\s\S]*?)\s*```/);
      let extractedHtml = htmlMatch ? htmlMatch[1].trim() : '';

      // Fallback if no valid HTML block is found (e.g., Gemini returns an error message)
      if (!extractedHtml || extractedHtml.trim().length < 50) {
        extractedHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body { background:#111; color:white; font-family:sans-serif; padding:50px; text-align:center; }
h1 { color:#00fff0; }
</style>
</head>
<body>
<h1>⚠️ Generation Unsuccessful or Partial Output</h1>
<p>The AI did not return a complete or valid HTML structure. This can happen if the prompt was too complex or if there was an internal AI issue.</p>
<p>Please try a simpler prompt or regenerate.</p>
<p>Original AI Response (for debugging):</p>
<pre style="text-align:left; background:#222; padding:15px; border-radius:8px; overflow-x:auto;">${output}</pre>
</body>
</html>`;
      }

      // Extract CSS and JS (basic parsing, may need refinement for complex cases)
      const cssMatch = extractedHtml.match(/<style>([\s\S]*?)<\/style>/);
      const jsMatch = extractedHtml.match(/<script>([\s\S]*?)<\/script>/);

      const extractedCss = cssMatch ? cssMatch[1].trim() : '/* No CSS found within <style> tags */';
      const extractedJs = jsMatch ? jsMatch[1].trim() : '// No JavaScript found within <script> tags';


      // ✅ Load Preview
      // Set srcdoc to the extracted HTML (which now includes internal CSS/JS)
      previewFrame.srcdoc = extractedHtml;
      previewFrame.style.width = isMobile ? "375px" : "100%";
      previewFrame.style.height = "600px";

      // ✅ Populate Code View
      htmlCode.textContent = extractedHtml;
      cssCode.textContent = extractedCss;
      jsCode.textContent = extractedJs;

      // Populate Code Modal views
      document.getElementById("code-html-view").querySelector('code').textContent = extractedHtml;
      document.getElementById("code-css-view").querySelector('code').textContent = extractedCss;
      document.getElementById("code-js-view").querySelector('code').textContent = extractedJs;

      // Ensure Prism highlights the code
      Prism.highlightAll();

    } catch (err) {
      console.error("Gemini Error:", err);
      previewFrame.srcdoc = `<body style="padding:50px; background:#111; color:white;">
        <h1 style="color:#ff4444;">❌ Generation Failed</h1>
        <p>An error occurred while communicating with the AI. Please check your network connection or try again later.</p>
        <p>Error details: ${err.message}</p>
      </body>`;
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

        // Ensure loaded content is directly loaded into iframe
        previewFrame.srcdoc = proj.html; // proj.html already contains full HTML with internal CSS/JS

        // Populate Code Modal views for loaded content
        document.getElementById("code-html-view").querySelector('code').textContent = proj.html;
        document.getElementById("code-css-view").querySelector('code').textContent = proj.css;
        document.getElementById("code-js-view").querySelector('code').textContent = proj.js;

        Prism.highlightAll();
        // Set the active tab back to HTML after loading
        codeTabs.forEach(t => t.classList.remove("active"));
        document.querySelector('.tab[data-tab="html"]').classList.add("active");
        codeContents.forEach(c => c.style.display = "none");
        document.getElementById("htmlCode").style.display = "block";
      }
    },
    {
      text: "📱 Toggle Device", id: "toggleDevice", onClick: () => {
        isMobile = !isMobile;
        previewFrame.style.width = isMobile ? "375px" : "100%";
        previewFrame.style.maxWidth = isMobile ? "375px" : "none"; // Add max-width for better toggling
        previewFrame.style.transition = "width 0.3s ease-in-out, max-width 0.3s ease-in-out"; // Smooth transition
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
        // Use htmlCode.textContent which should now hold the full HTML
        const fullHtmlContent = htmlCode.textContent;
        const blob = new Blob([fullHtmlContent], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mindforge_project.html"; // Renamed for clarity
        a.click();
      }
    },
    {
      text: "🌓 Toggle Theme", id: "themeToggle", onClick: () => {
        document.body.classList.toggle("light");
        // Attempt to toggle theme within the iframe content if it's designed to respond
        // This is tricky as the generated code might not have a 'dark' class listener.
        // If the generated code doesn't respond, this won't do anything.
        try {
          const iframeBody = previewFrame.contentWindow.document.body;
          if (iframeBody) {
            iframeBody.classList.toggle("light-theme"); // Or whatever class the generated code might use
            iframeBody.classList.toggle("dark-theme");
          }
        } catch (e) {
          console.warn("Could not toggle theme in iframe due to cross-origin or lack of iframe content.", e);
        }
      }
    },
    {
      text: "🌐 How to Deploy", id: "deployBtn", onClick: () => {
        document.getElementById("deployModal").style.display = "flex";
      }
    },
    {
      text: "📄 View Code Files", id: "viewCodeFiles", onClick: () => {
        // Ensure Prism highlights the code just before opening the modal
        document.getElementById("code-html-view").querySelector('code').textContent = htmlCode.textContent;
        document.getElementById("code-css-view").querySelector('code').textContent = cssCode.textContent;
        document.getElementById("code-js-view").querySelector('code').textContent = jsCode.textContent;
        Prism.highlightAll(); // Re-highlight every time to be safe

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