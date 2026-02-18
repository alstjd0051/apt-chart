import { useRef, useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";

export function Tooltip() {
  const { visible, x, y, rows } = useDashboardStore((s) => s.tooltip);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible && rows.length > 0) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      let left = x + 14;
      let top = y - 10;
      if (left + rect.width > vw - 8) left = x - rect.width - 14;
      if (top - rect.height < 8) top = y + 20;
      else top = top - rect.height;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }
  }, [visible, x, y, rows]);

  if (!visible || rows.length === 0) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[9999] pointer-events-none px-3.5 py-2.5 rounded-xl bg-gray-900/95 text-white text-xs shadow-2xl backdrop-blur-md border border-white/10 max-w-[280px]"
      style={{
        left: x + 14,
        top: y - 10,
        transform: "translateY(-100%)",
        animation: "tooltip-in 150ms ease-out",
      }}
    >
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2.5 py-0.5 leading-relaxed">
          {row.color && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: row.color }}
            />
          )}
          <span className="text-gray-400">{row.label}</span>
          <span className="ml-auto font-semibold tabular-nums tracking-tight">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
