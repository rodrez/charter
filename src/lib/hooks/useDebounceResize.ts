// hooks/useDebounceResize.ts
import { useState, useEffect } from 'react';

export const debounce = (func: () => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
};

export function useDebounceResize(delay = 250) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const debouncedHandleResize = debounce(handleResize, delay);

    window.addEventListener('resize', debouncedHandleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [delay]);

  return dimensions;
}