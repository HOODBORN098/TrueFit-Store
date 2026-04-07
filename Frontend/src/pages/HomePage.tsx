import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ui/ProductCard';
import { NewsletterForm } from '../components/ui/NewsletterForm';
import { Page, Product } from '../types';
import { fetchProducts } from '../api';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onProductClick: (product: Product) => void;
}

export function HomePage({ onNavigate, onProductClick }: HomePageProps) {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(data => {
        const parsedData = data.results.map((p) => ({
          ...p,
          images: p.image_url ? [p.image_url] : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800']),
          id: p.id.toString(),
          price: parseFloat(p.price),
        } as unknown as Product));
        setProductsData(parsedData);
      })
      .catch(err => console.error('Failed to fetch products for home:', err))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = productsData.filter((p) => p.featured).slice(0, 4);
  const newArrivals = productsData.filter((p) => p.newArrival).slice(0, 4);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=2070",
      title: "Master the Minimal",
      subtitle: "The 2026 Edit",
      description: "Precision-cut tailoring meets innovative fabrics. Kenya's premier cornerstone pieces of a modern wardrobe."
    },
    {
      image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=2070",
      title: "Obsidian Series",
      subtitle: "New Arrivals",
      description: "A study in depth and texture. Local craftsmanship featuring our signature deep-dye velvet and structured silhouettes."
    },
    {
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2000",
      title: "True to Fit",
      subtitle: "Quality First",
      description: "Luxury fabrics designed to be lived in and built to last. Premium standards, delivered across Kenya."
    }
  ];
  
  const categories = [
    { name: 'T-Shirts', id: 'T-Shirts', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Hoodies', id: 'Hoodies', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400' },
    { name: 'Jackets', id: 'Jackets', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400' },
    { name: 'Bottoms', id: 'Bottoms', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pants', id: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400' },
    { name: 'Footwear', id: 'Footwear', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=400' },
    { name: 'Accessories', id: 'Accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=400' },
    { name: 'Dresses', id: 'Dresses', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=400' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleCategoryClick = (categoryName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', categoryName);
    window.history.pushState({}, '', url.pathname + '?' + url.searchParams.toString());
    window.dispatchEvent(new Event('search-change'));
    onNavigate('shop');
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative h-[75vh] md:h-[95vh] w-full overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-start text-center text-white px-6 pt-32 pb-72 md:pb-[32rem]">
              <span className={`inline-block px-4 py-1.5 mb-8 border border-white/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {slide.subtitle}
              </span>
              <h1 className={`text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 font-serif transition-all duration-700 delay-500 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {slide.title.includes(' ') ? (
                  <>
                    {slide.title.split(' ')[0]}<br className="hidden md:block" /> {slide.title.split(' ').slice(1).join(' ')}
                  </>
                ) : slide.title}
              </h1>
              <p className={`text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto text-white/90 transition-all duration-700 delay-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {slide.description}
              </p>
              <div className={`flex flex-col sm:flex-row gap-6 transition-all duration-700 delay-1000 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Button
                  variant="white"
                  size="lg"
                  className="min-w-[200px] shadow-xl"
                  onClick={() => onNavigate('shop')}>
                  Shop Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white/10 min-w-[200px] backdrop-blur-sm"
                  onClick={() => onNavigate('collections')}>
                  View Lookbook
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-6 pointer-events-none">
          <button
            onClick={prevSlide}
            className="p-4 hover:bg-white/10 rounded-full transition-colors pointer-events-auto group"
            aria-label="Previous slide"
          >
            <ChevronLeft size={32} className="text-white/50 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={nextSlide}
            className="p-4 hover:bg-white/10 rounded-full transition-colors pointer-events-auto group"
            aria-label="Next slide"
          >
            <ChevronRight size={32} className="text-white/50 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-64 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all duration-500 ${index === currentSlide ? 'w-12 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Category Shortcuts */}
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-4 overflow-x-auto no-scrollbar scroll-smooth bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-start md:justify-center gap-6 px-6 md:px-12 min-w-max pb-2">
            {categories.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center group cursor-pointer transform transition-transform active:scale-95"
              >
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border border-white/30 backdrop-blur-sm p-1 group-hover:border-white transition-all duration-300 shadow-xl bg-black/5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      loading="lazy"
                    />
                  </div>
                </div>
                <span className="mt-3 text-[9px] md:text-xs font-bold uppercase tracking-[0.15em] text-white/90 group-hover:text-white transition-colors drop-shadow-md">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 md:px-20 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              Curated Selection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
              Featured
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-medium uppercase tracking-wider flex items-center group">

            View All
            <ArrowRight
              size={16}
              className="ml-2 group-hover:translate-x-1 transition-transform" />

          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 stagger-children">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) =>
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                onQuickAdd={() => onProductClick(product)} />
            )
          ) : (
            <div className="col-span-full py-10 text-center text-gray-400 font-medium border border-dashed border-gray-200 uppercase tracking-widest">
              No featured products.
            </div>
          )}
        </div>
      </section>

      {/* Collection Banner */}
      <section className="py-4 px-6 md:px-20 max-w-[1920px] mx-auto">
        <div
          className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden group cursor-pointer"
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('featured', 'true');
            window.history.pushState({}, '', url.pathname + '?' + url.searchParams.toString());
            window.dispatchEvent(new Event('search-change'));
            onNavigate('shop');
          }}>

          <img
            src="https://images.unsplash.com/photo-1558191053-8edcb01e1da3?auto=format&fit=crop&q=80&w=2000"
            alt="The Essentials"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <span className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-80">
              Collection
            </span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 text-center">
              The Essentials
            </h2>
            <span className="flex items-center text-sm font-bold uppercase tracking-widest border-b-2 border-white/50 pb-1 group-hover:border-white transition-colors">
              Explore{' '}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform" />

            </span>
          </div>
        </div>
      </section>

      {/* New This Week */}
      <section className="py-24 px-6 md:px-20 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              Just Arrived
            </span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
              New This Week
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-medium uppercase tracking-wider flex items-center group">

            View All
            <ArrowRight
              size={16}
              className="ml-2 group-hover:translate-x-1 transition-transform" />

          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 stagger-children">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
            ))
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) =>
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                onQuickAdd={() => onProductClick(product)} />
            )
          ) : (
            <div className="col-span-full py-10 text-center text-gray-400 font-medium border border-dashed border-gray-200 uppercase tracking-widest">
              No new arrivals.
            </div>
          )}
        </div>
      </section>

      {/* Editorial Section */}
      <section className="bg-[#F8F8F8] py-32 px-6 md:px-20">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block">
              Our Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8 leading-tight">
              Designed for the Kenyan Minimalist
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              We believe in the power of simplicity. Our collections are crafted
              with precision, using only the finest materials to create timeless
              pieces that transcend seasons and trends.
            </p>
            <p className="text-gray-500 leading-relaxed mb-10">
              Every garment is designed to be versatile, durable, and
              effortlessly stylish— building blocks for a wardrobe that lasts.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('collections')}>

              Our Story
            </Button>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-12 gap-4">
            <div className="col-span-7">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"
                alt="Editorial 1"
                className="w-full aspect-[3/4] object-cover" />

            </div>
            <div className="col-span-5 pt-16">
              <img
                src="https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?auto=format&fit=crop&q=80&w=800"
                alt="Editorial 2"
                className="w-full aspect-[3/4] object-cover mb-4" />

              <div className="bg-black text-white p-6">
                <p className="text-xs uppercase tracking-widest mb-2">
                  Since 2020
                </p>
                <p className="text-2xl font-bold">TrueFit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-6 md:px-20 max-w-[1920px] mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 block">
          Stay Updated
        </span>
        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
          Join the Community
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Subscribe to receive updates on new arrivals, exclusive offers, and
          style inspiration.
        </p>
        <div className="max-w-md mx-auto">
          <NewsletterForm variant="dark" buttonLabel="Subscribe" />
        </div>
      </section>
    </div>);

}
