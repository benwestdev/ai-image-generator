'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SavedImage } from '@/lib/supabase';

interface SortableImageProps {
  image: SavedImage;
  onDelete: (id: string) => void;
}

function SortableImage({ image, onDelete }: SortableImageProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="relative aspect-square">
        <Image
          src={image.image_url}
          alt={image.prompt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPrompt(!showPrompt);
          }}
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          {showPrompt ? 'Hide' : 'Show'} Prompt
        </button>
        {showPrompt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {image.prompt}
          </p>
        )}
      </div>
    </div>
  );
}

interface ImageGalleryProps {
  images: SavedImage[];
  onReorder: (images: SavedImage[]) => void;
  onDelete: (id: string) => void;
}

export default function ImageGallery({
  images,
  onReorder,
  onDelete,
}: ImageGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      onReorder(newImages);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <SortableImage key={image.id} image={image} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
