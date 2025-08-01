// MindForge AI Platform - Code Generation Module
// Client-side JavaScript for interacting with Gemini Pro API

// Note: API key is securely stored in Vercel environment variables
// and accessed through the server-side API route
const API_ENDPOINT = '/api/generate';

/**
 * Main function to generate code using Gemini Pro API
 * @param {string} promptText - The user's natural language prompt
 * @param {string} projectType - Type of project (website, app, game, api, bot)
 * @returns {Promise<string>} Generated code or content
 */
async function generateCodeWithGemini(promptText, projectType = 'website') {
  const outputElement = document.getElementById('output');
  
  if (!promptText || promptText.trim() === '') {
    throw new Error('Prompt text cannot be empty');
  }

  // Show loading state
  if (outputElement) {
    outputElement.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>🤖 MindForge AI is generating your ${projectType}...</p>
      </div>
    `;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        type: projectType
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.code) {
      throw new Error('No code generated from AI response');
    }

    // Display the generated code
    if (outputElement) {
      outputElement.innerHTML = `
        <div class="generated-content">
          <div class="content-header">
            <h3>✨ Generated ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}</h3>
            <button onclick="copyToClipboard()" class="copy-btn">📋 Copy Code</button>
          </div>
          <div class="code-container">
            <pre><code id="generatedCode">${escapeHtml(data.code)}</code></pre>
          </div>
          <div class="preview-section">
            <button onclick="previewCode()" class="preview-btn">👁️ Live Preview</button>
            <button onclick="downloadCode()" class="download-btn">💾 Download</button>
          </div>
        </div>
      `;
    }

    return data.code;

  } catch (error) {
    console.error('MindForge Generation Error:', error);
    
    // Display error message to user
    if (outputElement) {
      outputElement.innerHTML = `
        <div class="error-state">
          <h3>❌ Generation Failed</h3>
          <p>Sorry, MindForge encountered an error: ${error.message}</p>
          <button onclick="retryGeneration()" class="retry-btn">🔄 Try Again</button>
        </div>
      `;
    }
    
    throw error;
  }
}

/**
 * Helper function to get prompt from input and trigger generation
 */
async function generateFromInput() {
  const promptInput = document.getElementById('userPrompt');
  const typeSelect = document.getElementById('projectType') || { value: 'website' };
  
  if (!promptInput) {
    console.error('Input element with id="userPrompt" not found');
    return;
  }

  const promptText = promptInput.value.trim();
  const projectType = typeSelect.value || 'website';

  if (!promptText) {
    alert('Please enter a prompt to generate your project!');
    return;
  }

  try {
    await generateCodeWithGemini(promptText, projectType);
  } catch (error) {
    console.error('Generation failed:', error);
  }
}

/**
 * Utility function to escape HTML for safe display
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Copy generated code to clipboard
 */
async function copyToClipboard() {
  const codeElement = document.getElementById('generatedCode');
  if (codeElement) {
    try {
      await navigator.clipboard.writeText(codeElement.textContent);
      
      // Show success feedback
      const copyBtn = document.querySelector('.copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy code to clipboard');
    }
  }
}

/**
 * Preview generated code in a new window
 */
function previewCode() {
  const codeElement = document.getElementById('generatedCode');
  if (codeElement) {
    const code = codeElement.textContent;
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(code);
    previewWindow.document.close();
  }
}

/**
 * Download generated code as HTML file
 */
function downloadCode() {
  const codeElement = document.getElementById('generatedCode');
  if (codeElement) {
    const code = codeElement.textContent;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindforge-generated-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Retry generation with the same prompt
 */
function retryGeneration() {
  const promptInput = document.getElementById('userPrompt');
  if (promptInput && promptInput.value.trim()) {
    generateFromInput();
  }
}

/**
 * Initialize MindForge when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 MindForge AI Platform Initialized');
  
  // Add Enter key support for prompt input
  const promptInput = document.getElementById('userPrompt');
  if (promptInput) {
    promptInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateFromInput();
      }
    });
  }
});

// Export functions for external use
window.generateCodeWithGemini = generateCodeWithGemini;
window.generateFromInput = generateFromInput;
window.copyToClipboard = copyToClipboard;
window.previewCode = previewCode;
window.downloadCode = downloadCode;
window.retryGeneration = retryGeneration;