# 🚀 MindForge Deployment Guide

## Quick Deploy to Vercel

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mindforge)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set the environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
4. Click "Deploy"

#### Option B: Manual Deploy

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Clone and deploy**:
   ```bash
   git clone https://github.com/yourusername/mindforge.git
   cd mindforge
   vercel
   ```

3. **Set environment variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - **Environment**: Production, Preview, Development
4. Click "Save"
5. Redeploy your project

## Alternative Deployment Options

### Netlify

1. **Drag & Drop**:
   - Go to [netlify.com/drop](https://app.netlify.com/drop)
   - Drag your project folder
   - Set environment variable in site settings

2. **Git Integration**:
   - Connect your GitHub repository
   - Set build command: `echo "No build required"`
   - Set publish directory: `.`
   - Add environment variable: `GEMINI_API_KEY`

### GitHub Pages

1. **Enable Pages**:
   - Go to repository Settings → Pages
   - Select source: "Deploy from a branch"
   - Choose branch: `main`
   - Save

2. **Note**: GitHub Pages doesn't support serverless functions, so you'll need to modify the API endpoint or use a different backend service.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check if `GEMINI_API_KEY` is set in environment variables
   - Ensure the variable is available in all environments (Production, Preview, Development)

2. **"Generation failed"**
   - Verify your Gemini API key is valid
   - Check if you have sufficient API quota
   - Review browser console for detailed error messages

3. **"CORS error"**
   - Ensure your domain is properly configured
   - Check if the API endpoint is accessible

### Debug Mode

Add this to your browser console for detailed logging:
```javascript
localStorage.setItem('debug', 'true');
```

### API Testing

Test your API endpoint directly:
```bash
curl -X POST https://your-domain.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a simple calculator","type":"Website"}'
```

## Performance Optimization

1. **Enable Caching**:
   - Add caching headers to API responses
   - Implement client-side caching for repeated requests

2. **Monitor Usage**:
   - Track API calls in Vercel Analytics
   - Monitor Gemini API usage in Google Cloud Console

3. **Rate Limiting**:
   - Implement rate limiting for API endpoints
   - Add request throttling to prevent abuse

## Security Considerations

1. **API Key Protection**:
   - Never expose API keys in client-side code
   - Use environment variables for all sensitive data
   - Regularly rotate API keys

2. **Input Validation**:
   - Validate all user inputs
   - Sanitize prompts before sending to API
   - Implement request size limits

3. **CORS Configuration**:
   - Restrict CORS origins to your domain
   - Use proper CORS headers for security

## Support

If you encounter issues:

1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review [Google Gemini API Documentation](https://ai.google.dev/docs)
3. Create an issue in the GitHub repository
4. Contact: contactmindforgehelp@gmail.com

---

**Happy Deploying! 🚀** 