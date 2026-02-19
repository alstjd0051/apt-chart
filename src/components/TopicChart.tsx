import { memo, useMemo } from "react";
import type { SummaryData } from "../types";
import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { D3BarChart } from "./d3/D3BarChart";
import { D3LineChart } from "./d3/D3LineChart";
import { D3HBarChart } from "./d3/D3HBarChart";
import { D3ScatterChart } from "./d3/D3ScatterChart";
import { D3AreaChart } from "./d3/D3AreaChart";

const FMT_COUNT = (v: number) => `${(v / 10000).toFixed(0)}만`;
const FMT_PRICE_1 = (v: number) => `${v.toFixed(1)}억`;
const FMT_FI = (v: number) => `${(v * 100).toFixed(1)}%`;
const FMT_RMSE = (v: number) => (v >= 10000 ? `${(v / 1000).toFixed(0)}K` : `${v.toFixed(0)}`);
const SCATTER_FMT_AREA = (v: number) => `${v}㎡`;
const SCATTER_FMT_PRICE = (v: number) => `${v}억`;
const AREA_DOMAIN: [number, number] = [0, 250];

const FEATURE_IMPORTANCE = [
  { feature: "te_coord_cluster", importance: 0.312, category: "공간" },
  { feature: "전용면적(㎡)", importance: 0.147, category: "기본" },
  { feature: "nearest_subway_dist", importance: 0.072, category: "교통" },
  { feature: "건물나이", importance: 0.064, category: "건물" },
  { feature: "층", importance: 0.053, category: "기본" },
  { feature: "dist_강남역", importance: 0.048, category: "공간" },
  { feature: "subway_count_1km", importance: 0.041, category: "교통" },
  { feature: "면적×층", importance: 0.025, category: "교호작용" },
];

const EXPERIMENTS = [
  { exp: "Exp01", lbRmse: 16112 },
  { exp: "Exp05", lbRmse: 16928 },
  { exp: "Exp06", lbRmse: 16007 },
  { exp: "Exp08", lbRmse: 15642 },
  { exp: "Exp12", lbRmse: 15572 },
  { exp: "Exp14", lbRmse: 15651 },
  { exp: "Exp16", lbRmse: 16530 },
  { exp: "Exp17", lbRmse: 18940 },
];

const LB_SERIES = [
  { label: "LB RMSE", color: "#ef4444", values: EXPERIMENTS.map((e) => ({ x: e.exp, y: e.lbRmse })) },
];

const FI_COLORS = ["#ef4444", "#6366f1", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#10b981", "#ec4899"];

function DataSourceCharts({ data }: { data: SummaryData }) {
  const yearlyPriceSeries = useMemo(
    () => [{ label: "평균가격", color: "#f59e0b", values: data.yearlySummary.map((d) => ({ x: d.year, y: d.avgPrice })) }],
    [data.yearlySummary],
  );
  const areaScatter = useMemo(() => data.areaVsPrice.map((d) => ({ x: d.area, y: d.price })), [data.areaVsPrice]);
  const guTop10 = useMemo(
    () => [...data.guSummary].sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 10),
    [data.guSummary],
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="연도별 거래 건수" description="전처리 대상 데이터 규모">
        <D3BarChart data={data.yearlySummary} xKey="year" yKey="count" yFormat={FMT_COUNT} height={280} />
      </ChartCard>
      <ChartCard title="연도별 평균 거래가격" description="억원">
        <D3LineChart series={yearlyPriceSeries} yFormat={FMT_PRICE_1} height={280} />
      </ChartCard>
      <ChartCard title="구별 평균 거래가격 (상위 10개)" description="데이터 분포">
        <D3HBarChart data={guTop10} labelKey="gu" valueKey="avgPrice" valueFormat={FMT_PRICE_1} height={320} />
      </ChartCard>
      <ChartCard title="전용면적 vs 가격" description="㎡ / 억원">
        <D3ScatterChart
          data={areaScatter}
          xLabel="전용면적(㎡)"
          yLabel="가격(억)"
          xFormat={SCATTER_FMT_AREA}
          yFormat={SCATTER_FMT_PRICE}
          xDomain={AREA_DOMAIN}
          height={280}
        />
      </ChartCard>
    </div>
  );
}

function FeatureImportanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="피처 중요도 Top 8" description="te_coord_cluster, 교통·건물 피처">
        <D3HBarChart
          data={FEATURE_IMPORTANCE}
          labelKey="feature"
          valueKey="importance"
          valueFormat={FMT_FI}
          colors={FI_COLORS}
          height={320}
        />
      </ChartCard>
      <ChartCard title="실험별 LB RMSE 추이" description="낮을수록 성능 우수">
        <D3LineChart series={LB_SERIES} yFormat={FMT_RMSE} height={320} />
      </ChartCard>
    </div>
  );
}

function VisualizationCharts({ data }: { data: SummaryData }) {
  const monthlyData = useMemo(
    () =>
      data.monthlySummary.slice(-24).map((d) => ({
        x: `${d.month.slice(0, 4)}.${d.month.slice(4)}`,
        y: d.avgPrice,
      })),
    [data.monthlySummary],
  );
  const yearlySeries = useMemo(
    () => [{ label: "평균가격", color: "#6366f1", values: data.yearlySummary.map((d) => ({ x: d.year, y: d.avgPrice })) }],
    [data.yearlySummary],
  );
  const areaScatter = useMemo(() => data.areaVsPrice.map((d) => ({ x: d.area, y: d.price })), [data.areaVsPrice]);
  const guByCount = useMemo(
    () => [...data.guSummary].sort((a, b) => b.count - a.count).slice(0, 12),
    [data.guSummary],
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="연도별 평균가격 (라인)" description="D3 LineChart">
        <D3LineChart series={yearlySeries} yFormat={FMT_PRICE_1} height={280} />
      </ChartCard>
      <ChartCard title="월별 평균가격 (에리어)" description="D3 AreaChart">
        <D3AreaChart data={monthlyData} yFormat={FMT_PRICE_1} height={280} />
      </ChartCard>
      <ChartCard title="면적-가격 산점도" description="D3 ScatterChart">
        <D3ScatterChart
          data={areaScatter}
          color="#10b981"
          xLabel="전용면적(㎡)"
          yLabel="가격(억)"
          xFormat={SCATTER_FMT_AREA}
          yFormat={SCATTER_FMT_PRICE}
          xDomain={AREA_DOMAIN}
          height={280}
        />
      </ChartCard>
      <ChartCard title="구별 거래량 (가로 막대)" description="D3 HBarChart">
        <D3HBarChart data={guByCount} labelKey="gu" valueKey="count" valueFormat={FMT_COUNT} height={320} />
      </ChartCard>
    </div>
  );
}

function GeneralCharts({ data }: { data: SummaryData }) {
  const maxPriceYear = data.yearlySummary.reduce((a, b) => (a.avgPrice > b.avgPrice ? a : b));
  const maxCountYear = data.yearlySummary.reduce((a, b) => (a.count > b.count ? a : b));
  const years = data.yearlySummary.map((d) => d.year);
  const yearlySeries = useMemo(
    () => [{ label: "평균가", color: "#6366f1", values: data.yearlySummary.map((d) => ({ x: d.year, y: d.avgPrice })) }],
    [data.yearlySummary],
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          value={`${data.guSummary.length}개 구`}
          sub="서울특별시 전체"
          accent="text-blue-600"
        />
      </div>
      <ChartCard title="연도별 거래량·평균가 요약" description="프로젝트 핵심 지표">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <D3BarChart data={data.yearlySummary} xKey="year" yKey="count" yFormat={FMT_COUNT} height={260} />
          <D3LineChart series={yearlySeries} yFormat={FMT_PRICE_1} height={260} />
        </div>
      </ChartCard>
    </div>
  );
}

interface Props {
  topicId: string;
  data: SummaryData | null;
}

export const TopicChart = memo(function TopicChart({ topicId, data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-500">차트를 불러오는 중...</p>
      </div>
    );
  }

  switch (topicId) {
    case "data-source":
      return <DataSourceCharts data={data} />;
    case "feature-importance":
      return <FeatureImportanceCharts />;
    case "visualization":
      return <VisualizationCharts data={data} />;
    case "general":
      return <GeneralCharts data={data} />;
    default:
      return null;
  }
});
