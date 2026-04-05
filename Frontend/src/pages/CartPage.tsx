import React from 'react';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/ui/CartItem';
import { Button } from '../components/ui/Button';
import { Page } from '../types';
interface CartPageProps {
  onNavigate: (page: Page) => void;
}
export function CartPage({ onNavigate }: CartPageProps) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Button onClick={() => onNavigate('shop')}>Start Shopping</Button>
      </div>);

  }
  return (
    <div className="max-w-[1920px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-12">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="border-t border-gray-100">
            {items.map((item) =>
              <CartItem
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                item={item}
                onUpdateQuantity={(q) =>
                  updateQuantity(
                    item.id,
                    item.selectedSize,
                    item.selectedColor,
                    q
                  )
                }
                onRemove={() =>
                  removeItem(item.id, item.selectedSize, item.selectedColor)
                } />

            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 p-8 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KSH {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : `KSH ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">KSH {tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>KSH {total.toLocaleString()}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => onNavigate('checkout')}>
              Proceed to Checkout
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Shipping calculated at checkout. Free shipping on orders over
              KSH 10,000.
            </p>
          </div>
        </div>
      </div>
    </div>);

}
