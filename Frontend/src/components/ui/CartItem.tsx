import React from 'react';
import { CartItem as CartItemType } from '../../types';
import { QuantitySelector } from './QuantitySelector';
import { X } from 'lucide-react';
interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}
export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex py-6 border-b border-gray-100 last:border-0">
      <div className="h-32 w-24 flex-shrink-0 overflow-hidden bg-gray-100">
        <img
          src={item.images[0]}
          alt={item.name}
          className="h-full w-full object-cover object-center" />

      </div>

      <div className="ml-6 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>{item.name}</h3>
          <p className="ml-4">KSH {(item.price * item.quantity).toLocaleString()}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{item.category}</p>

        <div className="mt-2 flex text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <span className="mr-2">Size:</span>
            <span className="font-medium text-gray-900">
              {item.selectedSize}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Color:</span>
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{
                backgroundColor: item.selectedColor
              }} />

          </div>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          <QuantitySelector
            quantity={item.quantity}
            onChange={onUpdateQuantity}
            className="scale-90 origin-left" />


          <button
            type="button"
            onClick={onRemove}
            className="font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center">

            <X size={16} className="mr-1" />
            Remove
          </button>
        </div>
      </div>
    </div>);

}
