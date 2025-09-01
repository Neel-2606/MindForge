export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "MindForge AI is working with FREE APIs!",
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
        hasGroq: !!process.env.GROQ_API_KEY,
        version: "2.0.0",
        models: ["claude-3.5-sonnet (free)", "llama-3.1-70b (free)"]
      },
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt, type = "Website" } = req.body || {}

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid prompt is required",
      })
    }

    // 🔒 ENHANCED MODERATION
    const bannedWords = [
      "sex", "porn", "nude", "nsfw", "drugs", "weapon", "violence", "kill", "murder",
      "terrorist", "rape", "blood", "gore", "suicide", "abuse", "adult", "xxx", "hentai",
      "hack", "exploit", "malware", "virus"
    ];
    const lowerPrompt = prompt.toLowerCase();
    const foundBanned = bannedWords.find(word => lowerPrompt.includes(word));

    if (foundBanned) {
      return res.status(400).json({
        success: false,
        error: `Inappropriate content detected: "${foundBanned}" is not allowed.`,
      });
    }

    // Get API keys - prioritize free options
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!openRouterKey && !groqKey) {
      return res.status(200).json({
        success: true,
        code: createAdvancedFallbackHTML(type, prompt),
        type: type,
        apiUsed: "fallback",
        timestamp: new Date().toISOString(),
        message: "No free API keys configured. Using advanced fallback."
      })
    }

    // Create advanced prompt
    const advancedPrompt = createAdvancedPrompt(prompt, type)

    console.log(`Generating ${type} with free AI APIs...`)

    let result = null
    let usedAPI = null

    // Try OpenRouter first (free Claude access)
    if (openRouterKey && !result) {
      try {
        console.log("Trying OpenRouter (Free Claude)...")
        result = await callOpenRouterAPI(advancedPrompt, openRouterKey)
        if (result) usedAPI = "openrouter-claude"
      } catch (error) {
        console.log("OpenRouter failed:", error.message)
      }
    }

    // Try Groq as backup (free high-speed)
    if (groqKey && !result) {
      try {
        console.log("Trying Groq (Free)...")
        result = await callGroqAPI(advancedPrompt, groqKey)
        if (result) usedAPI = "groq-llama"
      } catch (error) {
        console.log("Groq failed:", error.message)
      }
    }

    if (result && result.length > 500) {
      // Parse and structure the result for modern frameworks
      const projectStructure = parseFrameworkProject(result, type, prompt)

      console.log(`✅ Success with ${usedAPI}: Generated ${Object.keys(projectStructure.files).length} files`)

      return res.status(200).json({
        success: true,
        projectStructure: projectStructure,
        type: type,
        apiUsed: usedAPI,
        timestamp: new Date().toISOString(),
        fileCount: Object.keys(projectStructure.files).length,
        model: usedAPI,
        framework: projectStructure.framework
      })
    }

    // All APIs failed - return modern framework fallback
    console.log("All free APIs failed, returning modern framework fallback")
    const fallbackProject = createModernFrameworkFallback(type, prompt)
    return res.status(200).json({
      success: true,
      projectStructure: fallbackProject,
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      framework: fallbackProject.framework
    })

  } catch (error) {
    console.error("Handler error:", error)

    const { prompt = "error", type = "Website" } = req.body || {}
    const fallbackProject = createModernFrameworkFallback(type, prompt)

    return res.status(200).json({
      success: true,
      projectStructure: fallbackProject,
      type: type,
      apiUsed: "fallback",
      timestamp: new Date().toISOString(),
      framework: fallbackProject.framework,
      error: error.message
    })
  }
}

// 🚀 Parse AI response into framework project structure
function parseFrameworkProject(aiResponse, projectType, userPrompt) {
  try {
    // Try to parse JSON response first
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.files && parsed.framework) {
        return parsed;
      }
    }
  } catch (e) {
    console.log("Failed to parse JSON, creating structured project from text");
  }

  // Fallback: Create structured project from AI text response
  return createModernFrameworkFallback(projectType, userPrompt, aiResponse);
}

// 🚀 Create modern framework fallback projects
function createModernFrameworkFallback(projectType, userPrompt, aiContent = null) {
  const frameworks = {
    Website: "nextjs",
    "Mobile App": "react",
    Game: "react",
    "AI Bot": "nextjs",
    API: "nextjs",
    "AI Tool": "nextjs"
  };

  const framework = frameworks[projectType] || "react";
  
  const projects = {
    nextjs: createNextJSProject(projectType, userPrompt, aiContent),
    react: createReactProject(projectType, userPrompt, aiContent)
  };

  return projects[framework];
}

// 🚀 Create React project structure
function createReactProject(projectType, userPrompt, aiContent) {
  return {
    framework: "react",
    files: {
      "package.json": JSON.stringify({
        "name": `mindforge-${projectType.toLowerCase().replace(/\s+/g, '-')}`,
        "version": "0.1.0",
        "private": true,
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1",
          "framer-motion": "^10.16.4",
          "lucide-react": "^0.292.0",
          "tailwindcss": "^3.3.0",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31"
        },
        "scripts": {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        "eslintConfig": {
          "extends": ["react-app", "react-app/jest"]
        },
        "browserslist": {
          "production": [">0.2%", "not dead", "not op_mini all"],
          "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        }
      }, null, 2),
      
      "public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${projectType} generated by MindForge AI" />
    <title>${projectType} - MindForge AI</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

      "src/index.js": `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

      "src/App.js": `import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <Hero title="${projectType}" description="${userPrompt}" />
      <Features />
      <Footer />
    </div>
  );
}

export default App;`,

      "src/components/Header.js": `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-white/10 backdrop-blur-md z-50 border-b border-white/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-white"
          >
            MindForge
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href={\`#\${item.toLowerCase()}\`}
                whileHover={{ scale: 1.1 }}
                className="text-white/80 hover:text-white transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;`,

      "src/components/Hero.js": `import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = ({ title, description }) => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-purple-400" />
            </motion.div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
            {description}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;`,

      "src/components/Features.js": `import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Rocket, Star } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with modern React for optimal performance'
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Enterprise-grade security built-in from the ground up'
  },
  {
    icon: Rocket,
    title: 'Scalable',
    description: 'Designed to grow with your business needs'
  },
  {
    icon: Star,
    title: 'Modern',
    description: 'Latest React patterns and best practices'
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Features
          </h2>
          <p className="text-white/80 text-xl">
            Everything you need to build amazing applications
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;`,

      "src/components/Footer.js": `import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-white/20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-white/80 mb-4 md:mb-0"
          >
            © 2024 MindForge AI. Built with modern React.
          </motion.div>
          
          <div className="flex space-x-4">
            {[Github, Twitter, Linkedin].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,

      "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,

      "src/App.css": `.App {
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`,

      "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}`,

      "README.md": `# ${projectType} - MindForge AI

A modern ${projectType.toLowerCase()} built with React, Tailwind CSS, and Framer Motion.

## Features

- ⚡ React 18 with modern hooks
- 🎨 Tailwind CSS for styling
- 🎭 Framer Motion animations
- 📱 Fully responsive design
- 🎯 Modern React patterns
- 🔧 Create React App setup

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm start
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- \`src/\` - Source files
- \`src/components/\` - Reusable React components
- \`public/\` - Static assets

## Build for Production

\`\`\`bash
npm run build
\`\`\`

Generated by MindForge AI 🚀`
    },
    setupInstructions: "1. Run 'npm install' 2. Run 'npm start' 3. Open http://localhost:3000",
    features: ["React 18", "Tailwind CSS", "Framer Motion", "Responsive Design", "Modern Components", "Create React App"]
  };
}

// 🚀 Create Next.js project structure
function createNextJSProject(projectType, userPrompt, aiContent) {
  return {
    framework: "nextjs",
    files: {
      "package.json": JSON.stringify({
        "name": `mindforge-${projectType.toLowerCase().replace(/\s+/g, '-')}`,
        "version": "0.1.0",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        "dependencies": {
          "next": "14.0.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "tailwindcss": "^3.3.0",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31",
          "framer-motion": "^10.16.4",
          "lucide-react": "^0.292.0",
          "@types/node": "^20.8.7",
          "@types/react": "^18.2.31",
          "@types/react-dom": "^18.2.14",
          "typescript": "^5.2.2"
        },
        "devDependencies": {
          "eslint": "^8.52.0",
          "eslint-config-next": "14.0.0"
        }
      }, null, 2),
      
      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`,

      "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}`,

      "app/layout.tsx": `import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${projectType} - MindForge AI',
  description: 'Generated by MindForge AI with modern frameworks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,

      "app/page.tsx": `'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Footer from '@/components/Footer'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <Hero title="${projectType}" description="${userPrompt}" />
      <Features />
      <Footer />
    </main>
  )
}`,

      "components/Header.tsx": `'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-white/10 backdrop-blur-md z-50 border-b border-white/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-white"
          >
            MindForge
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href={\`#\${item.toLowerCase()}\`}
                whileHover={{ scale: 1.1 }}
                className="text-white/80 hover:text-white transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </motion.header>
  )
}`,

      "components/Hero.tsx": `'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroProps {
  title: string
  description: string
}

export default function Hero({ title, description }: HeroProps) {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-purple-400" />
            </motion.div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
            {description}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}`,

      "components/Features.tsx": `'use client'
import { motion } from 'framer-motion'
import { Zap, Shield, Rocket, Star } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with modern frameworks for optimal performance'
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Enterprise-grade security built-in from the ground up'
  },
  {
    icon: Rocket,
    title: 'Scalable',
    description: 'Designed to grow with your business needs'
  },
  {
    icon: Star,
    title: 'Modern',
    description: 'Latest technologies and best practices'
  }
]

export default function Features() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Features
          </h2>
          <p className="text-white/80 text-xl">
            Everything you need to build amazing applications
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`,

      "components/Footer.tsx": `'use client'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-white/80 mb-4 md:mb-0"
          >
            © 2024 MindForge AI. Built with modern frameworks.
          </motion.div>
          
          <div className="flex space-x-4">
            {[Github, Twitter, Linkedin].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}`,

      "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

body {
  overflow-x: hidden;
}`,

      "README.md": `# ${projectType} - MindForge AI

A modern ${projectType.toLowerCase()} built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 🎭 Framer Motion animations
- 📱 Fully responsive design
- 🔒 TypeScript for type safety
- 🎯 Modern React patterns

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- \`app/\` - Next.js app directory
- \`components/\` - Reusable React components
- \`public/\` - Static assets

## Deployment

Deploy easily on Vercel:

\`\`\`bash
npm run build
\`\`\`

Generated by MindForge AI 🚀`
    },
    setupInstructions: "1. Run 'npm install' 2. Run 'npm run dev' 3. Open http://localhost:3000",
    features: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Responsive Design", "Modern Components"]
  };
}

// 🆓 FREE OpenRouter API call (Free Claude access)
async function callOpenRouterAPI(prompt, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://mindforge.vercel.app",
      "X-Title": "MindForge AI"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        {
          role: "system",
          content: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications with:

🎨 DESIGN EXCELLENCE:
- Modern, clean, and visually appealing interfaces
- Responsive design that works perfectly on all devices
- Professional color schemes and typography
- Smooth animations and transitions
- Intuitive user experience

💻 TECHNICAL EXCELLENCE:
- Clean, semantic HTML5 structure
- Modern CSS3 with Flexbox/Grid layouts
- Vanilla JavaScript with ES6+ features
- Cross-browser compatibility
- Performance optimized code
- Accessibility best practices

🚀 ADVANCED FEATURES:
- Interactive components and functionality
- Local storage for data persistence
- Form validation and user feedback
- Loading states and error handling
- Progressive enhancement
- Mobile-first responsive design

Always return complete, production-ready HTML files with embedded CSS and JavaScript. Make it look professional and modern, not basic or template-like.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 8192
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// 🆓 FREE Groq API call (High-speed inference)
async function callGroqAPI(prompt, apiKey) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications with advanced features, responsive design, and clean code. Always return complete HTML files with embedded CSS and JavaScript.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 8192
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// 🚀 Create MODERN FRAMEWORK prompts
function createAdvancedPrompt(userPrompt, projectType) {
  const frameworkInstructions = {
    Website: `Create a modern React/Next.js website project with:
- Multiple component files (Header, Hero, Features, Footer)
- Tailwind CSS for styling
- React hooks for state management
- Responsive design with mobile-first approach
- Modern animations with Framer Motion
- TypeScript for type safety
- API routes for backend functionality`,
    
    "Mobile App": `Create a React Native or Next.js PWA project with:
- Component-based architecture
- Navigation system (React Navigation)
- State management (Redux/Zustand)
- Native-like UI components
- Touch gestures and animations
- Offline capabilities
- Push notification setup`,
    
    Game: `Create a React/Vue game project with:
- Game engine integration (Phaser.js/Three.js)
- Component-based game objects
- State management for game logic
- Canvas rendering with React/Vue
- Sound system integration
- Leaderboard with API
- Responsive game controls`,
    
    "AI Bot": `Create a modern chat application with:
- React/Vue frontend with real-time updates
- WebSocket integration
- Message components with TypeScript
- State management for chat history
- AI API integration
- Dark/light theme system
- Progressive Web App features`,
    
    API: `Create a full-stack API project with:
- Next.js API routes or Express.js backend
- Frontend documentation site (React/Vue)
- OpenAPI/Swagger integration
- Authentication middleware
- Database integration (Prisma/MongoDB)
- Rate limiting and security
- Interactive API testing interface`,
    
    "AI Tool": `Create a modern AI tool with:
- React/Vue dashboard interface
- Real-time data visualization (Chart.js/D3)
- File upload and processing
- WebSocket for real-time updates
- State management for complex data
- Export functionality (PDF/CSV)
- Responsive design with modern UI library`
  }

  return `Create a complete, modern framework project for a ${projectType}.

🎯 PROJECT REQUIREMENTS:
${frameworkInstructions[projectType]}

📝 USER REQUEST: "${userPrompt}"

🏗️ PROJECT STRUCTURE:
Generate a complete project with multiple files including:
- package.json with all necessary dependencies
- Main application files (App.js/tsx, index.js/tsx)
- Component files (separate .jsx/.tsx files)
- Styling files (CSS modules, Tailwind, or styled-components)
- Configuration files (next.config.js, vite.config.js, etc.)
- README.md with setup instructions

🎨 MODERN STANDARDS:
- Use latest React 18+ features (hooks, concurrent features)
- TypeScript for type safety
- Modern CSS (Tailwind CSS, CSS-in-JS, or CSS modules)
- Component composition patterns
- Custom hooks for logic reuse
- Error boundaries and loading states
- Accessibility (ARIA labels, semantic HTML)

💻 TECHNICAL REQUIREMENTS:
- Modern build tools (Vite, Next.js, or Create React App)
- ESLint and Prettier configuration
- Environment variable setup
- API integration patterns
- State management (Context API, Zustand, or Redux Toolkit)
- Routing (React Router or Next.js routing)
- Performance optimizations (lazy loading, memoization)

🚀 ADVANCED FEATURES:
- Server-side rendering (if Next.js)
- Progressive Web App capabilities
- Real-time features (WebSockets)
- Database integration patterns
- Authentication system
- Testing setup (Jest, React Testing Library)
- Deployment configuration (Vercel, Netlify)

Return the response in this JSON format:
{
  "framework": "react|nextjs|vue|nuxt",
  "files": {
    "package.json": "...",
    "src/App.jsx": "...",
    "src/components/Header.jsx": "...",
    "README.md": "...",
    // ... more files
  },
  "setupInstructions": "Step by step setup guide",
  "features": ["list", "of", "implemented", "features"]
}

Make it production-ready with modern best practices, not a basic tutorial project.`
}

// Clean HTML result
function cleanHTMLResult(html) {
  if (!html || typeof html !== "string") return ""

  let cleaned = html.trim()

  // Remove markdown code blocks
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.replace(/^```html\s*/, "").replace(/\s*```$/, "")
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "")
  }

  return cleaned.trim()
}

// 🚀 Wrap content in ADVANCED HTML structure
function wrapInAdvancedHTMLStructure(content, type) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge AI</title>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --secondary: #f1f5f9;
      --accent: #06b6d4;
      --text: #1e293b;
      --text-light: #64748b;
      --bg: #ffffff;
      --bg-alt: #f8fafc;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.6; 
      color: var(--text);
      background: linear-gradient(135deg, var(--bg-alt) 0%, var(--secondary) 100%);
      min-height: 100vh;
    }
    
    .mindforge-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 2rem; 
    }
    
    .mindforge-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--bg);
      border-radius: 16px;
      box-shadow: var(--shadow);
    }
    
    .mindforge-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    
    .mindforge-header p {
      color: var(--text-light);
      font-size: 1.1rem;
    }
    
    .mindforge-content {
      background: var(--bg);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      padding: 3rem;
      margin: 2rem 0;
      position: relative;
      overflow: hidden;
    }
    
    .mindforge-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }
    
    .btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: var(--shadow);
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .mindforge-container { padding: 1rem; }
      .mindforge-content { padding: 2rem; }
      .mindforge-header h1 { font-size: 2rem; }
    }
    
    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .mindforge-content {
      animation: fadeInUp 0.6s ease-out;
    }
  </style>
</head>
<body>
  <div class="mindforge-container">
    <div class="mindforge-header">
      <h1>🚀 ${type} Generated</h1>
      <p>Powered by Claude Sonnet & MindForge AI</p>
    </div>
    <div class="mindforge-content">
      ${content}
    </div>
  </div>
  <script>
    console.log('✨ ${type} created with MindForge AI v2.0 + Claude Sonnet');
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  </script>
</body>
</html>`
}

// 🚀 Create ADVANCED fallback HTML
function createAdvancedFallbackHTML(type, prompt) {
  const templates = {
    Website: `
      <style>
        .header { background: #007bff; color: white; padding: 2rem; text-align: center; border-radius: 8px; margin-bottom: 2rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .feature { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
        .feature h3 { color: #007bff; margin-bottom: 1rem; }
        .cta { background: #28a745; color: white; padding: 2rem; text-align: center; border-radius: 8px; margin: 2rem 0; }
        .btn { background: white; color: #28a745; border: none; padding: 1rem 2rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
      </style>
      <div class="header">
        <h1>Welcome to Our Website</h1>
        <p>Professional web solution built with MindForge</p>
      </div>
      <div class="features">
        <div class="feature">
          <h3>🚀 Fast</h3>
          <p>Quick loading and smooth performance</p>
        </div>
        <div class="feature">
          <h3>📱 Responsive</h3>
          <p>Works great on all devices</p>
        </div>
        <div class="feature">
          <h3>🎨 Modern</h3>
          <p>Clean and professional design</p>
        </div>
      </div>
      <div class="cta">
        <h2>Your Request</h2>
        <p>"${prompt.substring(0, 100)}..."</p>
        <button class="btn" onclick="alert('Getting started!')">Get Started</button>
      </div>`,

    "Mobile App": `
      <style>
        .phone { max-width: 350px; margin: 0 auto; background: #000; padding: 10px; border-radius: 25px; }
        .screen { background: #007bff; border-radius: 15px; overflow: hidden; }
        .status { display: flex; justify-content: space-between; padding: 0.5rem 1rem; color: white; font-size: 0.9rem; }
        .app-header { background: rgba(255,255,255,0.1); color: white; padding: 1.5rem; text-align: center; }
        .content { background: #f8f9fa; padding: 1.5rem; min-height: 300px; }
        .menu-item { background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; display: flex; align-items: center; gap: 1rem; }
        .nav { display: flex; background: white; }
        .nav-item { flex: 1; padding: 1rem; text-align: center; color: #666; }
        .nav-item.active { color: #007bff; }
      </style>
      <div class="phone">
        <div class="screen">
          <div class="status">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div class="app-header">
            <h2>Mobile App</h2>
            <p>Your request: "${prompt.substring(0, 40)}..."</p>
          </div>
          <div class="content">
            <div class="menu-item">
              <span>🏠</span>
              <div>
                <h4>Home</h4>
                <p style="color: #666; font-size: 0.9rem;">Main dashboard</p>
              </div>
            </div>
            <div class="menu-item">
              <span>⚙️</span>
              <div>
                <h4>Settings</h4>
                <p style="color: #666; font-size: 0.9rem;">App preferences</p>
              </div>
            </div>
            <div class="menu-item">
              <span>📊</span>
              <div>
                <h4>Stats</h4>
                <p style="color: #666; font-size: 0.9rem;">View analytics</p>
              </div>
            </div>
          </div>
          <div class="nav">
            <div class="nav-item active">🏠</div>
            <div class="nav-item">🔍</div>
            <div class="nav-item">❤️</div>
            <div class="nav-item">👤</div>
          </div>
        </div>
      </div>`,

    Game: `
      <style>
        .game { background: #1a1a1a; color: white; padding: 2rem; border-radius: 12px; text-align: center; max-width: 500px; margin: 0 auto; }
        .game h1 { color: #00ff00; margin-bottom: 1rem; font-size: 2rem; }
        .game-area { background: #333; padding: 2rem; border-radius: 8px; margin: 1rem 0; }
        .score { display: flex; justify-content: space-around; margin: 1rem 0; }
        .score div { background: #444; padding: 1rem; border-radius: 8px; }
        .controls { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .game-btn { background: #00ff00; color: #1a1a1a; border: none; padding: 1rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .game-btn:hover { background: #00cc00; }
      </style>
      <div class="game">
        <h1>🎮 Game</h1>
        <p>Game: "${prompt.substring(0, 60)}..."</p>
        <div class="score">
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">0</div>
            <div>Score</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">1</div>
            <div>Level</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; color: #00ff00;">3</div>
            <div>Lives</div>
          </div>
        </div>
        <div class="game-area">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">🎯 Ready to Play?</p>
          <p>Click Start to begin!</p>
        </div>
        <div class="controls">
          <button class="game-btn" onclick="alert('Game starting!')">Start</button>
          <button class="game-btn" onclick="alert('Instructions: Use arrow keys to play!')">Help</button>
        </div>
      </div>`,
  }

  const template = templates[type] || templates.Website

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type} - MindForge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: #f0f2f5; 
      padding: 1rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .app { width: 100%; max-width: 800px; }
  </style>
</head>
<body>
  <div class="app">
    ${template}
  </div>
  <script>
    console.log('✨ ${type} created with MindForge AI v2.0 - Advanced Fallback');
  </script>
</body>
</html>`
}
