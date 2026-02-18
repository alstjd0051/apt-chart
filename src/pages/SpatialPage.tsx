import type { SummaryData } from "../types";
import { ChartCard } from "../components/ChartCard";
import { D3ScatterChart } from "../components/d3/D3ScatterChart";
import { D3HBarChart } from "../components/d3/D3HBarChart";
import { useMemo, memo } from "react";

interface Props {
  data: SummaryData;
}

const FMT_KM = (v: number) => `${v}km`;
const FMT_PRICE = (v: number) => `${v}억`;
const FMT_DIST_1 = (v: number) => `${v.toFixed(1)}km`;
const FMT_PRICE_1 = (v: number) => `${v.toFixed(1)}억`;
const GU_DIST_COLORS = Array<string>(25).fill("#6366f1");

export const SpatialPage = memo(function SpatialPage({ data }: Props) {
  const { spatial, guSummary } = data;

  const guDistData = useMemo(() => {
    const GANGNAM = [127.0276, 37.4979] as const;
    return spatial.guCenters
      .map((gc) => {
        const R = 6371;
        const dLat = ((gc.lat - GANGNAM[1]) * Math.PI) / 180;
        const dLon = ((gc.lon - GANGNAM[0]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((GANGNAM[1] * Math.PI) / 180) *
            Math.cos((gc.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { gu: gc.gu, dist: Math.round(dist * 10) / 10, avgPrice: gc.avgPrice };
      })
      .sort((a, b) => a.dist - b.dist);
  }, [spatial.guCenters]);

  const minDistScatter = useMemo(
    () => spatial.minDistJob.map((d) => ({ x: d.dist, y: d.price })),
    [spatial.minDistJob],
  );
  const gangnamScatter = useMemo(
    () => spatial.distGangnam.map((d) => ({ x: d.dist, y: d.price })),
    [spatial.distGangnam],
  );
  const cityhallScatter = useMemo(
    () => spatial.distCityhall.map((d) => ({ x: d.dist, y: d.price })),
    [spatial.distCityhall],
  );
  const yeouScatter = useMemo(
    () => spatial.distYeouido.map((d) => ({ x: d.dist, y: d.price })),
    [spatial.distYeouido],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <h3 className="font-semibold text-emerald-800 mb-2">공간 파생변수 (Step 6.5 / 6.7 / 6.8)</h3>
        <p className="text-sm text-emerald-700">
          <code className="bg-emerald-100 px-1 rounded">dist_강남역</code>,{" "}
          <code className="bg-emerald-100 px-1 rounded">dist_서울시청</code>,{" "}
          <code className="bg-emerald-100 px-1 rounded">dist_여의도</code> (Haversine 거리) +{" "}
          교통 피처(<code className="bg-emerald-100 px-1 rounded">nearest_subway_dist</code>,{" "}
          <code className="bg-emerald-100 px-1 rounded">bus_count_500m</code> 등) + K-Means 클러스터링 파생변수입니다.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Golden Triangle — 최소 업무지구 거리 vs 가격" description="강남(GBD) · 광화문(CBD) · 여의도(YBD) 중 가장 가까운 거리(km)와 가격(억원)">
          <D3ScatterChart data={minDistScatter} color="#ec4899" xLabel="min_dist_to_job(km)" yLabel="가격(억)" xFormat={FMT_KM} yFormat={FMT_PRICE} />
        </ChartCard>
        <div className="rounded-xl bg-pink-50 border border-pink-100 p-5 flex flex-col justify-center">
          <h4 className="font-semibold text-pink-800 mb-3">Golden Triangle 인사이트</h4>
          <ul className="text-sm text-pink-700 space-y-2">
            <li><strong>강남(GBD)</strong> — 테헤란로 IT/금융 업무 중심</li>
            <li><strong>광화문(CBD)</strong> — 정부/대기업 본사 밀집</li>
            <li><strong>여의도(YBD)</strong> — 금융/방송 업무지구</li>
          </ul>
          <p className="text-sm text-pink-700 mt-3">
            <code className="bg-pink-100 px-1 rounded">min_dist_to_job</code> = 세 지점 중 최소 거리.
            직장까지의 접근성이 가격 구조를 결정하는 핵심 변수입니다.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="강남역 거리 vs 가격" description="강남역까지의 거리(km)와 거래가(억원)">
          <D3ScatterChart data={gangnamScatter} color="#ef4444" xLabel="강남역 거리(km)" yLabel="가격(억)" xFormat={FMT_KM} yFormat={FMT_PRICE} />
        </ChartCard>
        <ChartCard title="서울시청 거리 vs 가격" description="시청까지의 거리(km)와 거래가(억원)">
          <D3ScatterChart data={cityhallScatter} color="#3b82f6" xLabel="시청 거리(km)" yLabel="가격(억)" xFormat={FMT_KM} yFormat={FMT_PRICE} />
        </ChartCard>
        <ChartCard title="여의도 거리 vs 가격" description="여의도까지의 거리(km)와 거래가(억원)">
          <D3ScatterChart data={yeouScatter} color="#f59e0b" xLabel="여의도 거리(km)" yLabel="가격(억)" xFormat={FMT_KM} yFormat={FMT_PRICE} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="구별 강남역 거리 순" description="각 구 중심으로부터 강남역까지 거리(km)" className="lg:col-span-1">
          <D3HBarChart data={guDistData} labelKey="gu" valueKey="dist" valueFormat={FMT_DIST_1} colors={GU_DIST_COLORS} />
        </ChartCard>
        <ChartCard title="구별 평균 거래가격" description="가격순 정렬 (억원)">
          <D3HBarChart data={guSummary} labelKey="gu" valueKey="avgPrice" valueFormat={FMT_PRICE_1} />
        </ChartCard>
      </section>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        <h4 className="font-medium text-gray-700 mb-2">공간 클러스터링 (Step 6.8)</h4>
        <p className="text-sm text-gray-600">
          좌표(X, Y)에 K-Means(K=150) 클러스터링 적용 → 각 클러스터별 Target Encoding으로{" "}
          <code className="bg-gray-100 px-1 rounded">te_spatial_cluster</code> 생성. 같은 생활권의 평균 가격 수준을 반영합니다.
          이 변수는 K-Fold 내부에서만 계산되므로 원본 데이터로는 직접 시각화할 수 없습니다.
        </p>
      </div>
    </div>
  );
});
