import type { SummaryData } from "../types";
import { ChartCard } from "../components/ChartCard";
import { D3ScatterChart } from "../components/d3/D3ScatterChart";
import { useMemo, memo } from "react";

interface Props {
  data: SummaryData;
}

const FMT_PRICE = (v: number) => `${v}억`;
const FMT_AXF = (v: number) => `${(v / 100).toFixed(0)}×100`;
const FMT_INT = (v: number) => `${v.toFixed(0)}`;
const FMT_DEC1 = (v: number) => `${v.toFixed(1)}`;
const AREA_DOMAIN: [number, number] = [0, 3];

export const InteractionPage = memo(function InteractionPage({ data }: Props) {
  const { interaction } = data;

  const areaXFloor = useMemo(
    () => interaction.areaXFloor.map((d) => ({ x: d.x, y: d.price })),
    [interaction.areaXFloor],
  );
  const areaAgeRatio = useMemo(
    () => interaction.areaAgeRatio.map((d) => ({ x: d.x, y: d.price })),
    [interaction.areaAgeRatio],
  );
  const parkingRatio = useMemo(
    () => interaction.parkingRatio.map((d) => ({ x: d.x, y: d.price })),
    [interaction.parkingRatio],
  );
  const dongDensity = useMemo(
    () => interaction.dongDensity.map((d) => ({ x: d.x, y: d.price })),
    [interaction.dongDensity],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
        <h3 className="font-semibold text-purple-800 mb-2">교호작용 / 도메인 파생변수 (Step 7.5 / 7.7)</h3>
        <p className="text-sm text-purple-700">
          피처 간 교호작용과 부동산 도메인 지식 기반 파생변수:{" "}
          <code className="bg-purple-100 px-1 rounded">면적×층</code>,{" "}
          <code className="bg-purple-100 px-1 rounded">면적_건물나이비</code>,{" "}
          <code className="bg-purple-100 px-1 rounded">parking_per_household</code>,{" "}
          <code className="bg-purple-100 px-1 rounded">동당세대수</code> 등을 분석합니다.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="면적×층 vs 가격" description="전용면적 × 층수 교호작용 (면적·층이 동시에 큰 고가 물건)">
          <D3ScatterChart data={areaXFloor} color="#6366f1" xLabel="면적 × 층" yLabel="가격(억)" xFormat={FMT_AXF} yFormat={FMT_PRICE} />
        </ChartCard>
        <ChartCard title="면적/건물나이비 vs 가격" description="전용면적 ÷ (건물나이+1) — 넓으면서 신축일수록 높은 값">
          <D3ScatterChart data={areaAgeRatio} color="#f59e0b" xLabel="면적 ÷ (건물나이+1)" yLabel="가격(억)" xFormat={FMT_INT} yFormat={FMT_PRICE} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="세대당 주차대수 vs 가격" description="parking_per_household = 주차대수 ÷ (전체세대수+1)">
          <D3ScatterChart data={parkingRatio} color="#10b981" xLabel="세대당 주차대수" yLabel="가격(억)" xFormat={FMT_DEC1} yFormat={FMT_PRICE} xDomain={AREA_DOMAIN} />
        </ChartCard>
        <ChartCard title="동당세대수 vs 가격" description="동당세대수 = 전체세대수 ÷ (전체동수+1) — 단지 밀집도">
          <D3ScatterChart data={dongDensity} color="#8b5cf6" xLabel="동당세대수" yLabel="가격(억)" xFormat={FMT_INT} yFormat={FMT_PRICE} />
        </ChartCard>
      </section>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        <h4 className="font-medium text-gray-700 mb-3">추가 교호작용 파생변수</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "log_전용면적", desc: "log1p(전용면적) — 면적 분포 정규화" },
            { name: "전용면적_sq", desc: "전용면적² — 면적 비선형 효과" },
            { name: "층_건물나이비", desc: "층 ÷ (건물나이+1)" },
            { name: "is_rebuild_candidate", desc: "건물나이 >= 30 → 재건축 기대" },
            { name: "missing_count", desc: "행별 결측 개수 — 데이터 품질" },
            { name: "is_real_coord", desc: "실측 좌표=1, 보간 좌표=0" },
          ].map((f) => (
            <div key={f.name} className="rounded-lg bg-white border border-gray-100 p-3">
              <code className="text-sm font-mono text-purple-700">{f.name}</code>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
