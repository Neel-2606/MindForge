const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple .env parser
function getEnvValue(key) {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(new RegExp(`^${key}=(.*)`, 'm'));
            if (match) return match[1].trim();
        }
    } catch (e) { }
    return process.env[key];
}

async function testGemini() {
    const apiKey = getEnvValue('GEMINI_API_KEY');
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("🔑 API Key found (starts with):", apiKey.substring(0, 8) + "...");

    const model = "gemini-2.0-flash";
    console.log(`💎 Testing model: ${model}...`);

    const prompt = "Say 'Hello from Gemini' if you are working.";

    const postData = JSON.stringify({
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(data);
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    console.log("✅ API Response:", text);
                    console.log("🎉 Gemini API is WORKING!");
                } catch (e) {
                    console.error("❌ Failed to parse response:", e.message);
                    console.log("Raw data:", data);
                }
            } else {
                console.error(`❌ API Error: ${res.statusCode}`);
                console.log("Response:", data);
            }
        });
    });

    req.on('error', (e) => {
        console.error("❌ Request Error:", e.message);
    });

    req.write(postData);
    req.end();
}

testGemini();
