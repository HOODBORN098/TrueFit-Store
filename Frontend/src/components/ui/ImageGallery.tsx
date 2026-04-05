import React, { useState } from 'react';
interface ImageGalleryProps {
  images: string[];
}
export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden">
        <img
          src={images[selectedIndex]}
          alt="Product detail"
          className="w-full h-full object-cover" />

      </div>

      {/* Thumbnails */}
      {images.length > 1 &&
      <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) =>
        <button
          key={index}
          onClick={() => setSelectedIndex(index)}
          className={`
                aspect-[3/4] overflow-hidden bg-gray-100 transition-all duration-200
                ${selectedIndex === index ? 'ring-2 ring-black ring-offset-2' : 'hover:opacity-80'}
              `}>

              <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover" />

            </button>
        )}
        </div>
      }
    </div>);

}
