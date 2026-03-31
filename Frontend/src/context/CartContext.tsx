import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { CartItem, Product } from '../types';
interface CartContextType {
  items: CartItem[];
  addItem: (
  product: Product,
  size: string,
  color: string,
  quantity: number)
  => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (
  id: string,
  size: string,
  color: string,
  quantity: number)
  => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: {children: ReactNode;}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from local storage');
      }
    }
  }, []);
  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  const addItem = (
  product: Product,
  size: string,
  color: string,
  quantity: number) =>
  {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
        item.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
      );
      if (existingItem) {
        return prev.map((item) =>
        item.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color ?
        {
          ...item,
          quantity: item.quantity + quantity
        } :
        item
        );
      }
      return [
      ...prev,
      {
        ...product,
        selectedSize: size,
        selectedColor: color,
        quantity
      }];

    });
    setIsCartOpen(true);
  };
  const removeItem = (id: string, size: string, color: string) => {
    setItems((prev) =>
    prev.filter(
      (item) =>
      !(
      item.id === id &&
      item.selectedSize === size &&
      item.selectedColor === color)

    )
    );
  };
  const updateQuantity = (
  id: string,
  size: string,
  color: string,
  quantity: number) =>
  {
    if (quantity < 1) {
      removeItem(id, size, color);
      return;
    }
    setItems((prev) =>
    prev.map((item) =>
    item.id === id &&
    item.selectedSize === size &&
    item.selectedColor === color ?
    {
      ...item,
      quantity
    } :
    item
    )
    );
  };
  const clearCart = () => setItems([]);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isCartOpen,
        setIsCartOpen
      }}>

      {children}
    </CartContext.Provider>);

}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}