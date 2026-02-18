import { useMemo, useState, useRef, useEffect, useCallback, memo } from "react";
import * as d3 from "d3";
import { useChartDimensions } from "./useChartDimensions";
import { useTooltipHandlers } from "./useTooltipHandlers";

interface Series {
  label: string;
  color: string;
  values: { x: string; y: number }[];
}

interface Props {
  series: Series[];
  yFormat?: (v: number) => string;
  height?: number;
  showLegend?: boolean;
}

export const D3LineChart = memo(function D3LineChart({ series, yFormat = (v) => String(v), height = 320, showLegend = false }: Props) {
  const margin = { top: 20, right: showLegend ? 120 : 20, bottom: 50, left: 60 };
  const { containerRef, width, innerWidth, innerHeight } = useChartDimensions(margin, height);
  const { onHover, onLeave } = useTooltipHandlers();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [hoveredX, setHoveredX] = useState<string | null>(null);

  const { xScale, yScale, allX } = useMemo(() => {
    const allX = Array.from(new Set(series.flatMap((s) => s.values.map((v) => v.x))));
    const xScale = d3.scalePoint<string>().domain(allX).range([0, innerWidth]).padding(0.5);
    const allY = series.flatMap((s) => s.values.map((v) => v.y));
    const yMax = d3.max(allY) ?? 0;
    const yMin = d3.min(allY) ?? 0;
    const yScale = d3.scaleLinear().domain([yMin * 0.9, yMax * 1.1]).range([innerHeight, 0]).nice();
    return { xScale, yScale, allX };
  }, [series, innerWidth, innerHeight]);

  const line = d3
    .line<{ x: string; y: number }>()
    .x((d) => xScale(d.x) ?? 0)
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  useEffect(() => {
    pathRefs.current.forEach((path) => {
      if (!path) return;
      const totalLen = path.getTotalLength();
      path.style.strokeDasharray = `${totalLen}`;
      path.style.strokeDashoffset = `${totalLen}`;
      path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset 1200ms cubic-bezier(0.4,0,0.2,1)";
      path.style.strokeDashoffset = "0";
    });
  }, [series, innerWidth]);

  const yTicks = yScale.ticks(5);
  const labelInterval = Math.max(1, Math.floor(allX.length / 12));

  const handleOverlayMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left - margin.left;
      let closestX = allX[0];
      let minDist = Infinity;
      for (const x of allX) {
        const dist = Math.abs((xScale(x) ?? 0) - mx);
        if (dist < minDist) { minDist = dist; closestX = x; }
      }
      setHoveredX(closestX);
      const rows = series.map((s) => {
        const pt = s.values.find((p) => p.x === closestX);
        return { label: s.label, value: pt ? yFormat(pt.y) : "-", color: s.color };
      });
      onHover(e, rows);
    },
    [allX, xScale, series, yFormat, onHover, margin.left],
  );

  const handleOverlayLeave = useCallback(() => {
    setHoveredX(null);
    onLeave();
  }, [onLeave]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="select-none">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="#e5e7eb" strokeDasharray="3,3" />
              <text x={-8} y={yScale(t)} dy="0.35em" textAnchor="end" fontSize={11} fill="#6b7280">{yFormat(t)}</text>
            </g>
          ))}
          {allX.map((x, i) =>
            i % labelInterval === 0 ? (
              <text key={x} x={xScale(x) ?? 0} y={innerHeight + 16} textAnchor="middle" fontSize={10} fill="#6b7280" transform={allX.length > 30 ? `rotate(-45, ${xScale(x) ?? 0}, ${innerHeight + 16})` : undefined}>
                {x}
              </text>
            ) : null,
          )}

          {hoveredX && (
            <line
              x1={xScale(hoveredX) ?? 0}
              x2={xScale(hoveredX) ?? 0}
              y1={0}
              y2={innerHeight}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4,4"
              className="pointer-events-none"
              style={{ opacity: 0.6 }}
            />
          )}

          {series.map((s, si) => (
            <g key={s.label}>
              <path
                ref={(el) => { pathRefs.current[si] = el; }}
                d={line(s.values) ?? ""}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
              />
              {s.values.map((v) => {
                const isActive = hoveredX === v.x;
                return (
                  <g key={`${s.label}-${v.x}`}>
                    {isActive && (
                      <circle
                        cx={xScale(v.x) ?? 0}
                        cy={yScale(v.y)}
                        r={10}
                        fill={s.color}
                        opacity={0.15}
                        className="pointer-events-none"
                      />
                    )}
                    <circle
                      cx={xScale(v.x) ?? 0}
                      cy={yScale(v.y)}
                      r={isActive ? 5 : 3}
                      fill={isActive ? "white" : s.color}
                      stroke={s.color}
                      strokeWidth={isActive ? 3 : 2}
                      style={{ transition: "r 200ms, fill 200ms, stroke-width 200ms" }}
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
            </g>
          ))}

          <rect
            x={0} y={0} width={innerWidth} height={innerHeight}
            fill="transparent" className="cursor-crosshair"
            onMouseMove={handleOverlayMove}
            onMouseLeave={handleOverlayLeave}
          />

          {showLegend &&
            series.map((s, i) => (
              <g key={`legend-${s.label}`} transform={`translate(${innerWidth + 12}, ${i * 22 + 10})`}>
                <rect width={14} height={14} rx={3} fill={s.color} />
                <text x={18} y={11} fontSize={11} fill="#374151">{s.label}</text>
              </g>
            ))}
        </g>
      </svg>
    </div>
  );
});
