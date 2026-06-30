import { useState, useEffect, useRef } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` ms of inactivity.
 *
 * @param {*}      value - The value to debounce.
 * @param {number} delay - Delay in milliseconds (default 400 ms).
 * @returns The debounced value.
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  return debouncedValue;
}
