import { useEffect, useState } from "react";

export function useDebounce(value: string, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  //This effect runs every time value changes (every keystroke)
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

    //effect cleanup. The function you return from useEffect runs before the effect runs again
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
