import { useMemo, useState, memo } from "react";
import * as d3 from "d3";
import { useChartDimensions } from "./useChartDimensions";
import { useTooltipHandlers } from "./useTooltipHandlers";
import { useEntryAnimation } from "./useEntryAnimation";

interface Props<T> {
  data: T[];
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  colors?: string[];
  valueFormat?: (v: number) => string;
  height?: number;
}

const DEFAULT_COLORS = [
  "#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#14b8a6",
  "#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef",
  "#ec4899","#f43f5e","#64748b","#78716c","#57534e","#44403c","#374151",
  "#1e3a5f","#065f46","#713f12","#581c87",
];

function D3HBarChartInner<T extends object>({
  data,
  labelKey,
  valueKey,
  colors = DEFAULT_COLORS,
  valueFormat = (v) => String(v),
  height = 600,
}: Props<T>) {
  const margin = { top: 10, right: 50, bottom: 20, left: 70 };
  const { containerRef, width, innerWidth, innerHeight } = useChartDimensions(margin, height);
  const { onHover, onLeave } = useTooltipHandlers();
  const animated = useEntryAnimation(data.length, innerWidth);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { yScale, xScale } = useMemo(() => {
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => String(d[labelKey])))
      .range([0, innerHeight])
      .padding(0.25);
    const xMax = d3.max(data, (d) => Number(d[valueKey])) ?? 0;
    const xScale = d3.scaleLinear().domain([0, xMax * 1.1]).range([0, innerWidth]).nice();
    return { yScale, xScale };
  }, [data, labelKey, valueKey, innerWidth, innerHeight]);

  const xTicks = xScale.ticks(5);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="select-none">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {xTicks.map((t) => (
            <g key={t} style={{ opacity: animated ? 1 : 0, transition: "opacity 500ms" }}>
              <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerHeight} stroke="#e5e7eb" strokeDasharray="3,3" />
              <text x={xScale(t)} y={innerHeight + 14} textAnchor="middle" fontSize={10} fill="#6b7280">{valueFormat(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const y = yScale(String(d[labelKey])) ?? 0;
            const targetW = xScale(Number(d[valueKey]));
            const label = String(d[labelKey]);
            const val = Number(d[valueKey]);
            const c = colors[i % colors.length];
            const isHovered = hoveredIdx === i;
            const dimmed = hoveredIdx !== null && !isHovered;
            return (
              <g key={label}>
                <rect
                  x={0}
                  y={y}
                  width={animated ? targetW : 0}
                  height={yScale.bandwidth()}
                  fill={c}
                  rx={4}
                  opacity={dimmed ? 0.3 : 1}
                  className="cursor-pointer"
                  style={{
                    transition: `width 600ms cubic-bezier(0.34,1.56,0.64,1) ${i * 25}ms, opacity 200ms ease`,
                    transform: isHovered ? "scaleY(1.08)" : "scaleY(1)",
                    transformOrigin: `0 ${y + yScale.bandwidth() / 2}px`,
                  }}
                  onMouseMove={(e) => {
                    setHoveredIdx(i);
                    onHover(e, [{ label, value: valueFormat(val), color: c }]);
                  }}
                  onMouseLeave={() => {
                    setHoveredIdx(null);
                    onLeave();
                  }}
                />
                {animated && (
                  <text
                    x={animated ? targetW + 6 : 0}
                    y={y + yScale.bandwidth() / 2}
                    dy="0.35em"
                    fontSize={10}
                    fill={isHovered ? c : "#9ca3af"}
                    fontWeight={isHovered ? 600 : 400}
                    style={{ transition: "all 300ms", opacity: animated ? 1 : 0 }}
                  >
                    {valueFormat(val)}
                  </text>
                )}
                <text x={-6} y={y + yScale.bandwidth() / 2} dy="0.35em" textAnchor="end" fontSize={11} fill="#374151"
                  fontWeight={isHovered ? 700 : 400} style={{ transition: "font-weight 200ms" }}>
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export const D3HBarChart = memo(D3HBarChartInner) as typeof D3HBarChartInner;
