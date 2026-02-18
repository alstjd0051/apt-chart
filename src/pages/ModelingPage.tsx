import { ChartCard } from "../components/ChartCard";
import { StatCard } from "../components/StatCard";
import { D3BarChart } from "../components/d3/D3BarChart";
import { D3LineChart } from "../components/d3/D3LineChart";
import { D3HBarChart } from "../components/d3/D3HBarChart";
import type { SummaryData } from "../types";
import { useState, useMemo, useCallback, memo } from "react";

interface Props {
  data: SummaryData;
}

const EXPERIMENTS = [
  { exp: "Exp01", cvRmse: 5601, lbRmse: 16112, desc: "지오코딩 베이스라인" },
  { exp: "Exp02", cvRmse: 15000, lbRmse: 29524, desc: "검증 전략 보정" },
  { exp: "Exp03", cvRmse: 5372, lbRmse: 16313, desc: "건물 연식 추가" },
  { exp: "Exp04", cvRmse: 18000, lbRmse: 77463, desc: "시계열 분할 베이스라인" },
  { exp: "Exp05", cvRmse: 3137, lbRmse: 16928, desc: "교통 특성 (Shuffle)" },
  { exp: "Exp06", cvRmse: 7220, lbRmse: 16007, desc: "2017+ 데이터 필터링" },
  { exp: "Exp08", cvRmse: 15642, lbRmse: 15642, desc: "공간 클러스터링" },
  { exp: "Exp10", cvRmse: 7325, lbRmse: 16438, desc: "금리+브랜드" },
  { exp: "Exp11", cvRmse: 7303, lbRmse: 16314, desc: "브랜드 단독 검증" },
  { exp: "Exp12", cvRmse: 7215, lbRmse: 15572, desc: "교통 복구+강남 거리" },
  { exp: "Exp13", cvRmse: 20779, lbRmse: 25140, desc: "GroupKFold" },
  { exp: "Exp14", cvRmse: 13670, lbRmse: 15651, desc: "Time Split 확립" },
  { exp: "Exp15", cvRmse: 13176, lbRmse: 15651, desc: "시점 가중치 강화" },
  { exp: "Exp16", cvRmse: 13101, lbRmse: 16530, desc: "Golden Triangle" },
  { exp: "Exp17", cvRmse: 12042, lbRmse: 18940, desc: "아파트명 TE (과적합)" },
];

const ENSEMBLE_MODELS = [
  { model: "LightGBM", cvRmse: 0.068056, weight: 35.4, strength: "범주형 네이티브 처리" },
  { model: "XGBoost", cvRmse: 0.066885, weight: 36.0, strength: "히스토그램 기반 GPU" },
  { model: "CatBoost", cvRmse: 0.084112, weight: 28.6, strength: "과적합에 강함" },
];

const FEATURE_IMPORTANCE = [
  { feature: "te_coord_cluster", importance: 0.312, category: "공간" },
  { feature: "전용면적(㎡)", importance: 0.147, category: "기본" },
  { feature: "te_시군구", importance: 0.089, category: "인코딩" },
  { feature: "nearest_subway_dist", importance: 0.072, category: "교통" },
  { feature: "건물나이", importance: 0.064, category: "건물" },
  { feature: "층", importance: 0.053, category: "기본" },
  { feature: "dist_강남역", importance: 0.048, category: "공간" },
  { feature: "subway_count_1km", importance: 0.041, category: "교통" },
  { feature: "parking_per_household", importance: 0.037, category: "품질" },
  { feature: "min_dist_to_job", importance: 0.034, category: "공간" },
  { feature: "bus_count_500m", importance: 0.028, category: "교통" },
  { feature: "면적×층", importance: 0.025, category: "교호작용" },
  { feature: "days_since", importance: 0.021, category: "시간" },
  { feature: "is_top_brand", importance: 0.016, category: "브랜드" },
  { feature: "is_rebuild_candidate", importance: 0.013, category: "건물" },
];

const CATEGORY_COLORS: Record<string, string> = {
  공간: "#ef4444",
  기본: "#6366f1",
  인코딩: "#8b5cf6",
  교통: "#10b981",
  건물: "#f59e0b",
  품질: "#14b8a6",
  교호작용: "#ec4899",
  시간: "#3b82f6",
  브랜드: "#f97316",
};

type DistView = "raw" | "log";

const FMT_RMSE = (v: number) => (v >= 10000 ? `${(v / 1000).toFixed(0)}K` : `${v.toFixed(0)}`);
const FMT_CV4 = (v: number) => v.toFixed(4);
const FMT_PCT = (v: number) => `${v.toFixed(1)}%`;
const FMT_FI = (v: number) => `${(v * 100).toFixed(1)}%`;
const FMT_COUNT = (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v.toLocaleString());

const BEST_EXP = EXPERIMENTS.reduce((a, b) => (a.lbRmse < b.lbRmse ? a : b));
const BEST_CV_EXP = EXPERIMENTS.reduce((a, b) => (a.cvRmse < b.cvRmse ? a : b));

const LB_SERIES = [
  { label: "LB RMSE", color: "#ef4444", values: EXPERIMENTS.map((e) => ({ x: e.exp, y: e.lbRmse })) },
];
const CV_SERIES = [
  { label: "CV RMSE", color: "#6366f1", values: EXPERIMENTS.map((e) => ({ x: e.exp, y: e.cvRmse })) },
];
const FI_COLORS = FEATURE_IMPORTANCE.map((f) => CATEGORY_COLORS[f.category] ?? "#6b7280");

export const ModelingPage = memo(function ModelingPage({ data }: Props) {
  const [distView, setDistView] = useState<DistView>("raw");
  const { priceDist } = data;

  const distData = useMemo(
    () => (distView === "raw" ? priceDist.raw : priceDist.log),
    [priceDist, distView],
  );

  const distColor = distView === "raw" ? "#f59e0b" : "#6366f1";

  const setRaw = useCallback(() => setDistView("raw"), []);
  const setLog = useCallback(() => setDistView("log"), []);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
        <h3 className="font-semibold text-rose-800 mb-2">
          모델링 & 실험 여정 (Exp01 ~ Exp17)
        </h3>
        <p className="text-sm text-rose-700">
          19회 체계적 실험을 통한 성능 개선 과정, 3-모델 앙상블 구성, 피처 중요도 분석,
          그리고 가격 분포의 log 변환 효과를 확인합니다.
        </p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="최고 LB RMSE"
          value={BEST_EXP.lbRmse.toLocaleString()}
          sub={BEST_EXP.exp}
          accent="text-red-600"
        />
        <StatCard
          label="최저 CV RMSE"
          value={BEST_CV_EXP.cvRmse.toLocaleString()}
          sub={BEST_CV_EXP.exp}
          accent="text-indigo-600"
        />
        <StatCard
          label="앙상블 OOF RMSE"
          value="0.0679"
          sub="3-Model Weighted"
          accent="text-emerald-600"
        />
        <StatCard
          label="총 실험 횟수"
          value="19회"
          sub="Exp01 ~ Exp19"
          accent="text-amber-600"
        />
      </section>

      {/* 리더보드 RMSE 추이 */}
      <ChartCard
        title="리더보드 RMSE 추이 (LB Score)"
        description="실험별 Leaderboard RMSE 변화 — 낮을수록 성능 우수"
      >
        <D3LineChart
          series={LB_SERIES}
          yFormat={FMT_RMSE}
          height={380}
          showLegend
        />
      </ChartCard>

      {/* CV RMSE 추이 */}
      <ChartCard
        title="CV RMSE 추이"
        description="Cross-Validation RMSE — Shuffle K-Fold vs Time Split 전환점 확인"
      >
        <D3LineChart
          series={CV_SERIES}
          yFormat={FMT_RMSE}
          height={380}
          showLegend
        />
      </ChartCard>

      {/* 실험 테이블 */}
      <ChartCard title="실험 상세 이력" description="Exp01~Exp17 핵심 변경 사항 및 RMSE">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">실험</th>
                <th className="py-2 pr-3 font-medium">핵심 변경</th>
                <th className="py-2 pr-3 font-medium text-right">CV RMSE</th>
                <th className="py-2 font-medium text-right">LB RMSE</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIMENTS.map((e) => {
                const isBestLb = e.lbRmse === BEST_EXP.lbRmse;
                const isBestCv = e.cvRmse === BEST_CV_EXP.cvRmse;
                return (
                  <tr
                    key={e.exp}
                    className={`border-b border-gray-100 ${isBestLb ? "bg-red-50" : isBestCv ? "bg-indigo-50" : ""}`}
                  >
                    <td className="py-2 pr-3 font-mono font-medium text-gray-700">{e.exp}</td>
                    <td className="py-2 pr-3 text-gray-600">{e.desc}</td>
                    <td className={`py-2 pr-3 text-right font-mono ${isBestCv ? "font-bold text-indigo-700" : "text-gray-700"}`}>
                      {e.cvRmse.toLocaleString()}
                    </td>
                    <td className={`py-2 text-right font-mono ${isBestLb ? "font-bold text-red-700" : "text-gray-700"}`}>
                      {e.lbRmse.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* 앙상블 모델 성능 비교 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="앙상블 모델 CV RMSE 비교"
          description="log1p 스케일 기준 OOF RMSE — 낮을수록 우수"
        >
          <D3BarChart
            data={ENSEMBLE_MODELS}
            xKey="model"
            yKey="cvRmse"
            color="#6366f1"
            yFormat={FMT_CV4}
          />
        </ChartCard>
        <ChartCard
          title="앙상블 가중치 배분"
          description="RMSE 역수 기반 자동 할당 — 성능 좋은 모델에 높은 비중"
        >
          <D3BarChart
            data={ENSEMBLE_MODELS}
            xKey="model"
            yKey="weight"
            color="#10b981"
            yFormat={FMT_PCT}
          />
        </ChartCard>
      </section>

      <ChartCard title="앙상블 구성 상세" description="3-모델 가중 앙상블 (OOF RMSE 역수)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ENSEMBLE_MODELS.map((m) => (
            <div key={m.model} className="rounded-xl border border-gray-200 p-4 text-center">
              <h4 className="font-bold text-lg text-gray-800">{m.model}</h4>
              <p className="text-sm text-gray-500 mt-1">{m.strength}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-indigo-50 rounded-lg p-2">
                  <span className="text-indigo-600 font-mono font-bold">{m.cvRmse.toFixed(6)}</span>
                  <p className="text-xs text-gray-500">CV RMSE</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2">
                  <span className="text-emerald-600 font-mono font-bold">{m.weight}%</span>
                  <p className="text-xs text-gray-500">가중치</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* 피처 중요도 */}
      <ChartCard
        title="피처 중요도 Top 15"
        description="LightGBM 기준 Feature Importance (normalized) — te_coord_cluster가 압도적 1위"
      >
        <D3HBarChart
          data={FEATURE_IMPORTANCE}
          labelKey="feature"
          valueKey="importance"
          valueFormat={FMT_FI}
          colors={FI_COLORS}
          height={480}
        />
        <div className="flex flex-wrap gap-3 mt-4 px-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: col }} />
              {cat}
            </div>
          ))}
        </div>
      </ChartCard>

      {/* 가격 분포 히스토그램 (log 변환 전/후) */}
      <ChartCard
        title="가격 분포 (log1p 변환 전/후)"
        description="오른쪽으로 긴 꼬리(Right-skewed) → log1p 변환으로 정규분포에 가깝게"
      >
        <div className="flex gap-2 mb-3">
          <button
            onClick={setRaw}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              distView === "raw" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >원본 (만원)</button>
          <button
            onClick={setLog}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              distView === "log" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >log1p 변환</button>
          <span className="ml-auto text-xs text-gray-400 self-center">
            Skewness: {distView === "raw" ? priceDist.rawSkew : priceDist.logSkew}
          </span>
        </div>
        <D3BarChart
          data={distData}
          xKey="bin"
          yKey="count"
          color={distColor}
          yFormat={FMT_COUNT}
          height={360}
        />
      </ChartCard>

      {/* 세 번의 전환점 */}
      <ChartCard title="세 번의 전환점" description="실패에서 배운 핵심 교훈">
        <div className="space-y-4">
          {[
            {
              num: 1,
              title: "CV 점수가 낮다고 좋은 모델이 아니다",
              range: "Exp01~Exp04",
              problem: "Shuffle K-Fold의 CV RMSE 5,601 → 리더보드 16,112. 3배 차이!",
              solution: "TimeSeriesSplit + 시간 기반 Sample Weight로 정직한 평가 체계 구축",
              color: "indigo",
            },
            {
              num: 2,
              title: "유령 지하철 — 데이터의 양보다 질",
              range: "Exp05~Exp06",
              problem: "2010년 거래에 2023년 기준 지하철역 거리가 반영됨 (미래 정보 누수)",
              solution: "2017년 이후 데이터만 사용하여 누수 차단",
              color: "emerald",
            },
            {
              num: 3,
              title: "아파트 가격의 본질은 '생활권'",
              range: "Exp08, Exp16~17",
              problem: "좌표 클러스터링 te_coord_cluster가 변수 중요도 1위",
              solution: "Golden Triangle + OOF TE로 '어디에 있느냐'를 수치화",
              color: "rose",
            },
          ].map((tp) => (
            <div
              key={tp.num}
              className={`rounded-xl border p-4 bg-${tp.color}-50 border-${tp.color}-100`}
              style={{
                backgroundColor: tp.color === "indigo" ? "#eef2ff" : tp.color === "emerald" ? "#ecfdf5" : "#fff1f2",
                borderColor: tp.color === "indigo" ? "#c7d2fe" : tp.color === "emerald" ? "#a7f3d0" : "#fecdd3",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    backgroundColor: tp.color === "indigo" ? "#6366f1" : tp.color === "emerald" ? "#10b981" : "#f43f5e",
                  }}
                >
                  {tp.num}
                </span>
                <h4 className="font-semibold text-gray-800">{tp.title}</h4>
                <span className="text-xs text-gray-400 ml-auto">{tp.range}</span>
              </div>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-700">문제:</strong> {tp.problem}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong className="text-gray-700">해결:</strong> {tp.solution}
              </p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
});
