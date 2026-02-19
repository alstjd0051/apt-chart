import { useEffect, useCallback } from "react";
import { useDashboardStore } from "./store/dashboardStore";
import { Tooltip } from "./components/Tooltip";
import { OverviewPage } from "./pages/OverviewPage";
import { TemporalPage } from "./pages/TemporalPage";
import { BuildingPage } from "./pages/BuildingPage";
import { SpatialPage } from "./pages/SpatialPage";
import { InteractionPage } from "./pages/InteractionPage";
import { ModelingPage } from "./pages/ModelingPage";
import { TeamMembers } from "./components/TeamMembers";
import type { TabId } from "./types";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "기본 분석", icon: "📊" },
  { id: "temporal", label: "시간 파생변수", icon: "🕐" },
  { id: "building", label: "건물 파생변수", icon: "🏢" },
  { id: "spatial", label: "공간 파생변수", icon: "📍" },
  { id: "interaction", label: "교호작용 파생변수", icon: "🔗" },
  { id: "modeling", label: "모델링 & 실험", icon: "🧪" },
];

function App() {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const data = useDashboardStore((s) => s.data);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const fetchData = useDashboardStore((s) => s.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabClick = useCallback(
    (id: TabId) => () => setActiveTab(id),
    [setActiveTab],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <h2 className="text-red-700 font-bold text-lg mb-2">
            데이터 로드 실패
          </h2>
          <p className="text-red-600 text-sm">{error ?? "알 수 없는 오류"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tooltip />
      <TeamMembers />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              서울 아파트 실거래가 대시보드
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              2007~2023년 &middot; 서울 25개 구 &middot; 총{" "}
              {data.totalRows.toLocaleString()}건 &middot; 파생변수 42개
            </p>
          </div>
          <nav className="flex gap-1 -mb-px overflow-x-auto pb-px scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "overview" && <OverviewPage data={data} />}
        {activeTab === "temporal" && <TemporalPage data={data} />}
        {activeTab === "building" && <BuildingPage data={data} />}
        {activeTab === "spatial" && <SpatialPage data={data} />}
        {activeTab === "interaction" && <InteractionPage data={data} />}
        {activeTab === "modeling" && <ModelingPage data={data} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            서울 아파트 실거래가 데이터 시각화 · D3.js + React + Zustand · AI
            Stages Competition #420
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
