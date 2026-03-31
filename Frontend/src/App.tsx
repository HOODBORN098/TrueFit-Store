import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminLogin } from './pages/Admin/Login';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { AddProduct } from './pages/Admin/AddProduct';
import { CustomerLogin } from './pages/Customer/Login';
import { CustomerSignup } from './pages/Customer/Signup';
import { ProfilePage } from './pages/Customer/Profile';
import { Page, Product } from './types';
import { InfoPage } from './pages/InfoPages';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isAdmin, isAuthenticated, loading } = useAuth();

  const navigate = (page: Page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    navigate('product');
  };

  // ── Protected Route Helper ──────────────────────────────────────────────
  const renderPage = () => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Admin Protection
    if (currentPage.startsWith('admin-') && currentPage !== 'admin-login') {
      if (!isAdmin) {
        return <AdminLogin onNavigate={navigate} />;
      }
    }

    switch (currentPage) {
      case 'home': return <HomePage onNavigate={navigate} onProductClick={handleProductClick} />;
      case 'shop': return <ShopPage onProductClick={handleProductClick} onNavigate={navigate} />;
      case 'collections': return <CollectionsPage onNavigate={navigate} />;
      case 'product': return selectedProduct ? 
        <ProductDetailPage product={selectedProduct} onNavigate={navigate} /> : 
        <ShopPage onProductClick={handleProductClick} onNavigate={navigate} />;
      case 'cart': return <CartPage onNavigate={navigate} />;
      case 'checkout': return <CheckoutPage onNavigate={navigate} />;
      case 'admin-login': return <AdminLogin onNavigate={navigate} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={navigate} />;
      case 'admin-add-product': return <AddProduct onNavigate={navigate} />;
      case 'customer-login': return <CustomerLogin onNavigate={navigate} />;
      case 'customer-signup': return <CustomerSignup onNavigate={navigate} />;
      case 'profile': return isAuthenticated ? <ProfilePage onNavigate={navigate} /> : <CustomerLogin onNavigate={navigate} />;
      case 'support':
      case 'faq':
      case 'shipping':
      case 'size-guide':
        return <InfoPage type={currentPage} onNavigate={navigate} />;
      default: return <HomePage onNavigate={navigate} onProductClick={handleProductClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      <Header onNavigate={navigate} currentPage={currentPage} />
      <MobileMenu onNavigate={navigate} />

      <main className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {currentPage !== 'checkout' && <Footer onNavigate={navigate} />}
    </div>
  );
}

export function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <UIProvider>
                <AppContent />
              </UIProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}