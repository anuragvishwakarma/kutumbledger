import { useState } from 'react';

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick: () => Promise<void> | void;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function LoadingButton({
  children,
  onClick,
  loadingText = 'Saving...',
  disabled = false,
  className = '',
  type = 'button'
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={
        `transition-all duration-200 ${className} ${
          isLoading || disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        } text-white font-bold py-2 px-4 rounded`
      }
      type={type}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}