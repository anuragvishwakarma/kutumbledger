import { useEffect, useState } from 'react';

interface SkeletonLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minDelay?: number; // Minimum delay to show content to prevent flickering
}

export default function SkeletonLoader({
  loading,
  children,
  fallback,
  minDelay = 300
}: SkeletonLoaderProps) {
  const [showContent, setShowContent] = useState(!loading);

  useEffect(() => {
    if (loading) {
      setShowContent(false);
    } else {
      // Delay showing content to prevent flickering on fast loads
      const timer = setTimeout(() => {
        setShowContent(true);
      }, minDelay);
      return () => clearTimeout(timer);
    }
  }, [loading, minDelay]);

  if (loading && !showContent) {
    return fallback;
  }

  return showContent ? children : fallback;
}