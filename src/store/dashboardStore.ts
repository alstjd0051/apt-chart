import { create } from "zustand";
import type { SummaryData, TabId } from "../types";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  rows: { label: string; value: string; color?: string }[];
}

interface DashboardState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  data: SummaryData | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;

  tooltip: TooltipState;
  showTooltip: (x: number, y: number, rows: TooltipState["rows"]) => void;
  hideTooltip: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  data: null,
  loading: true,
  error: null,
  fetchData: async () => {
    if (get().data) return;
    try {
      const res = await fetch("/data/summary.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SummaryData = await res.json();
      set({ data: json, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  tooltip: { visible: false, x: 0, y: 0, rows: [] },
  showTooltip: (x, y, rows) => set({ tooltip: { visible: true, x, y, rows } }),
  hideTooltip: () => {
    if (get().tooltip.visible) {
      set({ tooltip: { visible: false, x: 0, y: 0, rows: [] } });
    }
  },
}));
