# Quick Setup Guide - Fixing API Key Issues

## The Problem
If you're seeing this error:
```
{"error":{"code":403,"message":"Your API key was reported as leaked. Please use another API key.","status":"PERMISSION_DENIED"}}
```

Your API key has been flagged as leaked and needs to be replaced.

## Solution: Get a New API Key

### Step 1: Get a New API Key
1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key" or go to API Keys section
4. Create a new API key
5. **Important**: Make sure the key has access to:
   - Gemini API (for recipe generation)
   - Veo API (for video generation) - this may require special access

### Step 2: Update Your .env.local File

1. Open or create `.env.local` in the project root
2. Add your new API key:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```
3. Replace `your_new_api_key_here` with your actual key (no quotes needed)

### Step 3: Restart the Dev Server

**IMPORTANT**: You must restart the dev server after changing the API key!

1. Stop the current server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Verify It Works

1. Open the app in your browser (usually `http://localhost:3000`)
2. Try uploading an image
3. The error should be gone!

## Security Best Practices

1. **Never commit `.env.local`** - It's already in .gitignore
2. **Never share your API key** - Keep it private
3. **Rotate keys regularly** - If a key is leaked, create a new one
4. **Use environment variables** - Never hardcode keys in source code

## Troubleshooting

### Still Getting 403 Error?
- Make sure you copied the entire API key (no extra spaces)
- Verify the key is active in Google Cloud Console
- Check that Veo access is enabled (may require special permission)

### API Key Not Working?
- Verify the key format (should start with `AIza...`)
- Check your Google Cloud billing is set up
- Ensure you have quota/credits available

### Video Generation Not Working?
- Veo access may require special permission
- Check your Google Cloud project settings
- Verify billing is enabled

## Need Help?

- Check the main README.md for more setup instructions
- Review AGENT_FEATURES.md for agent capabilities
- Verify your .env.local file format is correct

