import type { SummaryData } from "../types";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { D3BarChart } from "../components/d3/D3BarChart";
import { D3LineChart } from "../components/d3/D3LineChart";
import { D3AreaChart } from "../components/d3/D3AreaChart";
import { D3HBarChart } from "../components/d3/D3HBarChart";
import { D3ScatterChart } from "../components/d3/D3ScatterChart";
import { useState, useMemo, useCallback, memo } from "react";

interface Props {
  data: SummaryData;
}

type AreaMetric = "avgPrice" | "count";

const FMT_COUNT = (v: number) => `${(v / 10000).toFixed(0)}만`;
const FMT_PRICE_1 = (v: number) => `${v.toFixed(1)}억`;
const FMT_PRICE_0 = (v: number) => `${v.toFixed(0)}억`;
const FMT_COUNT_1 = (v: number) => `${(v / 10000).toFixed(1)}만`;

const SCATTER_FMT_AREA_X = (v: number) => `${v}㎡`;
const SCATTER_FMT_PRICE = (v: number) => `${v}억`;
const SCATTER_FMT_AGE = (v: number) => `${v}년`;
const SCATTER_FMT_FLOOR = (v: number) => `${v}층`;

const TOP5_COLORS = ["#ef4444", "#f59e0b", "#6366f1", "#10b981", "#3b82f6"];
const GU_COUNT_COLORS = Array<string>(25).fill("#14b8a6");
const AREA_DOMAIN: [number, number] = [0, 250];

export const OverviewPage = memo(function OverviewPage({ data }: Props) {
  const [areaMetric, setAreaMetric] = useState<AreaMetric>("avgPrice");
  const {
    yearlySummary,
    monthlySummary,
    guSummary,
    heatmapData,
    top5Gus,
  } = data;

  const years = useMemo(() => yearlySummary.map((d) => d.year), [yearlySummary]);

  const maxPriceYear = useMemo(
    () => yearlySummary.reduce((a, b) => (a.avgPrice > b.avgPrice ? a : b)),
    [yearlySummary],
  );
  const maxCountYear = useMemo(
    () => yearlySummary.reduce((a, b) => (a.count > b.count ? a : b)),
    [yearlySummary],
  );

  const monthlyAreaData = useMemo(
    () =>
      monthlySummary.map((d) => ({
        x: `${d.month.slice(0, 4)}.${d.month.slice(4)}`,
        y: areaMetric === "avgPrice" ? d.avgPrice : d.count,
      })),
    [monthlySummary, areaMetric],
  );

  const areaYFormat = useCallback(
    (v: number) =>
      areaMetric === "avgPrice"
        ? `${v.toFixed(1)}억`
        : `${(v / 10000).toFixed(1)}만`,
    [areaMetric],
  );

  const top5Series = useMemo(
    () =>
      top5Gus.map((gu, i) => ({
        label: gu,
        color: TOP5_COLORS[i],
        values: heatmapData.map((row) => ({
          x: String(row.year),
          y: (row[gu] as number) ?? 0,
        })),
      })),
    [top5Gus, heatmapData],
  );

  const yearlyPriceSeries = useMemo(
    () => [
      {
        label: "평균가격",
        color: "#f59e0b",
        values: yearlySummary.map((d) => ({ x: d.year, y: d.avgPrice })),
      },
    ],
    [yearlySummary],
  );

  const guByCount = useMemo(
    () => [...guSummary].sort((a, b) => b.count - a.count),
    [guSummary],
  );

  const areaScatter = useMemo(
    () => data.areaVsPrice.map((d) => ({ x: d.area, y: d.price })),
    [data.areaVsPrice],
  );
  const ageScatter = useMemo(
    () => data.buildingAgeVsPrice.map((d) => ({ x: d.age, y: d.price })),
    [data.buildingAgeVsPrice],
  );
  const floorScatter = useMemo(
    () => data.floorVsPrice.map((d) => ({ x: d.floor, y: d.price })),
    [data.floorVsPrice],
  );

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="총 거래 건수"
          value={`${(data.totalRows / 10000).toFixed(1)}만건`}
          sub={`${years[0]}~${years[years.length - 1]}년`}
        />
        <StatCard
          label="최고 평균가 연도"
          value={`${maxPriceYear.year}년`}
          sub={`${maxPriceYear.avgPrice.toFixed(2)}억원`}
          accent="text-amber-600"
        />
        <StatCard
          label="최다 거래 연도"
          value={`${maxCountYear.year}년`}
          sub={`${maxCountYear.count.toLocaleString()}건`}
          accent="text-emerald-600"
        />
        <StatCard
          label="분석 대상 구"
          value={`${guSummary.length}개 구`}
          sub="서울특별시 전체"
          accent="text-blue-600"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="연도별 거래 건수" description="2007~2023년 서울 아파트 거래량 추이">
          <D3BarChart data={yearlySummary} xKey="year" yKey="count" yFormat={FMT_COUNT} />
        </ChartCard>
        <ChartCard title="연도별 평균 거래가격" description="단위: 억원">
          <D3LineChart series={yearlyPriceSeries} yFormat={FMT_PRICE_1} />
        </ChartCard>
      </section>

      <ChartCard title="월별 추이" description="월 단위 세부 트렌드">
        <div className="flex gap-2 mb-3">
          {(["avgPrice", "count"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setAreaMetric(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${areaMetric === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {m === "avgPrice" ? "평균 가격" : "거래 건수"}
            </button>
          ))}
        </div>
        <D3AreaChart data={monthlyAreaData} yFormat={areaYFormat} height={340} />
      </ChartCard>

      <ChartCard title="상위 5개 구 가격 추이" description="평균 거래가 기준 상위 5개 구 연도별 비교 (억원)">
        <D3LineChart series={top5Series} yFormat={FMT_PRICE_0} height={400} showLegend />
      </ChartCard>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="구별 평균 거래가격" description="서울 25개 구 (억원)">
          <D3HBarChart data={guSummary} labelKey="gu" valueKey="avgPrice" valueFormat={FMT_PRICE_1} />
        </ChartCard>
        <ChartCard title="구별 거래 건수" description="누적 거래 건수">
          <D3HBarChart data={guByCount} labelKey="gu" valueKey="count" valueFormat={FMT_COUNT_1} colors={GU_COUNT_COLORS} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="전용면적 vs 가격" description="㎡ / 억원">
          <D3ScatterChart data={areaScatter} xLabel="전용면적(㎡)" yLabel="가격(억)" xFormat={SCATTER_FMT_AREA_X} yFormat={SCATTER_FMT_PRICE} xDomain={AREA_DOMAIN} />
        </ChartCard>
        <ChartCard title="건물 연식 vs 가격" description="연식(년) / 억원">
          <D3ScatterChart data={ageScatter} color="#f59e0b" xLabel="건물나이(년)" yLabel="가격(억)" xFormat={SCATTER_FMT_AGE} yFormat={SCATTER_FMT_PRICE} />
        </ChartCard>
        <ChartCard title="층수 vs 가격" description="층 / 억원">
          <D3ScatterChart data={floorScatter} color="#10b981" xLabel="층수" yLabel="가격(억)" xFormat={SCATTER_FMT_FLOOR} yFormat={SCATTER_FMT_PRICE} />
        </ChartCard>
      </section>
    </div>
  );
});
