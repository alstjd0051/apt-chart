import { useMemo, useCallback, useState, useRef, useEffect, memo } from "react";
import * as d3 from "d3";
import { useChartDimensions } from "./useChartDimensions";
import { useTooltipHandlers } from "./useTooltipHandlers";

interface Props {
  data: { x: string; y: number }[];
  color?: string;
  yFormat?: (v: number) => string;
  height?: number;
}

export const D3AreaChart = memo(function D3AreaChart({
  data,
  color = "#6366f1",
  yFormat = (v) => String(v),
  height = 320,
}: Props) {
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const { containerRef, width, innerWidth, innerHeight } = useChartDimensions(
    margin,
    height,
  );
  const { onHover, onLeave } = useTooltipHandlers();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const [clipWidth, setClipWidth] = useState(0);

  const { xScale, yScale } = useMemo(() => {
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.x))
      .range([0, innerWidth])
      .padding(0.5);
    const yMax = d3.max(data, (d) => d.y) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0])
      .nice();
    return { xScale, yScale };
  }, [data, innerWidth, innerHeight]);

  useEffect(() => {
    setClipWidth(0);
    const raf = requestAnimationFrame(() => setClipWidth(innerWidth + 20));
    return () => cancelAnimationFrame(raf);
  }, [innerWidth, data]);

  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.getBoundingClientRect();
    path.style.transition =
      "stroke-dashoffset 1200ms cubic-bezier(0.4,0,0.2,1)";
    path.style.strokeDashoffset = "0";
  }, [data, innerWidth]);

  const area = d3
    .area<{ x: string; y: number }>()
    .x((d) => xScale(d.x) ?? 0)
    .y0(innerHeight)
    .y1((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);
  const line = d3
    .line<{ x: string; y: number }>()
    .x((d) => xScale(d.x) ?? 0)
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const yTicks = yScale.ticks(5);
  const labelInterval = Math.max(1, Math.floor(data.length / 15));
  const clipId = `area-clip-${color.replace("#", "")}`;

  const bisect = useMemo(() => {
    const xPositions = data.map((d) => xScale(d.x) ?? 0);
    return (mouseX: number) => {
      let ci = 0,
        md = Infinity;
      for (let i = 0; i < xPositions.length; i++) {
        const d = Math.abs(xPositions[i] - mouseX);
        if (d < md) {
          md = d;
          ci = i;
        }
      }
      return ci;
    };
  }, [data, xScale]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - margin.left;
      const idx = bisect(mouseX);
      setHoveredIdx(idx);
      const d = data[idx];
      if (d) onHover(e, [{ label: d.x, value: yFormat(d.y), color }]);
    },
    [bisect, data, margin.left, onHover, yFormat, color],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIdx(null);
    onLeave();
  }, [onLeave]);

  const hoveredPt = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="select-none">
        <defs>
          <linearGradient
            id={`grad-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
          <clipPath id={clipId}>
            <rect
              x={0}
              y={0}
              width={clipWidth}
              height={innerHeight + 10}
              style={{ transition: "width 1200ms cubic-bezier(0.4,0,0.2,1)" }}
            />
          </clipPath>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={0}
                x2={innerWidth}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="#e5e7eb"
                strokeDasharray="3,3"
              />
              <text
                x={-8}
                y={yScale(t)}
                dy="0.35em"
                textAnchor="end"
                fontSize={11}
                fill="#6b7280"
              >
                {yFormat(t)}
              </text>
            </g>
          ))}

          <g clipPath={`url(#${clipId})`}>
            <path
              d={area(data) ?? ""}
              fill={`url(#grad-${color.replace("#", "")})`}
            />
          </g>
          <path
            ref={lineRef}
            d={line(data) ?? ""}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />

          {hoveredPt && (
            <>
              <line
                x1={xScale(hoveredPt.x) ?? 0}
                x2={xScale(hoveredPt.x) ?? 0}
                y1={0}
                y2={innerHeight}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4,3"
                opacity={0.5}
                className="pointer-events-none"
              />
              <circle
                cx={xScale(hoveredPt.x) ?? 0}
                cy={yScale(hoveredPt.y)}
                r={12}
                fill={color}
                opacity={0.12}
                className="pointer-events-none"
              />
              <circle
                cx={xScale(hoveredPt.x) ?? 0}
                cy={yScale(hoveredPt.y)}
                r={5}
                fill="white"
                stroke={color}
                strokeWidth={2.5}
                className="pointer-events-none"
              />
              <text
                x={xScale(hoveredPt.x) ?? 0}
                y={yScale(hoveredPt.y) - 14}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={color}
                className="pointer-events-none"
              >
                {yFormat(hoveredPt.y)}
              </text>
            </>
          )}

          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {data.map((d, i) =>
            i % labelInterval === 0 ? (
              <text
                key={d.x}
                x={xScale(d.x) ?? 0}
                y={innerHeight + 16}
                textAnchor="end"
                fontSize={9}
                fill="#6b7280"
                transform={`rotate(-45, ${xScale(d.x) ?? 0}, ${innerHeight + 16})`}
              >
                {d.x}
              </text>
            ) : null,
          )}
        </g>
      </svg>
    </div>
  );
});
