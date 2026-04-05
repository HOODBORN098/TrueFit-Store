import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Product, Page } from '../types';
import { fetchProducts } from '../api';
import { ProductCard } from '../components/ui/ProductCard';
import { ImageGallery } from '../components/ui/ImageGallery';
import { SizeSelector } from '../components/ui/SizeSelector';
import { ColorSelector } from '../components/ui/ColorSelector';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
interface ProductDetailPageProps {
  product: Product;
  onNavigate: (page: Page) => void;
  onProductClick: (product: Product) => void;
}
export function ProductDetailPage({
  product,
  onNavigate,
  onProductClick
}: ProductDetailPageProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0); // Ensure page scrolls to top when product changes
    if (product?.category) {
      fetchProducts({ category: product.category })
        .then(data => {
          // Filter out the current product and limit to 4
          const filtered = data.results
            .filter(p => p.id.toString() !== product.id)
            .slice(0, 4)
            .map(p => ({
              ...p,
              images: p.image_url ? [p.image_url] : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800']),
              id: p.id.toString(),
              price: parseFloat(p.price),
            } as unknown as Product));
          setRelatedProducts(filtered);
        })
        .catch(err => console.error('Failed to fetch related products:', err));
    }
  }, [product]);

  const sizeObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
  const currentPrice = sizeObj && typeof sizeObj !== 'string' ? sizeObj.price : product.price;
  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      setError(true);
      showToast('Please select a size and color', 'error');
      return;
    }
    setError(false);
    setIsAdding(true);
    // Simulate a brief delay for feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // We pass the size-specific price directly, or CartContext will compute it.
    // Assuming CartContext needs to know the correct item price, we should update the product object safely
    // or just pass it as is and let CartContext figure out the price, which is cleaner.
    addItem(product, selectedSize, selectedColor, quantity);
    
    showToast(`${product.name} added to cart`, 'success');
    setIsAdding(false);
  };
  return (
    <div className="max-w-[1920px] mx-auto px-6 py-8 animate-fade-in text-black">
      <Helmet>
        <title>{product.name} | XIV-STORE</title>
        <meta name="description" content={product.description} />
      </Helmet>
      {/* Back button and Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center text-sm text-gray-500 hover:text-black transition-colors group">

          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform" />

          Back to Shop
        </button>
        <Breadcrumb
          items={[
            {
              label: 'Shop',
              page: 'shop'
            },
            {
              label: product.category,
              page: 'shop'
            },
            {
              label: product.name
            }]
          }
          onNavigate={onNavigate} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Gallery */}
        <div className="w-full">
          <ImageGallery images={product.images} />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col h-full lg:sticky lg:top-24 lg:self-start">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-medium">KSH {currentPrice.toLocaleString()}</span>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`mt-2 p-2 rounded-full border transition-colors ${
                    isInWishlist(product.id) ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            
            {product.stock > 0 && product.stock < 10 && (
              <div className="mb-4 inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                Only {product.stock} left in stock!
              </div>
            )}
            {product.stock === 0 && (
              <div className="mb-4 inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                Sold Out
              </div>
            )}
            <p className="text-gray-600 leading-relaxed max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <ColorSelector
              colors={product.colors}
              selectedColor={selectedColor}
              onChange={(c) => {
                setSelectedColor(c);
                setError(false);
              }}
              error={error && !selectedColor} />


            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onChange={(s) => {
                setSelectedSize(s);
                setError(false);
              }}
              error={error && !selectedSize}
              onSizeGuideClick={() => onNavigate('size-guide')} 
            />


            <div className="space-y-3">
              <span className="text-sm font-medium uppercase tracking-wide">
                Quantity
              </span>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>
          </div>

          <div className="mt-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              isLoading={isAdding}
              disabled={product.stock === 0}
              className="mb-4">

              {product.stock === 0 ? 'Sold Out' : `Add to Cart - KSH ${(currentPrice * quantity).toLocaleString()}`}
            </Button>

            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500 uppercase tracking-wider">
              <div className="border border-gray-100 py-4">Shipping Across Kenya</div>
              <div className="border border-gray-100 py-4">Secure Payment</div>
              <div className="border border-gray-100 py-4">30 Day Returns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onClick={() => onProductClick(relatedProduct)}
                onQuickAdd={() => onProductClick(relatedProduct)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-30">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold">{product.name}</span>
          <span className="font-bold">
            KSH {(currentPrice * quantity).toLocaleString()}
          </span>
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleAddToCart}
          isLoading={isAdding}>

          Add to Cart
        </Button>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-32 lg:hidden" />
    </div>);

}
