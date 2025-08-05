import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const createFallbackHTML = (prompt, type) => {
  const typeTemplates = {
    Website: `
      <style>
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 16px; margin-bottom: 3rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
        .hero p { font-size: 1.3rem; opacity: 0.9; margin-bottom: 2rem; }
        .cta-btn { background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; }
        .cta-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .feature-card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); }
        .feature-icon { font-size: 3rem; margin-bottom: 1rem; }
        .feature-card h3 { color: #333; margin-bottom: 1rem; font-size: 1.5rem; }
        .feature-card p { color: #666; line-height: 1.6; }
      </style>
      <header class="hero">
        <h1>Welcome to Our Platform</h1>
        <p>Built with cutting-edge technology and modern design principles</p>
        <button class="cta-btn" onclick="alert('Getting started!')">Get Started</button>
      </header>
      <main>
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Fast Performance</h3>
            <p>Lightning-fast loading times and smooth interactions for the best user experience.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile First</h3>
            <p>Fully responsive design that works perfectly on all devices and screen sizes.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Modern Design</h3>
            <p>Beautiful, clean interface with attention to detail and user experience.</p>
          </div>
        </div>
        <section style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 3rem; border-radius: 16px; text-align: center; margin: 3rem 0;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">Your Request</h2>
          <p style="font-size: 1.1rem; opacity: 0.9;">"${prompt.substring(0, 150)}..."</p>
        </section>
      </main>`,

    "Mobile App": `
      <style>
        .phone-frame { max-width: 375px; margin: 0 auto; background: #000; padding: 8px; border-radius: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .screen { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 22px; overflow: hidden; }
        .status-bar { display: flex; justify-content: space-between; padding: 0.5rem 1rem; color: white; font-size: 0.9rem; font-weight: 500; }
        .app-header { background: rgba(255,255,255,0.1); color: white; padding: 1.5rem 1rem; text-align: center; backdrop-filter: blur(10px); }
        .app-content { background: #f8f9fa; padding: 1.5rem; min-height: 400px; }
        .feature-list { display: grid; gap: 1rem; margin: 1rem 0; }
        .feature-item { background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
        .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .bottom-nav { display: flex; background: white; border-top: 1px solid #eee; }
        .nav-item { flex: 1; padding: 1rem; text-align: center; color: #666; cursor: pointer; transition: all 0.3s ease; }
        .nav-item.active { color: #667eea; background: rgba(102, 126, 234, 0.1); }
      </style>
      <div class="phone-frame">
        <div class="screen">
          <div class="status-bar">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div class="app-header">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Mobile App</h1>
            <p style="opacity: 0.9;">Your request: "${prompt.substring(0, 60)}..."</p>
          </div>
          <div class="app-content">
            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-icon">🏠</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Home</h4>
                  <p style="color: #666; font-size: 0.9rem;">Main dashboard</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚙️</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Settings</h4>
                  <p style="color: #666; font-size: 0.9rem;">App preferences</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <div>
                  <h4 style="margin-bottom: 0.25rem;">Analytics</h4>
                  <p style="color: #666; font-size: 0.9rem;">View statistics</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom-nav">
            <div class="nav-item active">🏠</div>
            <div class="nav-item">🔍</div>
            <div class="nav-item">❤️</div>
            <div class="nav-item">👤</div>
          </div>
        </div>
      </div>`,

    Game: `
      <style>
        .game-container { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 2rem; border-radius: 20px; text-align: center; max-width: 600px; margin: 0 auto; }
        .game-header { margin-bottom: 2rem; }
        .game-title { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #00ff88, #00ccff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .game-area { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 3rem; margin: 2rem 0; border: 2px solid rgba(255,255,255,0.1); }
        .score-board { display: flex; justify-content: space-around; margin-bottom: 2rem; }
        .score-item { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; backdrop-filter: blur(10px); }
        .score-value { font-size: 2rem; font-weight: bold; color: #00ff88; }
        .game-controls { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .game-btn { background: linear-gradient(135deg, #00ff88, #00ccff); color: #1e3c72; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
        .game-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,255,136,0.3); }
        .game-btn.secondary { background: rgba(255,255,255,0.2); color: white; }
      </style>
      <div class="game-container">
        <div class="game-header">
          <h1 class="game-title">🎮 Game Zone</h1>
          <p style="opacity: 0.9; font-size: 1.1rem;">Game concept: "${prompt.substring(0, 80)}..."</p>
        </div>
        <div class="score-board">
          <div class="score-item">
            <div class="score-value">0</div>
            <div>Score</div>
          </div>
          <div class="score-item">
            <div class="score-value">1</div>
            <div>Level</div>
          </div>
          <div class="score-item">
            <div class="score-value">3</div>
            <div>Lives</div>
          </div>
        </div>
        <div class="game-area">
          <p style="font-size: 1.3rem; margin-bottom: 1rem;">🎯 Ready to Play?</p>
          <p style="opacity: 0.8;">Click Start to begin your adventure!</p>
        </div>
        <div class="game-controls">
          <button class="game-btn" onclick="startGame()">Start Game</button>
          <button class="game-btn secondary" onclick="showInstructions()">Instructions</button>
          <button class="game-btn secondary" onclick="showHighScores()">High Scores</button>
        </div>
      </div>
      <script>
        function startGame() { alert('🎮 Game starting soon! Get ready!'); }
        function showInstructions() { alert('📖 Use arrow keys to move, space to jump!'); }
        function showHighScores() { alert('🏆 Your best score: 0 points'); }
      </script>`,
  }

  return typeTemplates[type] || `<p>No template available for ${type}</p>`
}

export default async function handler(req, res) {
  const { prompt, type } = req.body

  if (!prompt || !type) {
    return res.status(400).json({ error: "Missing prompt or type" })
  }

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Generate a ${type} based on the following prompt: "${prompt}"`,
      max_tokens: 2048,
    })

    const generatedHTML = response.data.choices[0].text.trim()

    if (generatedHTML) {
      return res.status(200).send(generatedHTML)
    } else {
      return res.status(200).send(createFallbackHTML(prompt, type))
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to generate content" })
  }
}
