import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  type,
  duration = 3000,
  onClose
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-l-4 border-green-400',
          text: 'text-green-800',
          icon: '��������������������������������������������������������������������������������������������✅'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-l-4 border-red-400',
          text: 'text-red-800',
          icon: '��������������������������������������������������������������������������������������������❌'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-l-4 border-yellow-400',
          text: 'text-yellow-800',
          icon: '��������������������������������������������������������������������������������������������⚠��️'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-l-4 border-blue-400',
          text: 'text-blue-800',
          icon: '�������������������������������������������������������������������������������������������ℹ��️'
        };
    }
  };

  const { bg, border, text, icon } = getTypeColors();

  return (
    <div
      className={`fixed bottom-4 right-4 mx-4 max-w-xs p-4 rounded-lg shadow-lg z-50 ${bg} ${border} ${text} transition-all duration-300`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}