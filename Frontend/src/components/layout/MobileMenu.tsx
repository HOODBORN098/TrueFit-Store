import { X, Instagram, Facebook } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { Page } from '../../types';
interface MobileMenuProps {
  onNavigate: (page: Page) => void;
}
export function MobileMenu({ onNavigate }: MobileMenuProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  if (!mobileMenuOpen) return null;
  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setMobileMenuOpen(false)} />


      {/* Menu Panel */}
      <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <span className="text-xl font-bold tracking-tighter uppercase">
            TRUEFIT
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full">

            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-6">
          <button
            onClick={() => handleNavigate('home')}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            Home
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.search = ''; // Clear all existing filters
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new Event('search-change'));
              handleNavigate('shop');
            }}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            Shop
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              const params = new URLSearchParams();
              params.set('newArrival', 'true');
              url.search = params.toString();
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new Event('search-change'));
              handleNavigate('shop');
            }}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            New Arrivals
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              const params = new URLSearchParams();
              params.set('featured', 'true');
              url.search = params.toString();
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new Event('search-change'));
              handleNavigate('shop');
            }}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            Best Sellers
          </button>
          <button
            onClick={() => handleNavigate('collections')}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            Collections
          </button>
          <button
            onClick={() => handleNavigate('cart')}
            className="block text-2xl font-bold uppercase tracking-wide hover:text-gray-600 transition-colors">

            Cart
          </button>
        </nav>

        <div className="border-t border-gray-100 pt-8">
          <div className="flex space-x-6 text-gray-400 mb-8">
            <a href="https://instagram.com/truefit" target="_blank" rel="noopener noreferrer">
              <Instagram className="hover:text-black cursor-pointer transition-colors" />
            </a>
            {/* Using MessageCircle as placeholder for WhatsApp if simple icon not available, or just generic */}
            <a href="https://wa.me/254112394362" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <span className="font-bold hover:text-green-600 transition-colors">WA</span>
            </a>
            <a href="https://facebook.com/truefit" target="_blank" rel="noopener noreferrer">
              <Facebook className="hover:text-black cursor-pointer transition-colors" />
            </a>
          </div>
          <p className="text-xs text-gray-400">© 2026 TrueFit</p>
          <p className="text-xs text-gray-300 mt-2">WhatsApp: 0112 394 362</p>
        </div>
      </div>
    </div>);

}
