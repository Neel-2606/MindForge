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

async function listModels() {
    const apiKey = getEnvValue('GEMINI_API_KEY');
    if (!apiKey) {
        console.log("NO_KEY");
        return;
    }

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${apiKey}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                const valid = parsed.models.filter(m =>
                    m.supportedGenerationMethods &&
                    m.supportedGenerationMethods.includes('generateContent') &&
                    m.name.includes('gemini')
                ).map(m => m.name);

                fs.writeFileSync('models.txt', valid.join('\n'));
                console.log("Wrote models to models.txt");
            } else {
                console.log(`ERROR: ${res.statusCode}`);
            }
        });
    });

    req.end();
}

listModels();
