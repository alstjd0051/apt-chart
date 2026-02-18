import { useCallback, useRef } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

type TooltipRow = { label: string; value: string; color?: string };

export function useTooltipHandlers() {
  const showTooltip = useDashboardStore((s) => s.showTooltip);
  const hideTooltip = useDashboardStore((s) => s.hideTooltip);
  const rafId = useRef(0);

  const onHover = useCallback(
    (e: React.MouseEvent, rows: TooltipRow[]) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        showTooltip(e.clientX, e.clientY, rows);
      });
    },
    [showTooltip],
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    hideTooltip();
  }, [hideTooltip]);

  return { onHover, onLeave };
}
