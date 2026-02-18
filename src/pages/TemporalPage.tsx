import type { SummaryData } from "../types";
import { ChartCard } from "../components/ChartCard";
import { D3BarChart } from "../components/d3/D3BarChart";
import { D3LineChart } from "../components/d3/D3LineChart";
import { useMemo, memo } from "react";

interface Props {
  data: SummaryData;
}

const FMT_PRICE_1 = (v: number) => `${v.toFixed(1)}억`;
const FMT_COUNT = (v: number) => `${(v / 10000).toFixed(0)}만`;
const FMT_DEC2 = (v: number) => `${v.toFixed(2)}`;

export const TemporalPage = memo(function TemporalPage({ data }: Props) {
  const { temporal, yearlySummary } = data;

  const monthData = useMemo(
    () =>
      temporal.byMonth.map((d) => ({
        month: `${d.month}월`,
        avgPrice: d.avgPrice,
        medPrice: d.medPrice,
        count: d.count,
      })),
    [temporal.byMonth],
  );

  const monthSeries = useMemo(
    () => [
      { label: "평균가격", color: "#6366f1", values: monthData.map((d) => ({ x: d.month, y: d.avgPrice })) },
      { label: "중위가격", color: "#f59e0b", values: monthData.map((d) => ({ x: d.month, y: d.medPrice })) },
    ],
    [monthData],
  );

  const sinCosSeries = useMemo(() => {
    const sinCosData = temporal.byMonth.map((d) => ({
      month: `${d.month}월`,
      sin: Math.round(Math.sin((2 * Math.PI * d.month) / 12) * 1000) / 1000,
      cos: Math.round(Math.cos((2 * Math.PI * d.month) / 12) * 1000) / 1000,
    }));
    return [
      { label: "계약월_sin", color: "#ef4444", values: sinCosData.map((d) => ({ x: d.month, y: d.sin })) },
      { label: "계약월_cos", color: "#3b82f6", values: sinCosData.map((d) => ({ x: d.month, y: d.cos })) },
    ];
  }, [temporal.byMonth]);

  const yearlyPriceSeries = useMemo(
    () => [
      { label: "평균가격", color: "#6366f1", values: yearlySummary.map((d) => ({ x: d.year, y: d.avgPrice })) },
    ],
    [yearlySummary],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <h3 className="font-semibold text-indigo-800 mb-2">시간 파생변수 (Step 3.7)</h3>
        <p className="text-sm text-indigo-700">
          계약년월에서{" "}
          <code className="bg-indigo-100 px-1 rounded">계약년</code>,{" "}
          <code className="bg-indigo-100 px-1 rounded">계약월</code>,{" "}
          <code className="bg-indigo-100 px-1 rounded">계약분기</code>,{" "}
          <code className="bg-indigo-100 px-1 rounded">계약반기</code>,{" "}
          <code className="bg-indigo-100 px-1 rounded">계약월_sin</code>,{" "}
          <code className="bg-indigo-100 px-1 rounded">계약월_cos</code> 6개 변수를 파생합니다.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="계약월별 평균·중위 가격" description="월별 계절성 패턴 (억원)">
          <D3LineChart series={monthSeries} yFormat={FMT_PRICE_1} showLegend />
        </ChartCard>
        <ChartCard title="계약월별 거래 건수" description="월별 거래 활동량">
          <D3BarChart data={monthData} xKey="month" yKey="count" yFormat={FMT_COUNT} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="계약분기별 평균 가격" description="Q1~Q4 분기별 가격 비교">
          <D3BarChart data={temporal.byQuarter} xKey="quarter" yKey="avgPrice" color="#10b981" yFormat={FMT_PRICE_1} />
        </ChartCard>
        <ChartCard title="계약반기별 평균 가격" description="상·하반기 비교">
          <D3BarChart data={temporal.byHalf} xKey="half" yKey="avgPrice" color="#f59e0b" yFormat={FMT_PRICE_1} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="계약년별 평균 가격 추이" description="계약년 파생변수의 효과">
          <D3LineChart series={yearlyPriceSeries} yFormat={FMT_PRICE_1} />
        </ChartCard>
        <ChartCard title="계약월_sin / cos 변환" description="12→1월 순환 연속성 보장을 위한 sin/cos 인코딩">
          <D3LineChart series={sinCosSeries} yFormat={FMT_DEC2} showLegend />
        </ChartCard>
      </section>
    </div>
  );
});
