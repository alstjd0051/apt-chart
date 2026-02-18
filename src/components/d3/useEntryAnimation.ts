import { useState, useEffect, useRef } from "react";

export function useEntryAnimation(deps: unknown[] = []) {
  const [animated, setAnimated] = useState(false);
  const prevDeps = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify(deps);
    if (key !== prevDeps.current) {
      prevDeps.current = key;
      setAnimated(false);
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [deps]);

  return animated;
}
