import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook para crear una función con debounce
 * @param callback - La función a ejecutar después del delay
 * @param delay - Tiempo de espera en milisegundos (default: 1500ms)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Mantener la referencia del callback actualizada
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Hook para cancelar el debounce manualmente (útil para onBlur)
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = 1500
): [T, () => void] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDebouncedValue(value);
  }, [value]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [debouncedValue, flush];
}

import { useState } from 'react';
