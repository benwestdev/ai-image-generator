import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Using SDXL model - you can replace this with your custom model
    const output = await replicate.run(
      "benwestdev/test-jess-img:3a00387e871f62dbb58f7cd19cddc5656ac338b19d0926d8943105f05405f468",
      {
        input: {
          model: "dev",
          prompt: prompt,
          go_fast: false,
          lora_scale: 1,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3,
          output_quality: 80,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28,
          disable_safety_checker: true
        }
      }
    );

    const firstResult = Array.isArray(output) ? output[0] : output;
    const imageUrl =
      typeof firstResult === 'string'
        ? firstResult
        : firstResult?.url?.() ?? firstResult?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    // Fetch the image and inline it as a data URL so it doesn't expire
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch image from Replicate: ${imgRes.status}`);
    }

    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log({ imageUrl, dataUrlLength: dataUrl.length });
    return NextResponse.json({
      success: true,
      image: dataUrl
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
