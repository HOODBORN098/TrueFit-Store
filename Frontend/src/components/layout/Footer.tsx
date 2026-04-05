import { Page } from '../../types';
import { NewsletterForm } from '../ui/NewsletterForm';
import { Logo } from '../ui/Logo';

interface FooterProps {
  onNavigate?: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F6F6F6] pt-20 pb-10 px-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center h-10 select-none">
              <Logo />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Kenya's premium fashion essentials for the modern minimalist.
              Designed with precision, crafted with care.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-6">
              Shop
            </h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('newArrival', 'true');
                    window.history.pushState({}, '', url.pathname + '?' + url.searchParams.toString());
                    window.dispatchEvent(new Event('search-change'));
                    onNavigate?.('shop');
                  }}
                  className="hover:text-black transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('featured', 'true');
                    window.history.pushState({}, '', url.pathname + '?' + url.searchParams.toString());
                    window.dispatchEvent(new Event('search-change'));
                    onNavigate?.('shop');
                  }}
                  className="hover:text-black transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('category', 'Clothing');
                    window.history.pushState({}, '', url.pathname + url.search);
                    window.dispatchEvent(new Event('search-change'));
                    onNavigate?.('shop');
                  }}
                  className="hover:text-black transition-colors"
                >
                  Clothing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('category', 'Accessories');
                    window.history.pushState({}, '', url.pathname + url.search);
                    window.dispatchEvent(new Event('search-change'));
                    onNavigate?.('shop');
                  }}
                  className="hover:text-black transition-colors"
                >
                  Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-6">
              Support
            </h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <button onClick={() => onNavigate?.('support')} className="hover:text-black transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('privacy-policy')} className="hover:text-black transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('terms-conditions')} className="hover:text-black transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('shipping')} className="hover:text-black transition-colors">
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('size-guide')} className="hover:text-black transition-colors">
                  Size Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-black transition-colors">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-6">
              Newsletter
            </h4>
            <p className="text-gray-500 text-sm mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <NewsletterForm variant="light" buttonLabel="Join" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2026 TrueFIT. All rights reserved.</p>
            <p>Email: ericwambua098@gmail.com</p>
            <p>WhatsApp: +254 112 394 362</p>
          </div>
          <div className="flex gap-6 items-center">
            <a href="https://instagram.com/truefit" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Instagram</a>
            <a href="https://facebook.com/truefit" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Facebook</a>
            <a href="https://wa.me/254112394362" target="_blank" rel="noreferrer" className="hover:text-green-600 transition-colors font-bold">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>);

}
