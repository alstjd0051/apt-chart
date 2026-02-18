import { useRef, useState, useEffect } from "react";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_MARGIN: Margin = { top: 20, right: 20, bottom: 40, left: 50 };

export function useChartDimensions(margin: Margin = DEFAULT_MARGIN, minHeight = 320) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const innerWidth = Math.max(width - margin.left - margin.right, 0);
  const innerHeight = Math.max(minHeight - margin.top - margin.bottom, 0);

  return { containerRef, width, height: minHeight, innerWidth, innerHeight, margin };
}
