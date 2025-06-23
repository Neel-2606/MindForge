const cards = document.querySelectorAll(".card");
const buildSection = document.getElementById("build");
const previewArea = document.getElementById("previewArea");
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const previewFrame = document.getElementById("previewFrame");
const htmlCode = document.getElementById("htmlCode");
const cssCode = document.getElementById("cssCode");
const jsCode = document.getElementById("jsCode");

let selectedType = "Website";
let isMobile = false;

// Show build section on card click
cards.forEach(card => {
  card.onclick = () => {
    selectedType = card.getAttribute("data-type");
    buildSection.style.display = "block";
    promptInput.placeholder = `Describe the ${selectedType.toLowerCase()} you want to build...`;
    buildSection.scrollIntoView({ behavior: "smooth" });
  };
});

// Handle navbar "Build" click — show build section even if no card clicked
document.querySelector('a[href="#build"]').addEventListener("click", e => {
  e.preventDefault();
  buildSection.style.display = "block";
  buildSection.scrollIntoView({ behavior: "smooth" });
});

// Generate content
generateBtn.onclick = () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Please enter your project idea.");

  previewArea.style.display = "block";
  previewArea.scrollIntoView({ behavior: "smooth" });

  const html = `<h1>${selectedType} Preview</h1><p>${prompt}</p>`;
  const css = `body { font-family: Poppins; padding: 30px; background: #f9f9f9; color: #111; }`;
  const js = `console.log("Generated for: ${prompt}");`;

  previewFrame.srcdoc = `<html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
  htmlCode.textContent = html;
  cssCode.textContent = css;
  jsCode.textContent = js;

  Prism.highlightAll();
};

// Toolbar actions
document.getElementById("regenerateBtn").onclick = () => generateBtn.click();

document.getElementById("downloadBtn").onclick = () => {
  const zipContent = `
    <html>
    <head><style>${cssCode.textContent}</style></head>
    <body>${htmlCode.textContent}<script>${jsCode.textContent}<\/script></body>
    </html>
  `;
  const blob = new Blob([zipContent], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mindforge.html";
  a.click();
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
  previewFrame.contentWindow.document.body.classList.toggle("dark");
};

document.getElementById("fullscreenToggle").onclick = () => {
  document.getElementById("previewPane").classList.toggle("fullscreen");
};

document.getElementById("toggleDevice").onclick = () => {
  isMobile = !isMobile;
  previewFrame.style.width = isMobile ? "375px" : "100%";
};

// 🌐 Deploy instructions button
const deployBtn = document.createElement("button");
deployBtn.innerText = "🌐 How to Deploy";
deployBtn.onclick = () => {
  document.getElementById("deployModal").style.display = "flex";
};
document.querySelector(".toolbar").appendChild(deployBtn);

// 💾 Save + 📂 Load buttons (inserted in toolbar with same styles)
const saveBtn = document.createElement("button");
saveBtn.id = "saveProject";
saveBtn.innerText = "💾 Save";

const loadBtn = document.createElement("button");
loadBtn.id = "loadProject";
loadBtn.innerText = "📂 Load";

const toolbar = document.querySelector(".toolbar");
toolbar.insertBefore(loadBtn, toolbar.firstChild);
toolbar.insertBefore(saveBtn, toolbar.firstChild);

// Save project to browser
saveBtn.onclick = () => {
  localStorage.setItem("mindforge_project", JSON.stringify({
    html: htmlCode.textContent,
    css: cssCode.textContent,
    js: jsCode.textContent
  }));
  alert("Project saved to browser.");
};

// Load project from browser
loadBtn.onclick = () => {
  const data = localStorage.getItem("mindforge_project");
  if (!data) return alert("No saved project found.");
  const { html, css, js } = JSON.parse(data);
  htmlCode.textContent = html;
  cssCode.textContent = css;
  jsCode.textContent = js;
  previewFrame.srcdoc = `<html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
  Prism.highlightAll();
};

// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    htmlCode.style.display = tab.dataset.tab === "html" ? "block" : "none";
    cssCode.style.display = tab.dataset.tab === "css" ? "block" : "none";
    jsCode.style.display = tab.dataset.tab === "js" ? "block" : "none";
  };
});
