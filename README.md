
# MASTER MD HUB - AI Media Search (Next.js)

This is a starter Next.js project that implements a secure server-side API for analyzing uploaded media (image/video/audio) and returning AI-generated answers using OpenAI, Google Vision, and ACRCloud. It is intended to be deployed to Vercel (serverless) and the frontend hosted together.

**Important:** Do NOT commit real API keys into the repo. Use Vercel Environment Variables or a local `.env.local` file (not committed).

## Setup (local)
1. Copy or download the project.
2. Create a `.env.local` file in the project root with the following entries (replace placeholders):

```
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_vision_key
ACR_HOST=identify-eu-west-1.acrcloud.com
ACR_ACCESS_KEY=your_acr_access_key
ACR_ACCESS_SECRET=your_acr_access_secret
NEWSAPI_KEY=your_newsapi_key
```

3. Install dependencies and run locally:
```bash
npm install
npm run dev
```

4. Open http://localhost:3000

## Deploy to Vercel
1. Push this repo to GitHub.
2. In Vercel, import the project, set Environment Variables (the same names as `.env.local`) in Project Settings, and deploy.
3. Vercel will build and serve the Next.js app with serverless API routes.

## Notes
- This code is a starting point. For production you should add rate limiting, authentication, proper error handling, and robust file handling for large videos.
- The API keys must be kept secret. Use Vercel environment variables rather than committing `.env.local` to GitHub.
