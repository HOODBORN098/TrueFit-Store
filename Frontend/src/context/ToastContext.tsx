import { useCallback, useState, createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '../components/ui/Toast';
interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export function ToastProvider({ children }: {children: ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type
      }]
      );
    },
    []
  );
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  return (
    <ToastContext.Provider
      value={{
        showToast
      }}>

      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>);

}
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}