const fs = require('fs');
const path = require('path');
const https = require('https');

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

async function callGeminiAPI(prompt, apiKey) {
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const model of models) {
        try {
            console.log(`💎 Trying Gemini model: ${model}...`);

            const response = await new Promise((resolve, reject) => {
                const postData = JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an expert full-stack developer and UI/UX designer. Create modern, professional, and fully functional web applications.
              
              IMPORTANT: Return ONLY the raw code or JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
              
              ${prompt}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 8192,
                    }
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
                    res.on('data', c => data += c);
                    res.on('end', () => {
                        resolve({
                            ok: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            data: data
                        });
                    });
                });

                req.on('error', reject);
                req.write(postData);
                req.end();
            });

            if (!response.ok) {
                console.log(`❌ Error ${response.status}: ${response.data}`);
                if (response.status === 404) {
                    console.log(`Model ${model} not found, trying next...`);
                    continue;
                }
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = JSON.parse(response.data);
            const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content || content.length < 50) {
                console.log("❌ Content too short or empty:", content);
                throw new Error("API returned empty or too short response");
            }

            console.log(`✅ Success with ${model}!`);
            console.log("Response Preview:", content.substring(0, 200));
            return content;

        } catch (error) {
            console.error(`Gemini model ${model} failed:`, error.message);
            if (model === models[models.length - 1]) console.error("All models failed.");
        }
    }
}

async function test() {
    const apiKey = getEnvValue('GEMINI_API_KEY');
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found");
        process.exit(1);
    }

    await callGeminiAPI("Create a fintech startup website", apiKey);
}

test();
