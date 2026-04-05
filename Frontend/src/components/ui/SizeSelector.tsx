
import { ProductSize } from '../../types';

interface SizeSelectorProps {
  sizes: (string | ProductSize)[];
  selectedSize?: string;
  onChange: (size: string) => void;
  error?: boolean;
  onSizeGuideClick?: () => void;
}
export function SizeSelector({
  sizes,
  selectedSize,
  onChange,
  error,
  onSizeGuideClick
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium uppercase tracking-wide">
          Size
        </span>
        <button 
          type="button"
          onClick={onSizeGuideClick}
          className="text-xs text-gray-500 underline underline-offset-4 decoration-1 hover:text-black transition-colors"
        >
          Size Guide
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((sizeObj) => {
          const sizeName = typeof sizeObj === 'string' ? sizeObj : sizeObj.name;
          return (
            <button
              key={sizeName}
              onClick={() => onChange(sizeName)}
              className={`
                  py-3 text-sm font-medium transition-all duration-200
                  ${selectedSize === sizeName ? 'bg-black text-white border border-black' : 'bg-white text-black border border-gray-200 hover:border-black'}
                  ${error ? 'border-red-500' : ''}
                `}>
                {sizeName}
              </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500">Please select a size</p>}
    </div>
  );
}
