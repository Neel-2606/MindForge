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

cards.forEach(card => {
  card.onclick = () => {
    selectedType = card.getAttribute("data-type");
    buildSection.style.display = "block";
    promptInput.placeholder = `Describe the ${selectedType.toLowerCase()} you want to build...`;
    buildSection.scrollIntoView({ behavior: "smooth" });
  };
});

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
};

document.getElementById("fullscreenToggle").onclick = () => {
  document.getElementById("previewPane").classList.toggle("fullscreen");
};

document.getElementById("toggleDevice").onclick = () => {
  isMobile = !isMobile;
  previewFrame.style.width = isMobile ? "375px" : "100%";
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    htmlCode.style.display = tab.dataset.tab === "html" ? "block" : "none";
    cssCode.style.display = tab.dataset.tab === "css" ? "block" : "none";
    jsCode.style.display = tab.dataset.tab === "js" ? "block" : "none";
  };
});


