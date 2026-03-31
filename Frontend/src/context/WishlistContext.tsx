import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const { showToast } = useToast();

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse wishlist');
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item.id === productId);
    };

    const addToWishlist = (product: Product) => {
        if (!isInWishlist(product.id)) {
            setWishlist(prev => [...prev, product]);
            showToast(`${product.name} added to wishlist`, 'success');
        }
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist(prev => prev.filter(item => item.id !== productId));
    };

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            showToast('Removed from wishlist', 'info');
        } else {
            addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlist, 
            addToWishlist, 
            removeFromWishlist, 
            isInWishlist, 
            toggleWishlist 
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
