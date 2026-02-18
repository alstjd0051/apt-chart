import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../../src/App";
import { useDashboardStore } from "../../src/store/dashboardStore";

const mockData = {
  totalRows: 100000,
  yearlySummary: [
    { year: "2020", count: 50000, avgPrice: 5.5 },
    { year: "2021", count: 40000, avgPrice: 6.2 },
  ],
  monthlySummary: [{ month: "202001", count: 5000, avgPrice: 5.5 }],
  guSummary: [
    { gu: "강남구", count: 10000, avgPrice: 15.0 },
    { gu: "서초구", count: 8000, avgPrice: 12.0 },
    { gu: "용산구", count: 5000, avgPrice: 10.0 },
    { gu: "송파구", count: 9000, avgPrice: 9.5 },
    { gu: "성동구", count: 7000, avgPrice: 8.0 },
  ],
  areaVsPrice: [{ area: 84, price: 8 }],
  buildingAgeVsPrice: [{ age: 10, price: 5 }],
  floorVsPrice: [{ floor: 10, price: 6 }],
  heatmapData: [{ year: "2020", "강남구": 15, "서초구": 12, "용산구": 10, "송파구": 9.5, "성동구": 8 }],
  allGus: ["강남구", "서초구", "용산구", "송파구", "성동구"],
  top5Gus: ["강남구", "서초구", "용산구", "송파구", "성동구"],
  temporal: {
    byMonth: [{ month: 1, avgPrice: 5, medPrice: 4.5, count: 90000 }],
    byQuarter: [{ quarter: "Q1", avgPrice: 5, count: 270000 }],
    byHalf: [{ half: "상반기", avgPrice: 5, count: 550000 }],
  },
  building: {
    byAgeBin: [{ ageBin: "0~4년", avgPrice: 8, medPrice: 7, count: 50000 }],
    rebuild: [
      { label: "재건축 후보(30+년)", avgPrice: 6, count: 300000 },
      { label: "비해당(<30년)", avgPrice: 5, count: 700000 },
    ],
    byFloorSeg: [{ seg: "중층(4~10층)", avgPrice: 5, count: 500000 }],
    byAreaSeg: [{ seg: "국민평형(60~84㎡)", avgPrice: 6, count: 400000 }],
  },
  interaction: {
    areaXFloor: [{ x: 840, price: 8 }],
    areaAgeRatio: [{ x: 8.4, price: 6 }],
    parkingRatio: [{ x: 1.2, price: 5 }],
    dongDensity: [{ x: 50, price: 5 }],
  },
  spatial: {
    distGangnam: [{ dist: 3, price: 12 }],
    distCityhall: [{ dist: 5, price: 8 }],
    distYeouido: [{ dist: 7, price: 6 }],
    minDistJob: [{ dist: 3, price: 12 }],
    guCenters: [{ gu: "강남구", lon: 127.05, lat: 37.5, avgPrice: 15, count: 1000 }],
  },
  priceDist: {
    raw: [{ bin: "0~5억", count: 50000 }],
    log: [{ bin: "8.0~9.0", count: 40000 }],
    rawSkew: 3.2,
    logSkew: 0.3,
  },
};

beforeEach(() => {
  vi.restoreAllMocks();
  useDashboardStore.setState({
    activeTab: "overview",
    data: mockData as never,
    loading: false,
    error: null,
    tooltip: { visible: false, x: 0, y: 0, rows: [] },
  });
});

describe("탭 네비게이션 (zustand)", () => {
  it("기본 분석 탭이 기본으로 활성화되어 있다", () => {
    render(<App />);
    expect(screen.getByText("총 거래 건수")).toBeInTheDocument();
  });

  it("시간 파생변수 버튼 클릭 시 시간 페이지가 표시된다", () => {
    render(<App />);
    fireEvent.click(screen.getByText("시간 파생변수"));
    expect(screen.getByText("시간 파생변수 (Step 3.7)")).toBeInTheDocument();
  });

  it("건물 파생변수 버튼 클릭 시 건물 페이지가 표시된다", () => {
    render(<App />);
    fireEvent.click(screen.getByText("건물 파생변수"));
    expect(screen.getByText("건물 파생변수 (Step 3.5 / Step 7.7)")).toBeInTheDocument();
  });

  it("공간 파생변수 버튼 클릭 시 공간 페이지가 표시된다", () => {
    render(<App />);
    fireEvent.click(screen.getByText("공간 파생변수"));
    expect(screen.getByText("공간 파생변수 (Step 6.5 / 6.7 / 6.8)")).toBeInTheDocument();
  });

  it("교호작용 파생변수 버튼 클릭 시 교호작용 페이지가 표시된다", () => {
    render(<App />);
    fireEvent.click(screen.getByText("교호작용 파생변수"));
    expect(screen.getByText("교호작용 / 도메인 파생변수 (Step 7.5 / 7.7)")).toBeInTheDocument();
  });

  it("탭 변경 시 zustand store가 업데이트된다", () => {
    render(<App />);
    fireEvent.click(screen.getByText("공간 파생변수"));
    expect(useDashboardStore.getState().activeTab).toBe("spatial");
  });
});
