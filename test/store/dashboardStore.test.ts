import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDashboardStore } from "../../src/store/dashboardStore";

beforeEach(() => {
  vi.restoreAllMocks();
  useDashboardStore.setState({
    activeTab: "overview",
    data: null,
    loading: true,
    error: null,
    tooltip: { visible: false, x: 0, y: 0, rows: [] },
  });
});

describe("dashboardStore", () => {
  describe("탭 상태", () => {
    it("기본 탭은 overview이다", () => {
      expect(useDashboardStore.getState().activeTab).toBe("overview");
    });

    it("setActiveTab으로 탭을 변경할 수 있다", () => {
      useDashboardStore.getState().setActiveTab("temporal");
      expect(useDashboardStore.getState().activeTab).toBe("temporal");
    });
  });

  describe("데이터 fetch", () => {
    it("fetchData 성공 시 data가 설정되고 loading이 false가 된다", async () => {
      const mockData = { totalRows: 100, yearlySummary: [] };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      await useDashboardStore.getState().fetchData();

      const state = useDashboardStore.getState();
      expect(state.data).toEqual(mockData);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("fetchData 실패 시 error가 설정된다", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await useDashboardStore.getState().fetchData();

      const state = useDashboardStore.getState();
      expect(state.data).toBeNull();
      expect(state.error).toBe("HTTP 404");
      expect(state.loading).toBe(false);
    });

    it("이미 데이터가 있으면 fetch하지 않는다", async () => {
      const spy = vi.spyOn(globalThis, "fetch");
      useDashboardStore.setState({ data: { totalRows: 1 } as never });

      await useDashboardStore.getState().fetchData();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("툴팁 상태", () => {
    it("showTooltip으로 툴팁을 표시할 수 있다", () => {
      const rows = [{ label: "테스트", value: "100", color: "#f00" }];
      useDashboardStore.getState().showTooltip(100, 200, rows);

      const { tooltip } = useDashboardStore.getState();
      expect(tooltip.visible).toBe(true);
      expect(tooltip.x).toBe(100);
      expect(tooltip.y).toBe(200);
      expect(tooltip.rows).toEqual(rows);
    });

    it("hideTooltip으로 툴팁을 숨길 수 있다", () => {
      useDashboardStore.getState().showTooltip(50, 50, [{ label: "a", value: "b" }]);
      useDashboardStore.getState().hideTooltip();

      expect(useDashboardStore.getState().tooltip.visible).toBe(false);
    });
  });
});
