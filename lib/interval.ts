import { useEffect, useRef } from "react";

export const useInterval = (callback: () => void, delay: number, immediate?: boolean) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    if (!delay) return;
    const interval = setInterval(() => {
      callbackRef.current();
    }, delay);
    if (immediate) {
      callbackRef.current();
    }
    return () => {
      clearInterval(interval);
    };
  }, [delay, immediate]);
}