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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

function SortableImage({ image, onDelete, onAddToGallery, enableDrag }) {
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
    transform: enableDrag ? CSS.Transform.toString(transform) : undefined,
    transition: enableDrag ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden group cursor-move hover:shadow-lg transition-shadow"
    >
      <div
        className="relative aspect-square bg-muted"
        {...(enableDrag ? { ...attributes, ...listeners } : {})}
      >
        <Image
          src={image.image_url}
          alt={image.prompt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {enableDrag && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
            {onAddToGallery && !image.is_gallery && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToGallery(image.id);
                }}
                size="sm"
                className="bg-white text-black hover:bg-white/90"
              >
                Add to gallery
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <CardFooter className="p-4">
        <div className="w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowPrompt(!showPrompt);
            }}
            variant="ghost"
            size="sm"
            className="w-full justify-start px-0"
          >
            {showPrompt ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Prompt
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Prompt
              </>
            )}
          </Button>
          {showPrompt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {image.prompt}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ImageGallery({ images, onReorder, onDelete, onAddToGallery }) {
  const enableDrag = Boolean(onReorder);

  const sensors = enableDrag
    ? useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        }),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      )
    : null;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!enableDrag) return;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      onReorder?.(newImages);
    }
  };

  if (!enableDrag) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <SortableImage
            key={image.id}
            image={image}
            onDelete={onDelete}
            onAddToGallery={onAddToGallery}
            enableDrag={false}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              onDelete={onDelete}
              onAddToGallery={onAddToGallery}
              enableDrag
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
