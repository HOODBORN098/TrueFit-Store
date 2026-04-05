import React from 'react';
import { Minus, Plus } from 'lucide-react';
interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}
export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  className = ''
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };
  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };
  return (
    <div
      className={`flex items-center border border-gray-200 w-fit ${className}`}>

      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= min}
        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        aria-label="Decrease quantity">

        <Minus size={16} />
      </button>
      <span className="w-12 text-center font-medium">{quantity}</span>
      <button
        type="button"
        onClick={increase}
        disabled={quantity >= max}
        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        aria-label="Increase quantity">

        <Plus size={16} />
      </button>
    </div>);

}
