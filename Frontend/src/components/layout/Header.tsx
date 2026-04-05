import { useState } from 'react';
import { ShoppingBag, Search, Menu, User, Bell, Heart, LogOut, Settings, History, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { Page } from '../../types';
interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}
export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { itemCount } = useCart();
  const { toggleMobileMenu } = useUI();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState<{ id: number; text: string; time: string; unread: boolean }[]>([]);
  const hasUnread = notifications.some(n => n.unread);
  const navItems: {
    label: string;
    page: Page;
    params?: Record<string, string>;
  }[] = [
      {
        label: 'Shop',
        page: 'shop'
      },
      {
        label: 'New Arrivals',
        page: 'shop',
        params: { newArrival: 'true' }
      },
      {
        label: 'Best Sellers',
        page: 'shop',
        params: { featured: 'true' }
      },
      {
        label: 'Collections',
        page: 'collections'
      }];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-full"
          onClick={toggleMobileMenu}
          aria-label="Open menu">

          <Menu size={24} />
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center h-10 select-none"
        >
          <Logo />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) =>
            <button
              key={item.label}
              onClick={() => {
                const url = new URL(window.location.href);
                // Clear existing filters and set new ones if provided
                const newParams = new URLSearchParams();
                if (item.params) {
                  Object.entries(item.params).forEach(([k, v]) => newParams.set(k, v));
                }
                
                window.history.pushState({}, '', url.pathname + (newParams.toString() ? `?${newParams.toString()}` : ''));
                window.dispatchEvent(new Event('search-change'));
                onNavigate(item.page);
              }}
              className={`
                text-sm font-medium uppercase tracking-wider transition-colors
                ${currentPage === item.page ? 'text-black' : 'text-black/60 hover:text-black'}
              `}>

              {item.label}
            </button>
          )}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative flex items-center">
            {showSearch && (
              <input
                type="text"
                placeholder="Search products..."
                className="absolute right-10 w-48 border-b border-black py-1 focus:outline-none bg-transparent text-sm animate-slide-in-right"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setShowSearch(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = new URL(window.location.href);
                    if (searchQuery) {
                      url.searchParams.set('search', searchQuery);
                    } else {
                      url.searchParams.delete('search');
                    }
                    window.history.pushState({}, '', url.pathname + url.search);

                    // Dispatch custom event to notify ShopPage
                    window.dispatchEvent(new Event('search-change'));

                    onNavigate('shop');
                    setShowSearch(false);
                  }
                }}
              />
            )}
            <button
              className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:block"
              aria-label="Search"
              onClick={() => {
                if (showSearch && searchQuery) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('search', searchQuery);
                  window.history.pushState({}, '', url.pathname + url.search);
                  window.dispatchEvent(new Event('search-change'));
                  onNavigate('shop');
                  setShowSearch(false);
                } else {
                  setShowSearch(!showSearch);
                }
              }}>
              <Search size={20} className="text-black" />
            </button>
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} className="text-black" />
              {hasUnread &&
                <span className="absolute top-1 right-1 bg-[#D4AF37] h-2 w-2 rounded-full ring-2 ring-white" />
              }
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 shadow-xl z-20 animate-fade-in-up">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-medium text-sm">Notifications</span>
                    <button className="text-xs text-gray-500 hover:text-black">Mark all read</button>
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {notifications.map((note) => (
                      <li key={note.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${note.unread ? 'bg-orange-50/30' : ''}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-800">{note.text}</p>
                          {note.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
            aria-label="Wishlist"
            onClick={() => {
              const url = new URL(window.location.href);
              window.history.pushState({}, '', url.pathname + '?wishlist=true');
              window.dispatchEvent(new Event('search-change'));
              onNavigate('shop');
            }}>
            <Heart size={20} className="text-black" />
            {wishlist.length > 0 &&
              <span className="absolute top-1 right-1 bg-black h-2 w-2 rounded-full ring-2 ring-white" />
            }
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className={`p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:block ${isAuthenticated ? 'text-black' : 'text-gray-400'}`}
              aria-label="Account"
              onClick={() => setShowProfile(!showProfile)}>
              <User size={20} />
            </button>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-2xl z-20 animate-fade-in-up py-2 rounded-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user?.username}</p>
                      </div>
                      <button
                        onClick={() => { onNavigate('profile'); setShowProfile(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <History size={16} /> Order History
                      </button>
                      <button
                        onClick={() => { onNavigate('profile'); setShowProfile(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <Settings size={16} /> Account Settings
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { onNavigate('admin-dashboard'); setShowProfile(false); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors flex items-center gap-3 border-t border-gray-50 mt-1"
                        >
                          <ShieldCheck size={16} /> Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => { logout(); setShowProfile(false); onNavigate('home'); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-3 border-t border-gray-50 mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 text-center mb-2">Sign in to track orders and save your wishlist.</p>
                        <Button fullWidth size="sm" onClick={() => { onNavigate('customer-login'); setShowProfile(false); }}>
                          Sign In
                        </Button>
                        <button
                          onClick={() => { onNavigate('customer-signup'); setShowProfile(false); }}
                          className="w-full text-center text-xs font-medium hover:underline py-1"
                        >
                          Create an Account
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
            onClick={() => onNavigate('cart')}
            aria-label="Shopping cart">

            <ShoppingBag size={20} className="text-black" />
            {itemCount > 0 &&
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            }
          </button>
        </div>
      </div>
    </header>);

}
