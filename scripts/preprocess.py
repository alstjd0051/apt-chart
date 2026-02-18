"""train.csv → 시각화용 JSON 요약 데이터 생성 (파생변수 포함)"""

import csv
import json
import math
import os
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "temp_data")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUT_DIR, exist_ok=True)

TRAIN_PATH = os.path.join(DATA_DIR, "train.csv")
SUBWAY_PATH = os.path.join(DATA_DIR, "subway_feature.csv")
BUS_PATH = os.path.join(DATA_DIR, "bus_feature.csv")

GANGNAM = (127.0276, 37.4979)
CITYHALL = (126.9784, 37.5665)
YEOUIDO = (126.9246, 37.5219)


def haversine(lon1, lat1, lon2, lat2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def parse_gu(sigungu: str) -> str:
    parts = sigungu.split()
    return parts[1] if len(parts) >= 2 else sigungu


def parse_dong(sigungu: str) -> str:
    parts = sigungu.split()
    return parts[2] if len(parts) >= 3 else sigungu


def safe_float(v, default=None):
    try:
        return float(v)
    except (ValueError, TypeError):
        return default


def safe_int(v, default=None):
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return default


def main():
    # ── 1. 기본 통계 수집기 ──
    yearly_count = defaultdict(int)
    yearly_price_sum = defaultdict(float)
    monthly_count = defaultdict(int)
    monthly_price_sum = defaultdict(float)
    gu_count = defaultdict(int)
    gu_price_sum = defaultdict(float)
    yearly_gu_price_sum = defaultdict(lambda: defaultdict(float))
    yearly_gu_count = defaultdict(lambda: defaultdict(int))

    # ── 2. 파생변수 수집기 ──
    # 시간 파생
    month_prices = defaultdict(list)
    quarter_prices = defaultdict(list)
    half_prices = defaultdict(list)

    # 건물 파생
    age_bins = defaultdict(list)  # 건물나이 5년 단위
    rebuild_prices = {"yes": [], "no": []}
    floor_seg_prices = defaultdict(list)  # 층구간별
    area_seg_prices = defaultdict(list)  # 면적대별

    # 교호작용 파생
    area_x_floor_scatter = []
    area_age_ratio_scatter = []
    parking_ratio_scatter = []
    dong_density_scatter = []

    # 공간 파생
    dist_gangnam_scatter = []
    dist_cityhall_scatter = []
    dist_yeouido_scatter = []
    gu_coord_data = defaultdict(lambda: {"lons": [], "lats": [], "prices": []})

    # 기본 산점도
    area_prices = []
    building_age_prices = []
    floor_prices_scatter = []

    # 가격 분포 (히스토그램)
    all_prices_raw = []
    # Golden Triangle min_dist
    min_dist_scatter = []

    sample_step = 0
    total_rows = 0

    with open(TRAIN_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_rows += 1
            price = safe_float(row.get("target"))
            if price is None:
                continue

            year_str = row["계약년월"][:4]
            month_str = row["계약년월"][:6]
            gu = parse_gu(row["시군구"])
            area = safe_float(row["전용면적(㎡)"])
            floor_val = safe_int(row["층"])
            build_year = safe_int(row["건축년도"])
            contract_year = safe_int(year_str)
            contract_month = safe_int(row["계약년월"][4:6])
            lon = safe_float(row.get("좌표X"))
            lat = safe_float(row.get("좌표Y"))
            total_households = safe_float(row.get("k-전체세대수"))
            total_dong = safe_float(row.get("k-전체동수"))
            parking = safe_float(row.get("주차대수"))
            price_eok = price / 10000
            all_prices_raw.append(price)

            # 기본 통계
            yearly_count[year_str] += 1
            yearly_price_sum[year_str] += price
            monthly_count[month_str] += 1
            monthly_price_sum[month_str] += price
            gu_count[gu] += 1
            gu_price_sum[gu] += price
            yearly_gu_price_sum[year_str][gu] += price
            yearly_gu_count[year_str][gu] += 1

            # ── 시간 파생변수 ──
            if contract_month:
                month_prices[contract_month].append(price_eok)
                quarter = (contract_month - 1) // 3 + 1
                quarter_prices[quarter].append(price_eok)
                half = 1 if contract_month <= 6 else 2
                half_prices[half].append(price_eok)

            # ── 건물 파생변수 ──
            building_age = None
            if contract_year and build_year:
                building_age = max(0, contract_year - build_year)
                age_bin = (building_age // 5) * 5
                age_bins[age_bin].append(price_eok)
                if building_age >= 30:
                    rebuild_prices["yes"].append(price_eok)
                else:
                    rebuild_prices["no"].append(price_eok)

            if floor_val is not None:
                if floor_val <= 3:
                    seg = "저층(~3층)"
                elif floor_val <= 10:
                    seg = "중층(4~10층)"
                elif floor_val <= 20:
                    seg = "고층(11~20층)"
                else:
                    seg = "초고층(21+층)"
                floor_seg_prices[seg].append(price_eok)

            if area is not None:
                if area <= 59:
                    aseg = "소형(~59㎡)"
                elif area <= 84:
                    aseg = "국민평형(60~84㎡)"
                elif area <= 135:
                    aseg = "중형(85~135㎡)"
                else:
                    aseg = "대형(135+㎡)"
                area_seg_prices[aseg].append(price_eok)

            # ── 샘플링 기반 산점도 (매 30행마다) ──
            sample_step += 1
            if sample_step % 30 == 0:
                if area is not None:
                    area_prices.append({"area": round(area, 1), "price": round(price_eok, 2)})

                if building_age is not None and 0 <= building_age <= 60:
                    building_age_prices.append({"age": building_age, "price": round(price_eok, 2)})

                if floor_val is not None and 0 < floor_val <= 70:
                    floor_prices_scatter.append({"floor": floor_val, "price": round(price_eok, 2)})

                # 교호작용
                if area and floor_val and 0 < floor_val <= 70:
                    area_x_floor_scatter.append({
                        "x": round(area * floor_val, 1),
                        "price": round(price_eok, 2),
                    })

                if area and building_age is not None:
                    ratio = round(area / (building_age + 1), 2)
                    area_age_ratio_scatter.append({"x": ratio, "price": round(price_eok, 2)})

                if parking is not None and total_households and total_households > 0:
                    pr = round(parking / (total_households + 1), 3)
                    parking_ratio_scatter.append({"x": pr, "price": round(price_eok, 2)})

                if total_households and total_dong and total_dong > 0:
                    dd = round(total_households / (total_dong + 1), 1)
                    dong_density_scatter.append({"x": dd, "price": round(price_eok, 2)})

                # 공간
                if lon and lat and 124 < lon < 132 and 33 < lat < 39:
                    dg = round(haversine(lon, lat, *GANGNAM), 2)
                    dc = round(haversine(lon, lat, *CITYHALL), 2)
                    dy = round(haversine(lon, lat, *YEOUIDO), 2)
                    min_d = round(min(dg, dc, dy), 2)
                    dist_gangnam_scatter.append({"dist": dg, "price": round(price_eok, 2)})
                    dist_cityhall_scatter.append({"dist": dc, "price": round(price_eok, 2)})
                    dist_yeouido_scatter.append({"dist": dy, "price": round(price_eok, 2)})
                    min_dist_scatter.append({"dist": min_d, "price": round(price_eok, 2)})
                    gu_coord_data[gu]["lons"].append(lon)
                    gu_coord_data[gu]["lats"].append(lat)
                    gu_coord_data[gu]["prices"].append(price_eok)

    # ── 결과 조립 ──
    yearly_summary = sorted(
        [{"year": y, "count": yearly_count[y], "avgPrice": round(yearly_price_sum[y] / yearly_count[y] / 10000, 2)} for y in yearly_count],
        key=lambda x: x["year"],
    )
    monthly_summary = sorted(
        [{"month": m, "count": monthly_count[m], "avgPrice": round(monthly_price_sum[m] / monthly_count[m] / 10000, 2)} for m in monthly_count],
        key=lambda x: x["month"],
    )
    gu_summary = sorted(
        [{"gu": g, "count": gu_count[g], "avgPrice": round(gu_price_sum[g] / gu_count[g] / 10000, 2)} for g in gu_count],
        key=lambda x: x["avgPrice"], reverse=True,
    )
    all_gus = sorted(gu_count.keys())
    all_years = sorted(yearly_count.keys())
    heatmap_data = []
    for y in all_years:
        rd = {"year": y}
        for g in all_gus:
            cnt = yearly_gu_count[y].get(g, 0)
            rd[g] = round(yearly_gu_price_sum[y].get(g, 0) / cnt / 10000, 2) if cnt > 0 else None
        heatmap_data.append(rd)
    top5_gus = [item["gu"] for item in gu_summary[:5]]

    def avg(lst):
        return round(sum(lst) / len(lst), 2) if lst else 0

    def median(lst):
        if not lst:
            return 0
        s = sorted(lst)
        n = len(s)
        return round(s[n // 2], 2) if n % 2 else round((s[n // 2 - 1] + s[n // 2]) / 2, 2)

    # 시간 파생변수 요약
    temporal = {
        "byMonth": [{"month": m, "avgPrice": avg(month_prices[m]), "medPrice": median(month_prices[m]), "count": len(month_prices[m])} for m in sorted(month_prices)],
        "byQuarter": [{"quarter": f"Q{q}", "avgPrice": avg(quarter_prices[q]), "count": len(quarter_prices[q])} for q in sorted(quarter_prices)],
        "byHalf": [{"half": f"{'상' if h == 1 else '하'}반기", "avgPrice": avg(half_prices[h]), "count": len(half_prices[h])} for h in sorted(half_prices)],
    }

    # 건물 파생변수 요약
    floor_seg_order = ["저층(~3층)", "중층(4~10층)", "고층(11~20층)", "초고층(21+층)"]
    area_seg_order = ["소형(~59㎡)", "국민평형(60~84㎡)", "중형(85~135㎡)", "대형(135+㎡)"]
    building = {
        "byAgeBin": sorted(
            [{"ageBin": f"{b}~{b+4}년", "avgPrice": avg(age_bins[b]), "medPrice": median(age_bins[b]), "count": len(age_bins[b])} for b in age_bins],
            key=lambda x: int(x["ageBin"].split("~")[0]),
        ),
        "rebuild": [
            {"label": "재건축 후보(30+년)", "avgPrice": avg(rebuild_prices["yes"]), "count": len(rebuild_prices["yes"])},
            {"label": "비해당(<30년)", "avgPrice": avg(rebuild_prices["no"]), "count": len(rebuild_prices["no"])},
        ],
        "byFloorSeg": [{"seg": s, "avgPrice": avg(floor_seg_prices[s]), "count": len(floor_seg_prices[s])} for s in floor_seg_order if s in floor_seg_prices],
        "byAreaSeg": [{"seg": s, "avgPrice": avg(area_seg_prices[s]), "count": len(area_seg_prices[s])} for s in area_seg_order if s in area_seg_prices],
    }

    # 교호작용 파생변수
    interaction = {
        "areaXFloor": area_x_floor_scatter[:5000],
        "areaAgeRatio": area_age_ratio_scatter[:5000],
        "parkingRatio": parking_ratio_scatter[:5000],
        "dongDensity": dong_density_scatter[:5000],
    }

    # 공간 파생변수
    gu_centers = []
    for g in all_gus:
        cd = gu_coord_data.get(g)
        if cd and cd["lons"]:
            gu_centers.append({
                "gu": g,
                "lon": round(sum(cd["lons"]) / len(cd["lons"]), 5),
                "lat": round(sum(cd["lats"]) / len(cd["lats"]), 5),
                "avgPrice": round(sum(cd["prices"]) / len(cd["prices"]), 2),
                "count": len(cd["prices"]),
            })

    spatial = {
        "distGangnam": dist_gangnam_scatter[:5000],
        "distCityhall": dist_cityhall_scatter[:5000],
        "distYeouido": dist_yeouido_scatter[:5000],
        "minDistJob": min_dist_scatter[:5000],
        "guCenters": gu_centers,
    }

    # 가격 분포 히스토그램 (원본 만원 + log1p) — pure Python
    def make_histogram(values, n_bins=40):
        if not values:
            return []
        lo, hi = min(values), max(values)
        step = (hi - lo) / n_bins
        if step == 0:
            return [{"bin": f"{lo:.1f}", "count": len(values)}]
        counts = [0] * n_bins
        for v in values:
            idx = min(int((v - lo) / step), n_bins - 1)
            counts[idx] += 1
        return [{"binStart": round(lo + i * step, 2), "binEnd": round(lo + (i + 1) * step, 2), "count": counts[i]} for i in range(n_bins) if counts[i] > 0]

    raw_capped = [min(p, 500000) for p in all_prices_raw]
    log_prices = [math.log1p(p) for p in all_prices_raw]
    raw_hist = make_histogram(raw_capped, 40)
    log_hist = make_histogram(log_prices, 40)
    for h in raw_hist:
        h["bin"] = f"{int(h['binStart'] / 10000)}~{int(h['binEnd'] / 10000)}억"
    for h in log_hist:
        h["bin"] = f"{h['binStart']:.1f}~{h['binEnd']:.1f}"

    n = len(all_prices_raw)
    raw_mean = sum(all_prices_raw) / n
    log_mean = sum(log_prices) / n
    raw_std = (sum((p - raw_mean) ** 2 for p in all_prices_raw) / n) ** 0.5
    log_std = (sum((p - log_mean) ** 2 for p in log_prices) / n) ** 0.5
    raw_skew = round(sum((p - raw_mean) ** 3 for p in all_prices_raw) / n / (raw_std ** 3), 2) if raw_std > 0 else 0
    log_skew = round(sum((p - log_mean) ** 3 for p in log_prices) / n / (log_std ** 3), 2) if log_std > 0 else 0

    price_dist = {
        "raw": [{"bin": h["bin"], "count": h["count"]} for h in raw_hist],
        "log": [{"bin": h["bin"], "count": h["count"]} for h in log_hist],
        "rawSkew": raw_skew,
        "logSkew": log_skew,
    }

    result = {
        "totalRows": total_rows,
        "yearlySummary": yearly_summary,
        "monthlySummary": monthly_summary,
        "guSummary": gu_summary,
        "areaVsPrice": area_prices[:5000],
        "buildingAgeVsPrice": building_age_prices[:5000],
        "floorVsPrice": floor_prices_scatter[:5000],
        "heatmapData": heatmap_data,
        "allGus": all_gus,
        "top5Gus": top5_gus,
        "temporal": temporal,
        "building": building,
        "interaction": interaction,
        "spatial": spatial,
        "priceDist": price_dist,
    }

    out_path = os.path.join(OUT_DIR, "summary.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)

    print(f"✅ 전처리 완료: {total_rows:,}건 → {out_path}")
    print(f"   연도: {all_years[0]}~{all_years[-1]}, 구: {len(all_gus)}개")
    sz = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   JSON 크기: {sz:.1f}MB")


if __name__ == "__main__":
    main()
