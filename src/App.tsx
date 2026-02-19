import { useEffect, useCallback } from "react";
import { useDashboardStore } from "./store/dashboardStore";
import { Tooltip } from "./components/Tooltip";
import { OverviewPage } from "./pages/OverviewPage";
import { TemporalPage } from "./pages/TemporalPage";
import { BuildingPage } from "./pages/BuildingPage";
import { SpatialPage } from "./pages/SpatialPage";
import { InteractionPage } from "./pages/InteractionPage";
import { ModelingPage } from "./pages/ModelingPage";
import { CommentsPage } from "./pages/CommentsPage";
import { TeamMembers } from "./components/TeamMembers";
import type { TabId } from "./types";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "기본 분석", icon: "📊" },
  { id: "temporal", label: "시간 파생변수", icon: "🕐" },
  { id: "building", label: "건물 파생변수", icon: "🏢" },
  { id: "spatial", label: "공간 파생변수", icon: "📍" },
  { id: "interaction", label: "교호작용 파생변수", icon: "🔗" },
  { id: "modeling", label: "모델링 & 실험", icon: "🧪" },
  { id: "comments", label: "댓글", icon: "💬" },
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

  const showCommentsOnly = activeTab === "comments";
  const showLoading = loading && !showCommentsOnly;
  const showError = (error || !data) && !showCommentsOnly;

  const renderMainContent = () => {
    if (activeTab === "comments") return <CommentsPage />;
    if (showLoading)
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">데이터를 불러오는 중...</p>
          </div>
        </div>
      );
    if (showError)
      return (
        <div className="flex items-center justify-center py-24">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
            <h2 className="text-red-700 font-bold text-lg mb-2">
              데이터 로드 실패
            </h2>
            <p className="text-red-600 text-sm">{error ?? "알 수 없는 오류"}</p>
          </div>
        </div>
      );
    if (data) {
      if (activeTab === "overview") return <OverviewPage data={data} />;
      if (activeTab === "temporal") return <TemporalPage data={data} />;
      if (activeTab === "building") return <BuildingPage data={data} />;
      if (activeTab === "spatial") return <SpatialPage data={data} />;
      if (activeTab === "interaction") return <InteractionPage data={data} />;
      if (activeTab === "modeling") return <ModelingPage data={data} />;
    }
    return null;
  };

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
              {data
                ? `2007~2023년 · 서울 25개 구 · 총 ${data.totalRows.toLocaleString()}건 · 파생변수 30개+`
                : "2007~2023년 · 서울 25개 구 · 파생변수 30개+"}
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
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
