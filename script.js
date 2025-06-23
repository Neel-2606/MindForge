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

// Handle navbar "Build" click
document.querySelector('a[href="#build"]').addEventListener("click", e => {
  e.preventDefault();
  buildSection.style.display = "block";
  buildSection.scrollIntoView({ behavior: "smooth" });
});

// Generate preview
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

const startBtn = document.getElementById("startBtn");

startBtn.onclick = () => {
  buildSection.style.display = "block";
  buildSection.scrollIntoView({ behavior: "smooth" });
};


// Toolbar buttons (dynamically injected)
const toolbar = document.querySelector(".toolbar");

// 💾 Save
const saveBtn = document.createElement("button");
saveBtn.id = "saveProject";
saveBtn.innerText = "💾 Save";
saveBtn.onclick = () => {
  localStorage.setItem("mindforge_project", JSON.stringify({
    html: htmlCode.textContent,
    css: cssCode.textContent,
    js: jsCode.textContent
  }));
  alert("Project saved to browser.");
};
toolbar.appendChild(saveBtn);

// 📂 Load
const loadBtn = document.createElement("button");
loadBtn.id = "loadProject";
loadBtn.innerText = "📂 Load";
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
toolbar.appendChild(loadBtn);

// 📱 Toggle Device
const toggleDeviceBtn = document.createElement("button");
toggleDeviceBtn.id = "toggleDevice";
toggleDeviceBtn.innerText = "📱 Toggle Device";
toggleDeviceBtn.onclick = () => {
  isMobile = !isMobile;
  previewFrame.style.width = isMobile ? "375px" : "100%";
};
toolbar.appendChild(toggleDeviceBtn);

// 🔍 Fullscreen
const fullscreenBtn = document.createElement("button");
fullscreenBtn.id = "fullscreenToggle";
fullscreenBtn.innerText = "🔍 Fullscreen";
fullscreenBtn.onclick = () => {
  document.getElementById("previewPane").classList.toggle("fullscreen");
};
toolbar.appendChild(fullscreenBtn);

// 🔁 Regenerate
const regenerateBtn = document.createElement("button");
regenerateBtn.id = "regenerateBtn";
regenerateBtn.innerText = "🔁 Regenerate";
regenerateBtn.onclick = () => generateBtn.click();
toolbar.appendChild(regenerateBtn);

// ⬇️ Download
const downloadBtn = document.createElement("button");
downloadBtn.id = "downloadBtn";
downloadBtn.innerText = "⬇️ Download";
downloadBtn.onclick = () => {
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
toolbar.appendChild(downloadBtn);

// 🌓 Theme Toggle
const themeToggleBtn = document.createElement("button");
themeToggleBtn.id = "themeToggle";
themeToggleBtn.innerText = "🌓 Toggle Theme";
themeToggleBtn.onclick = () => {
  document.body.classList.toggle("light");
  previewFrame.contentWindow.document.body.classList.toggle("dark");
};
toolbar.appendChild(themeToggleBtn);

// 🌐 How to Deploy
const deployBtn = document.createElement("button");
deployBtn.innerText = "🌐 How to Deploy";
deployBtn.onclick = () => {
  document.getElementById("deployModal").style.display = "flex";
};
toolbar.appendChild(deployBtn);

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
