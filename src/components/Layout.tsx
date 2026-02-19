import { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Tooltip } from "./Tooltip";
import { TeamMembers } from "./TeamMembers";
import { useDashboardStore } from "../store/dashboardStore";

const PAGES = [
  { path: "/overview", label: "기본 분석", icon: "📊" },
  { path: "/temporal", label: "시간 파생변수", icon: "🕐" },
  { path: "/building", label: "건물 파생변수", icon: "🏢" },
  { path: "/spatial", label: "공간 파생변수", icon: "📍" },
  { path: "/interaction", label: "교호작용 파생변수", icon: "🔗" },
  { path: "/modeling", label: "모델링 & 실험", icon: "🧪" },
  { path: "/comments", label: "댓글", icon: "💬" },
];

export function Layout() {
  const data = useDashboardStore((s) => s.data);
  const fetchData = useDashboardStore((s) => s.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            {PAGES.map((page) => (
              <NavLink
                key={page.path}
                to={page.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <span>{page.icon}</span>
                {page.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
