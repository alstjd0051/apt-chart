import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDashboardStore } from "../../src/store/dashboardStore";

beforeEach(() => {
  vi.restoreAllMocks();
  useDashboardStore.setState({
    data: null,
    loading: true,
    error: null,
  });
});

describe("dashboardStore.fetchData (useData 대체)", () => {
  it("데이터를 정상적으로 로드한다", async () => {
    const mockData = { totalRows: 100, yearlySummary: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    await useDashboardStore.getState().fetchData();

    const s = useDashboardStore.getState();
    expect(s.data).toEqual(mockData);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  it("HTTP 에러 시 error를 반환한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await useDashboardStore.getState().fetchData();

    const s = useDashboardStore.getState();
    expect(s.data).toBeNull();
    expect(s.error).toBe("HTTP 404");
  });

  it("네트워크 에러 시 error를 반환한다", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    await useDashboardStore.getState().fetchData();

    const s = useDashboardStore.getState();
    expect(s.data).toBeNull();
    expect(s.error).toBe("Network error");
  });
});
