# AI Image Generator

A Next.js application that generates images using Replicate AI and stores them in Supabase. Features include image generation, a gallery with drag-and-drop ordering, and mobile-friendly design.

## Features

- 🎨 Generate images using AI (Replicate API with SDXL model)
- 💾 Save and manage generated images
- 🖼️ Interactive gallery with drag-and-drop reordering
- 📱 Fully responsive and mobile-friendly
- 🗄️ Supabase backend for data persistence
- ⚡ Built with Next.js 15 and TypeScript
- 🎭 Styled with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- A [Replicate](https://replicate.com/) account and API token
- A [Supabase](https://supabase.com/) project

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-image-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```
REPLICATE_API_TOKEN=your_replicate_api_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Set up Supabase database

Run the following SQL in your Supabase SQL editor to create the `images` table:

```sql
-- Create the images table
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on order_index for better query performance
CREATE INDEX idx_images_order ON images(order_index);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Enable all access for images" ON images
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Generating Images

1. Navigate to the home page
2. Enter a descriptive prompt (e.g., "A serene landscape with mountains and a lake at sunset")
3. Click "Generate Image"
4. Wait for the AI to generate your image
5. Choose to "Keep Image" or "Discard"

### Managing Your Gallery

1. Click "View Gallery" to see all saved images
2. Drag and drop images to reorder them
3. Hover over an image and click "Delete" to remove it
4. Click "Show Prompt" to see the prompt used to generate each image

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel project settings
4. Deploy!

The application is optimized for Vercel deployment with automatic configuration.

## Customizing the AI Model

The application uses Stability AI's SDXL model by default. To use a custom model:

1. Replace the model identifier in `/app/api/generate/route.ts`:

```typescript
const output = await replicate.run(
  "your-username/your-model:version-hash",
  {
    input: {
      prompt: prompt,
      // Add any other parameters your model needs
    }
  }
);
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Replicate API
- **Database:** Supabase
- **Drag & Drop:** @dnd-kit
- **Deployment:** Vercel-ready

## Project Structure

```
ai-image-generator/
├── app/
│   ├── api/
│   │   ├── generate/       # Image generation endpoint
│   │   └── images/         # Image management endpoints
│   ├── gallery/            # Gallery page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   └── ImageGallery.tsx    # Gallery component with drag-and-drop
├── lib/
│   └── supabase.ts         # Supabase client configuration
└── public/                 # Static assets
```

## License

ISC
