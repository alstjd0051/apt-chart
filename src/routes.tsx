import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useDashboardStore } from "./store/dashboardStore";
import { lazy, Suspense } from "react";

const OverviewPage = lazy(() => import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const TemporalPage = lazy(() => import("./pages/TemporalPage").then((m) => ({ default: m.TemporalPage })));
const BuildingPage = lazy(() => import("./pages/BuildingPage").then((m) => ({ default: m.BuildingPage })));
const SpatialPage = lazy(() => import("./pages/SpatialPage").then((m) => ({ default: m.SpatialPage })));
const InteractionPage = lazy(() => import("./pages/InteractionPage").then((m) => ({ default: m.InteractionPage })));
const ModelingPage = lazy(() => import("./pages/ModelingPage").then((m) => ({ default: m.ModelingPage })));
const CommentsPage = lazy(() => import("./pages/CommentsPage").then((m) => ({ default: m.CommentsPage })));

const PageFallback = () => (
  <div className="flex justify-center py-24">
    <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function DataGuard({ children }: { children: (data: NonNullable<ReturnType<typeof useDashboardStore.getState>["data"]>) => React.ReactNode }) {
  const data = useDashboardStore((s) => s.data);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <h2 className="text-red-700 font-bold text-lg mb-2">데이터 로드 실패</h2>
          <p className="text-red-600 text-sm">{error ?? "알 수 없는 오류"}</p>
        </div>
      </div>
    );
  }
  return <>{children(data)}</>;
}

function OverviewRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <OverviewPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function TemporalRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <TemporalPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function BuildingRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <BuildingPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function SpatialRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <SpatialPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function InteractionRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <InteractionPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function ModelingRoute() {
  return (
    <DataGuard>
      {(data) => (
        <Suspense fallback={<PageFallback />}>
          <ModelingPage data={data} />
        </Suspense>
      )}
    </DataGuard>
  );
}

function CommentsRoute() {
  const data = useDashboardStore((s) => s.data);
  return (
    <Suspense fallback={<PageFallback />}>
      <CommentsPage data={data} />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewRoute /> },
      { path: "temporal", element: <TemporalRoute /> },
      { path: "building", element: <BuildingRoute /> },
      { path: "spatial", element: <SpatialRoute /> },
      { path: "interaction", element: <InteractionRoute /> },
      { path: "modeling", element: <ModelingRoute /> },
      { path: "comments", element: <CommentsRoute /> },
    ],
  },
]);
