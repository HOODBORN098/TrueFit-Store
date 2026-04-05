import React, { useEffect, useState, Component } from 'react';
import { Check, X, ShoppingBag } from 'lucide-react';
export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}
export function Toast({
  id,
  message,
  type = 'success',
  duration = 3000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id, onClose]);
  const icons = {
    success: <Check size={18} />,
    error: <X size={18} />,
    info: <ShoppingBag size={18} />
  };
  return (
    <div
      className={`
        flex items-center gap-3 bg-black text-white px-5 py-4 shadow-2xl
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}>

      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors">

        <X size={14} />
      </button>
    </div>);

}
// Toast Container Component
interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}
export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) =>
      <Toast
        key={toast.id}
        id={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={onClose} />

      )}
    </div>);

}
