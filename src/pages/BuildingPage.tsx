import type { SummaryData } from "../types";
import { ChartCard } from "../components/ChartCard";
import { D3BarChart } from "../components/d3/D3BarChart";
import { D3LineChart } from "../components/d3/D3LineChart";
import { useMemo, memo } from "react";

interface Props {
  data: SummaryData;
}

const FMT_PRICE = (v: number) => `${v.toFixed(1)}억`;
const FMT_COUNT = (v: number) => `${(v / 10000).toFixed(0)}만`;

export const BuildingPage = memo(function BuildingPage({ data }: Props) {
  const { building } = data;

  const ageLineSeries = useMemo(
    () => [
      { label: "평균가격", color: "#6366f1", values: building.byAgeBin.map((d) => ({ x: d.ageBin, y: d.avgPrice })) },
      { label: "중위가격", color: "#f59e0b", values: building.byAgeBin.map((d) => ({ x: d.ageBin, y: d.medPrice })) },
    ],
    [building.byAgeBin],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
        <h3 className="font-semibold text-amber-800 mb-2">건물 파생변수 (Step 3.5 / Step 7.7)</h3>
        <p className="text-sm text-amber-700">
          <code className="bg-amber-100 px-1 rounded">건물나이</code> (계약년도-건축년도),{" "}
          <code className="bg-amber-100 px-1 rounded">is_rebuild_candidate</code> (30년 이상),{" "}
          <code className="bg-amber-100 px-1 rounded">층구간</code> (저/중/고/초고층),{" "}
          <code className="bg-amber-100 px-1 rounded">면적대</code> (소형/국민/중형/대형) 파생변수를 분석합니다.
        </p>
      </div>

      <ChartCard title="건물나이 구간별 가격" description="5년 단위 건물연식에 따른 평균·중위 가격 (억원)">
        <D3LineChart series={ageLineSeries} yFormat={FMT_PRICE} height={380} showLegend />
      </ChartCard>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="재건축 후보 여부별 가격" description="건물나이 >= 30년 -> 재건축 기대 프리미엄">
          <D3BarChart data={building.rebuild} xKey="label" yKey="avgPrice" color="#ef4444" yFormat={FMT_PRICE} />
        </ChartCard>
        <ChartCard title="재건축 후보 여부별 건수" description="30년 이상 vs 미만 거래 건수">
          <D3BarChart data={building.rebuild} xKey="label" yKey="count" color="#94a3b8" yFormat={FMT_COUNT} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="층구간별 평균 가격" description="저층(~3F) / 중층(4~10F) / 고층(11~20F) / 초고층(21+F)">
          <D3BarChart data={building.byFloorSeg} xKey="seg" yKey="avgPrice" color="#3b82f6" yFormat={FMT_PRICE} />
        </ChartCard>
        <ChartCard title="면적대별 평균 가격" description="소형(~59㎡) / 국민평형(60~84) / 중형(85~135) / 대형(135+)">
          <D3BarChart data={building.byAreaSeg} xKey="seg" yKey="avgPrice" color="#10b981" yFormat={FMT_PRICE} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="층구간별 거래 건수" description="구간별 거래량 분포">
          <D3BarChart data={building.byFloorSeg} xKey="seg" yKey="count" color="#93c5fd" yFormat={FMT_COUNT} />
        </ChartCard>
        <ChartCard title="면적대별 거래 건수" description="면적 세그먼트별 거래량">
          <D3BarChart data={building.byAreaSeg} xKey="seg" yKey="count" color="#6ee7b7" yFormat={FMT_COUNT} />
        </ChartCard>
      </section>
    </div>
  );
});
