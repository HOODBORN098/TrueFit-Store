import { useState } from 'react';
import { Product } from '../../types';
import { Plus, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd?: () => void;
}
export function ProductCard({
  product,
  onClick,
  onQuickAdd
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  return (
    <div
      className="group cursor-pointer flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}>

      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 border-b border-gray-100">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800'}
          alt={product.name}
          className={`
            w-full h-full object-cover transition-transform duration-700 ease-out
            ${isHovered ? 'scale-105' : 'scale-100'}
          `} />


        {/* Secondary image on hover if available */}
        {product.images && product.images.length > 1 &&
          <img
            src={product.images[1]}
            alt={product.name}
            className={`
              absolute inset-0 w-full h-full object-cover transition-opacity duration-500
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `} />

        }

        {/* Quick Add Button */}
        {onQuickAdd && product.stock > 0 &&
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className={`
              absolute bottom-4 right-4 bg-white text-black p-4 rounded-full shadow-lg
              transform transition-all duration-300 hover:bg-black hover:text-white
              ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
            aria-label="Quick add to cart">

            <Plus size={24} />
          </button>
        }

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`
            absolute top-4 right-4 p-3 rounded-full shadow-sm transition-all duration-300
            ${isWishlisted ? 'bg-black text-white' : 'bg-white/80 text-gray-400 hover:text-black'}
            ${isHovered || isWishlisted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.stock === 0 &&
            <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Sold Out
            </span>
          }
          {product.newArrival && product.stock > 0 &&
            <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
              New
            </span>
          }
          {product.featured && product.stock > 0 &&
            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Featured
            </span>
          }
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-gray-600 transition-colors uppercase tracking-tight">
            {product.name}
          </h3>
          <span className="text-base md:text-lg font-bold text-black whitespace-nowrap ml-4">
            KSH {product.price.toLocaleString()}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{product.category}</p>
      </div>
    </div>);

}
