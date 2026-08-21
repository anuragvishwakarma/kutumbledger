import { useState, createContext, useContext, useCallback } from 'react';
import Toast from './Toast';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after delay
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toasts.map(toast => `${toast.type}: ${toast.message}`)}
      </div>
      <div className="fixed bottom-4 right-4 space-y-3 z-50 pointer-events-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default function ToastManager({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

// Hook to use toast manager
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // During SSR or when outside provider, return a no-op
    // This prevents runtime errors and allows component testing
    return (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      console.warn(`[Toast ${type}] ${message}`);
    };
  }
  return context.addToast;
};

// Export context for advanced use cases
export { ToastContext };