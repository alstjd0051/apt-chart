import { useRef, useState, useEffect } from "react";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_MARGIN: Margin = { top: 20, right: 20, bottom: 40, left: 50 };
const MIN_WIDTH = 400;

export function useChartDimensions(margin: Margin = DEFAULT_MARGIN, minHeight = 320) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        // display:none 등으로 width가 0일 때는 업데이트하지 않음 (이전 값 유지)
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    const initialW = el.clientWidth;
    if (initialW > 0) setWidth(initialW);
    return () => ro.disconnect();
  }, []);

  const innerWidth = Math.max(width - margin.left - margin.right, 100);
  const innerHeight = Math.max(minHeight - margin.top - margin.bottom, 0);

  return { containerRef, width, height: minHeight, innerWidth, innerHeight, margin };
}
