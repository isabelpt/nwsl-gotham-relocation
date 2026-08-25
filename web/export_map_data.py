"""
Build the static GeoJSON/JSON files the interactive isochrone map (web/) reads at runtime.

Not part of code/'s main sequence -- this is a one-off export step, run whenever the
underlying isochrone/travel-time data changes (currently after the speed_walking=5.0 fix in
../code/16_nyc_isochrones_90min.py). No modeling happens here, just reshaping already-computed
data for a browser to render cheaply.

Reads:
    ../data/processed/nyc_tract_travel_times_90min.csv
    ../data/processed/transit_lines.geojson
    ../../nwsl_transportation/data/raw/census/tl_2023_{36,34}_tract.zip
    ../../nwsl_transportation/data/raw/census/acs_population_by_tract.csv
    ../output/tract_clusters_weighted.csv  -- from code/supplementary/08_tract_clustering.ipynb (decay-weighted
        headline clustering, not either single-threshold robustness check)
    ../data/raw/census/nyc_nta_2020.geojson  -- NYC's Neighborhood Tabulation Areas (free NYC
        Open Data, no key: https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson). NYC-only
        geography -- NJ tracts (Harrison/Newark, around Red Bull Arena) get no neighborhood
        name, since no equivalent standard source exists for NJ at this scope.
Writes:
    public/data/tracts.geojson   -- one polygon per tract, RBA/Etihad travel times + population
        + cluster id/name (where 08 assigned one -- tracts outside its analysis stay unclustered)
        + neighborhood name (NYC tracts only, via NTA point-in-polygon on the tract centroid)
    public/data/transit_lines.geojson  -- copied through unchanged (already clean)
    public/data/stats.json       -- reachable population by site/threshold, for the stat panel
    public/data/clusters.json    -- cluster id -> name/color/summary stats, for the legend

Usage: python3 export_map_data.py
"""
import json
import os
import shutil

import geopandas as gpd
import pandas as pd

NTA_PATH = os.path.join("..", "data", "raw", "census", "nyc_nta_2020.geojson")

DATA_PROCESSED = os.path.join("..", "data", "processed")
TRANSPORTATION_CENSUS = os.path.join("..", "..", "nwsl_transportation", "data", "raw", "census")
OUTPUT_DIR = os.path.join("..", "output")
OUT_DIR = os.path.join("public", "data")

MAP_BOUNDS = (-74.35, 40.60, -73.65, 40.90)
# Simplify tract boundaries for the web -- Census TIGER geometry is far more detailed than a
# browser needs at this zoom level, and it's the biggest file by far.
SIMPLIFY_TOLERANCE_DEG = 0.0002

# Same 4-color qualitative palette as plot_theme.NWSL_PALETTE, first 4 entries -- matches
# code/supplementary/08_tract_clustering.ipynb's cluster colors exactly so the web map and the static figure agree.
CLUSTER_COLORS = ["#4B2E83", "#00A398", "#E34948", "#F2A93B"]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print("Loading tract shapefiles (NY + NJ)...")
    tract_frames = []
    for zip_name in ["tl_2023_36_tract.zip", "tl_2023_34_tract.zip"]:
        zip_path = os.path.join(TRANSPORTATION_CENSUS, zip_name)
        tract_frames.append(gpd.read_file(f"zip://{zip_path}"))
    tracts = pd.concat(tract_frames, ignore_index=True)
    tracts = gpd.GeoDataFrame(tracts, crs=tract_frames[0].crs).to_crs("EPSG:4326")
    tracts = tracts.cx[MAP_BOUNDS[0]:MAP_BOUNDS[2], MAP_BOUNDS[1]:MAP_BOUNDS[3]]
    tracts["GEOID"] = tracts["GEOID"].astype(str)
    print(f"{len(tracts)} tracts within the metro bbox")

    print("Joining travel times (Red Bull Arena, Etihad Park)...")
    tt = pd.read_csv(os.path.join(DATA_PROCESSED, "nyc_tract_travel_times_90min.csv"), dtype={"GEOID": str})
    tt = tt[tt["site_label"].isin(["current", "future"])]
    rba = tt[tt["site_label"] == "current"][["GEOID", "travel_time_minutes"]].rename(
        columns={"travel_time_minutes": "rba_minutes"}
    )
    etihad = tt[tt["site_label"] == "future"][["GEOID", "travel_time_minutes"]].rename(
        columns={"travel_time_minutes": "etihad_minutes"}
    )

    acs = pd.read_csv(os.path.join(TRANSPORTATION_CENSUS, "acs_population_by_tract.csv"), dtype=str)
    acs["GEOID"] = acs["state"].str.zfill(2) + acs["county"].str.zfill(3) + acs["tract"].str.zfill(6)
    acs["population"] = acs["population"].astype(float)

    merged = tracts[["GEOID", "geometry"]].merge(rba, on="GEOID", how="left")
    merged = merged.merge(etihad, on="GEOID", how="left")
    merged = merged.merge(acs[["GEOID", "population"]], on="GEOID", how="left")
    merged["population"] = merged["population"].fillna(0)

    print("Joining NYC neighborhood names (NTA point-in-polygon on tract centroids)...")
    nta = gpd.read_file(NTA_PATH)[["ntaname", "geometry"]].to_crs("EPSG:4326")
    utm_crs = merged.estimate_utm_crs()
    centroids = gpd.GeoDataFrame(
        merged[["GEOID"]], geometry=merged.geometry.to_crs(utm_crs).centroid.to_crs("EPSG:4326")
    )
    matched = gpd.sjoin(centroids, nta, how="left", predicate="within")[["GEOID", "ntaname"]]
    matched = matched.drop_duplicates(subset="GEOID")  # a centroid on a shared boundary can match twice
    merged = merged.merge(matched.rename(columns={"ntaname": "neighborhood"}), on="GEOID", how="left")
    print(f"{merged['neighborhood'].notna().sum()} of {len(merged)} tracts matched a neighborhood (NY side only)")

    print("Joining demographic clusters (code/supplementary/08_tract_clustering.ipynb, decay-weighted)...")
    clusters = pd.read_csv(
        os.path.join(OUTPUT_DIR, "tract_clusters_weighted.csv"), dtype={"GEOID": str}
    )
    merged = merged.merge(
        clusters[["GEOID", "cluster", "cluster_name", "delta_transit_time"]], on="GEOID", how="left"
    )
    # NaN, not -1: JSON null round-trips cleanly through geojson -> maplibre's ["get", ...],
    # unlike a sentinel int that would need to be excluded from every color/legend expression.
    print(f"{merged['cluster'].notna().sum()} of {len(merged)} tracts have a cluster assignment")

    print(f"Simplifying geometry (tolerance={SIMPLIFY_TOLERANCE_DEG} deg)...")
    merged["geometry"] = merged.geometry.simplify(SIMPLIFY_TOLERANCE_DEG, preserve_topology=True)

    tracts_path = os.path.join(OUT_DIR, "tracts.geojson")
    merged.to_file(tracts_path, driver="GeoJSON")
    print(f"Saved {len(merged)} tracts to {tracts_path} ({os.path.getsize(tracts_path) / 1024:.0f} KB)")

    print("Copying transit lines...")
    transit_src = os.path.join(DATA_PROCESSED, "transit_lines.geojson")
    transit_dst = os.path.join(OUT_DIR, "transit_lines.geojson")
    shutil.copyfile(transit_src, transit_dst)
    print(f"Copied to {transit_dst} ({os.path.getsize(transit_dst) / 1024:.0f} KB)")

    print("Computing reachable-population stats...")
    THRESHOLDS = [30, 45, 60, 90]
    stats = {"current": {"name": "Red Bull Arena"}, "future": {"name": "Etihad Park"}}
    for label, col in [("current", "rba_minutes"), ("future", "etihad_minutes")]:
        by_thresh = {}
        for t in THRESHOLDS:
            reachable = merged[merged[col] <= t]
            by_thresh[str(t)] = {
                "reachable_tracts": int(len(reachable)),
                "reachable_population": float(reachable["population"].sum()),
            }
        stats[label]["by_threshold"] = by_thresh

    stats_path = os.path.join(OUT_DIR, "stats.json")
    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2)
    print(f"Saved stats to {stats_path}")

    print("Building cluster legend...")
    cluster_info = []
    for cid in sorted(clusters["cluster"].unique()):
        sub = clusters[clusters["cluster"] == cid]
        cluster_info.append({
            "id": int(cid),
            "name": sub["cluster_name"].iloc[0],
            "color": CLUSTER_COLORS[int(cid) % len(CLUSTER_COLORS)],
            "n_tracts": int(len(sub)),
            "population": float(sub["population"].sum()),
            "median_household_income": float(sub["median_household_income"].median()),
            # delta_transit_time is future minus current (negative = faster after the move).
            "avg_delta_transit_min": float(sub["delta_transit_time"].mean()),
            "pct_gaining_access": float((sub["delta_transit_time"] < 0).mean()),
        })
    clusters_path = os.path.join(OUT_DIR, "clusters.json")
    with open(clusters_path, "w") as f:
        json.dump(cluster_info, f, indent=2)
    print(f"Saved {len(cluster_info)} clusters to {clusters_path}")

    print("DONE")


if __name__ == "__main__":
    main()
