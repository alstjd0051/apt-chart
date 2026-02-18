import { useMemo, useState, memo } from "react";
import * as d3 from "d3";
import { useChartDimensions } from "./useChartDimensions";
import { useTooltipHandlers } from "./useTooltipHandlers";
import { useEntryAnimation } from "./useEntryAnimation";

interface Props<T> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  color?: string;
  yFormat?: (v: number) => string;
  height?: number;
}

function D3BarChartInner<T extends object>({
  data,
  xKey,
  yKey,
  color = "#6366f1",
  yFormat = (v) => String(v),
  height = 320,
}: Props<T>) {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const { containerRef, width, innerWidth, innerHeight } = useChartDimensions(margin, height);
  const { onHover, onLeave } = useTooltipHandlers();
  const animated = useEntryAnimation([data.length, innerWidth]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { xScale, yScale } = useMemo(() => {
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => String(d[xKey])))
      .range([0, innerWidth])
      .padding(0.3);
    const yMax = d3.max(data, (d) => Number(d[yKey])) ?? 0;
    const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerHeight, 0]).nice();
    return { xScale, yScale };
  }, [data, xKey, yKey, innerWidth, innerHeight]);

  const yTicks = yScale.ticks(5);
  const barWidth = xScale.bandwidth();

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="select-none">
        <defs>
          <filter id="bar-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={t} className="transition-opacity duration-500" style={{ opacity: animated ? 1 : 0 }}>
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="#e5e7eb" strokeDasharray="3,3" />
              <text x={-8} y={yScale(t)} dy="0.35em" textAnchor="end" fontSize={11} fill="#6b7280">{yFormat(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = xScale(String(d[xKey])) ?? 0;
            const targetY = yScale(Number(d[yKey]));
            const targetH = innerHeight - targetY;
            const label = String(d[xKey]);
            const val = Number(d[yKey]);
            const isHovered = hoveredIdx === i;
            const dimmed = hoveredIdx !== null && !isHovered;
            return (
              <g key={label}>
                <rect
                  x={x}
                  y={animated ? targetY : innerHeight}
                  width={barWidth}
                  height={animated ? targetH : 0}
                  fill={color}
                  rx={4}
                  opacity={dimmed ? 0.3 : 1}
                  filter={isHovered ? "url(#bar-shadow)" : undefined}
                  className="cursor-pointer"
                  style={{
                    transition: `y 600ms cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms, height 600ms cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms, opacity 200ms ease`,
                  }}
                  onMouseMove={(e) => {
                    setHoveredIdx(i);
                    onHover(e, [{ label, value: yFormat(val), color }]);
                  }}
                  onMouseLeave={() => {
                    setHoveredIdx(null);
                    onLeave();
                  }}
                />
                {animated && isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={targetY - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill={color}
                    className="animate-fade-in"
                  >
                    {yFormat(val)}
                  </text>
                )}
              </g>
            );
          })}
          {data.map((d) => (
            <text
              key={`label-${String(d[xKey])}`}
              x={(xScale(String(d[xKey])) ?? 0) + barWidth / 2}
              y={innerHeight + 16}
              textAnchor="middle"
              fontSize={data.length > 15 ? 9 : 11}
              fill="#6b7280"
              style={{ opacity: animated ? 1 : 0, transition: "opacity 400ms 300ms" }}
            >
              {String(d[xKey])}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

export const D3BarChart = memo(D3BarChartInner) as typeof D3BarChartInner;
