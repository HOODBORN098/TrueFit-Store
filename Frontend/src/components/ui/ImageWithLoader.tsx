import React, { useState, lazy } from 'react';
interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}
export function ImageWithLoader({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[3/4]'
}: ImageWithLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectRatio}`}>
      {/* Skeleton loader */}
      {!isLoaded && !hasError && <div className="absolute inset-0 skeleton" />}

      {/* Error state */}
      {hasError &&
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Image unavailable
          </span>
        </div>
      }

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy" />

    </div>);

}
