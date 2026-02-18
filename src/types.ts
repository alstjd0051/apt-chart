export interface YearlySummary {
  year: string;
  count: number;
  avgPrice: number;
}

export interface MonthlySummary {
  month: string;
  count: number;
  avgPrice: number;
}

export interface GuSummary {
  gu: string;
  count: number;
  avgPrice: number;
}

export interface PointXY {
  x: number;
  price: number;
}

export interface AreaPrice {
  area: number;
  price: number;
}

export interface AgePrice {
  age: number;
  price: number;
}

export interface FloorPrice {
  floor: number;
  price: number;
}

export interface DistPrice {
  dist: number;
  price: number;
}

export interface GuCenter {
  gu: string;
  lon: number;
  lat: number;
  avgPrice: number;
  count: number;
}

export interface TemporalMonth {
  month: number;
  avgPrice: number;
  medPrice: number;
  count: number;
}

export interface TemporalQuarter {
  quarter: string;
  avgPrice: number;
  count: number;
}

export interface TemporalHalf {
  half: string;
  avgPrice: number;
  count: number;
}

export interface BuildingAgeBin {
  ageBin: string;
  avgPrice: number;
  medPrice: number;
  count: number;
}

export interface RebuildStat {
  label: string;
  avgPrice: number;
  count: number;
}

export interface SegStat {
  seg: string;
  avgPrice: number;
  count: number;
}

export interface SummaryData {
  totalRows: number;
  yearlySummary: YearlySummary[];
  monthlySummary: MonthlySummary[];
  guSummary: GuSummary[];
  areaVsPrice: AreaPrice[];
  buildingAgeVsPrice: AgePrice[];
  floorVsPrice: FloorPrice[];
  heatmapData: Record<string, string | number | null>[];
  allGus: string[];
  top5Gus: string[];
  temporal: {
    byMonth: TemporalMonth[];
    byQuarter: TemporalQuarter[];
    byHalf: TemporalHalf[];
  };
  building: {
    byAgeBin: BuildingAgeBin[];
    rebuild: RebuildStat[];
    byFloorSeg: SegStat[];
    byAreaSeg: SegStat[];
  };
  interaction: {
    areaXFloor: PointXY[];
    areaAgeRatio: PointXY[];
    parkingRatio: PointXY[];
    dongDensity: PointXY[];
  };
  spatial: {
    distGangnam: DistPrice[];
    distCityhall: DistPrice[];
    distYeouido: DistPrice[];
    minDistJob: DistPrice[];
    guCenters: GuCenter[];
  };
  priceDist: {
    raw: { bin: string; count: number }[];
    log: { bin: string; count: number }[];
    rawSkew: number;
    logSkew: number;
  };
}

export type TabId = "overview" | "temporal" | "building" | "spatial" | "interaction" | "modeling";
