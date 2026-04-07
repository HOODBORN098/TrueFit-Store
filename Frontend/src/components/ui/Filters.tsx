import React from 'react';
import { X } from 'lucide-react';
interface FilterState {
  category: string[];
  size: string[];
  color: string[];
  priceRange: string;
}
interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}
export function Filters({
  filters,
  onChange,
  onClose,
  isMobile = false
}: FiltersProps) {
  const categories = [
    'T-Shirts',
    'Shirts',
    'Hoodies',
    'Sweaters',
    'Jackets',
    'Outerwear',
    'Tracksuits',
    'Bottoms',
    'Pants',
    'Shorts',
    'Dresses',
    'Jumpsuits',
    'Knitwear',
    'Footwear',
    'Caps',
    'Bags',
    'Jewelry',
    'Accessories',
  ];

  const sizes = ['S', 'M', 'L', 'XL', '28', '30', '32', '34'];
  const colors = ['Black', 'White', 'Beige', 'Grey', 'Blue', 'Green'];
  const prices = ['Under KSH 5,000', 'KSH 5,000 - KSH 10,000', 'KSH 10,000 - KSH 20,000', 'Over KSH 20,000'];
  const toggleFilter = (key: keyof FilterState, value: string) => {
    if (key === 'priceRange') {
      onChange({
        ...filters,
        priceRange: filters.priceRange === value ? '' : value
      });
      return;
    }
    const current = filters[key] as string[];
    const updated = current.includes(value) ?
    current.filter((item) => item !== value) :
    [...current, value];
    onChange({
      ...filters,
      [key]: updated
    });
  };
  const FilterSection = ({
    title,
    children



  }: {title: string;children: React.ReactNode;}) =>
  <div className="border-b border-gray-200 py-6 last:border-0">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>;

  return (
    <div className={`bg-white h-full ${isMobile ? 'p-6' : 'pr-8'}`}>
      {isMobile &&
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold uppercase tracking-wide">Filters</h2>
          <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full">

            <X size={20} />
          </button>
        </div>
      }

      <div className="space-y-1">
        <FilterSection title="Category">
          {categories.map((cat) =>
          <button
            key={cat}
            type="button"
            onClick={() => toggleFilter('category', cat)}
            className="flex items-center space-x-3 cursor-pointer group w-full text-left">

              <div
              className={`
                w-4 h-4 border border-gray-300 flex items-center justify-center transition-colors flex-shrink-0
                ${filters.category.includes(cat) ? 'bg-black border-black' : 'group-hover:border-gray-500'}
              `}>

                {filters.category.includes(cat) &&
              <div className="w-2 h-2 bg-white" />
              }
              </div>
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                {cat}
              </span>
            </button>
          )}
        </FilterSection>

        <FilterSection title="Size">
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) =>
            <button
              key={size}
              type="button"
              onClick={() => toggleFilter('size', size)}
              className={`
                  py-2 text-xs font-medium border transition-all
                  ${filters.size.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                `}>

                {size}
              </button>
            )}
          </div>
        </FilterSection>

        <FilterSection title="Color">
          {colors.map((color) =>
          <button
            key={color}
            type="button"
            onClick={() => toggleFilter('color', color)}
            className="flex items-center space-x-3 cursor-pointer group w-full text-left">

              <div
              className={`
                w-4 h-4 border border-gray-300 flex items-center justify-center transition-colors flex-shrink-0
                ${filters.color.includes(color) ? 'bg-black border-black' : 'group-hover:border-gray-500'}
              `}>

                {filters.color.includes(color) &&
              <div className="w-2 h-2 bg-white" />
              }
              </div>
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                {color}
              </span>
            </button>
          )}
        </FilterSection>

        <FilterSection title="Price">
          {prices.map((price) =>
          <button
            key={price}
            type="button"
            onClick={() => toggleFilter('priceRange', price)}
            className="flex items-center space-x-3 cursor-pointer group w-full text-left">

              <div
              className={`
                w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors flex-shrink-0
                ${filters.priceRange === price ? 'border-black' : 'group-hover:border-gray-500'}
              `}>

                {filters.priceRange === price &&
              <div className="w-2 h-2 rounded-full bg-black" />
              }
              </div>
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                {price}
              </span>
            </button>
          )}
        </FilterSection>
      </div>
    </div>);

}
