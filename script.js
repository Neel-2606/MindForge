const startBtn = document.getElementById("startBtn");
const buildSection = document.getElementById("build");
const previewArea = document.getElementById("previewArea");
const generateBtn = document.getElementById("generateBtn");
const promptInput = document.getElementById("promptInput");
const cards = document.querySelectorAll(".hero-right .card");

let selectedType = "";

cards.forEach(card => {
  card.addEventListener("click", () => {
    selectedType = card.getAttribute("data-type");
    buildSection.style.display = "block";
    promptInput.placeholder = `Describe the ${selectedType.toLowerCase()} you want to build...`;
    promptInput.focus();
    buildSection.scrollIntoView({ behavior: "smooth" });
  });
});

generateBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter something to build.");
    return;
  }

  previewArea.style.display = "block";
  previewArea.scrollIntoView({ behavior: "smooth" });

  const previewFrame = document.getElementById("preview");
  previewFrame.srcdoc = `
    <html>
      <body style="font-family: Poppins; padding: 30px;">
        <h1>${selectedType} Preview</h1>
        <p><strong>Your idea:</strong> ${prompt}</p>
        <p style="margin-top: 20px;">🚀 MindForge will generate a ${selectedType.toLowerCase()} for you soon!</p>
      </body>
    </html>
  `;
});



