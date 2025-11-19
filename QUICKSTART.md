# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Keys

**Replicate API:**
1. Sign up at [replicate.com](https://replicate.com)
2. Go to Account Settings → API Tokens
3. Create a new token

**Supabase:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → API
4. Copy the Project URL and anon/public key

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database
1. Open your Supabase project
2. Go to SQL Editor
3. Paste the contents of `supabase-setup.sql`
4. Run the query

### 5. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Generate an Image:**
   - Enter a text prompt
   - Click "Generate Image"
   - Wait for the AI to create your image

2. **Save to Gallery:**
   - Click "Keep Image" to save
   - Or "Discard" to try again

3. **Manage Gallery:**
   - Click "View Gallery"
   - Drag images to reorder
   - Click "Delete" to remove

## Deploy to Vercel

1. Push code to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## Customize AI Model

Edit `app/api/generate/route.ts`:

```typescript
const output = await replicate.run(
  "your-username/your-model:version",
  {
    input: {
      prompt: prompt,
      // Add model-specific parameters
    }
  }
);
```

## Troubleshooting

**Build fails:**
- Ensure all dependencies are installed: `npm install`
- Check that `.env.local` is configured

**Images don't save:**
- Verify Supabase credentials
- Check that database table was created
- Look at browser console for errors

**AI generation fails:**
- Verify Replicate API token
- Check API quota/limits
- Ensure internet connectivity

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review Supabase documentation
- Review Replicate documentation
