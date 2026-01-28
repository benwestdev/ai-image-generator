import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryOnly = searchParams.get('gallery') === 'true';
    const favoriteOnly = searchParams.get('favorite') === 'true';

    let query = supabase.from('images').select('*');

    if (galleryOnly) {
      query = query.eq('is_gallery', true);
    }
    if (favoriteOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ images: data });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { image_url, prompt, is_gallery = false, is_favorite = false } =
      await request.json();

    if (!image_url || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // Get the current max order_index
    const { data: maxOrderData } = await supabase
      .from('images')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;

    const { data, error } = await supabase
      .from('images')
      .insert([
        {
          image_url,
          prompt,
          order_index: nextOrderIndex,
          is_gallery,
          is_favorite,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, image: data });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { images, id, is_gallery, is_favorite } = await request.json();

    // Reorder case
    if (Array.isArray(images)) {
      const updates = images.map((img, index) =>
        supabase
          .from('images')
          .update({ order_index: index })
          .eq('id', img.id)
      );

      await Promise.all(updates);

      return NextResponse.json({ success: true });
    }

    // Toggle gallery flag
    if (
      id &&
      (typeof is_gallery === 'boolean' || typeof is_favorite === 'boolean')
    ) {
      const update = {};
      if (typeof is_gallery === 'boolean') update.is_gallery = is_gallery;
      if (typeof is_favorite === 'boolean') update.is_favorite = is_favorite;

      const { data, error } = await supabase
        .from('images')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, image: data });
    }

    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating image order:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
