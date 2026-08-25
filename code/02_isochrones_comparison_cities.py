"""
Build an r5py transit network for one metro and compute:
1. Isochrone boundaries (30/45/60 min transit+walk) from its old & new stadium
2. A travel-time matrix from each stadium to every Census tract centroid in
   the metro's states

Runs once per metro so the 4 metros can be built in parallel.

Usage:
    python3 02_isochrones_comparison_cities.py <metro_key>

<metro_key> must be one of the keys in METROS below.
"""
import glob
import os
import sys
from datetime import datetime, timedelta

import geopandas as gpd
import pandas as pd
import r5py

DATA_PROCESSED_DIR = os.path.join("..", "data", "processed")
GTFS_DIR = os.path.join("..", "data", "raw", "gtfs")
OSM_DIR = os.path.join("..", "data", "raw", "osm")
CENSUS_DIR = os.path.join("..", "data", "raw", "census")

ISOCHRONE_THRESHOLDS = [30, 45, 60]  # minutes

# r5py's default speed_walking is 3.6 km/h (~2.2 mph), so adjusted to a ~5 km/h real-
# world walking pace, before this the isochromes in nyc were far underestimated
SPEED_WALKING_KMH = 5.0

# Each metro: OSM extract, GTFS feed filenames (subset relevant to that metro,
# not the whole data/raw/gtfs/*.zip glob), team name (matches
# comparison_relocation_stadiums.csv), tract shapefiles (state FIPS zips -> these
# are state-wide, not metro-scoped, so they're filtered down to `bbox` below),
METROS = {
    "kansas_city": {
        "osm": "kansas-city-metro.osm.pbf",
        "gtfs": ["kcata.zip"],
        "team": "Kansas City Current",
        "tracts": ["tl_2023_29_tract.zip", "tl_2023_20_tract.zip"],
        "bbox": (-95.10, 38.90, -94.30, 39.35),
    },
    "san_diego": {
        "osm": "san-diego-metro.osm.pbf",
        "gtfs": ["sdmts.zip"],
        "team": "San Diego Wave FC",
        "tracts": ["tl_2023_06_tract.zip"],
        "bbox": (-117.35, 32.60, -116.90, 33.00),
    },
    "seattle_tacoma": {
        "osm": "seattle-tacoma-metro.osm.pbf",
        "gtfs": ["king_county_metro.zip", "sound_transit_rail.zip", "pierce_transit.zip"],
        "team": "Seattle Reign FC",
        "tracts": ["tl_2023_53_tract.zip"],
        "bbox": (-122.65, 47.05, -122.15, 47.75),
    },
    "dc": {
        "osm": "dc-metro.osm.pbf",
        "gtfs": ["wmata_bus.zip", "wmata_rail.zip"],
        "team": "Washington Spirit",
        "tracts": ["tl_2023_24_tract.zip", "tl_2023_11_tract.zip"],
        "bbox": (-77.55, 38.65, -76.85, 39.35),
    },
}


def main(metro_key):
    cfg = METROS[metro_key]
    log_prefix = f"[{metro_key}]"

    osm_pbf = os.path.join(OSM_DIR, cfg["osm"])
    gtfs_feeds = [os.path.join(GTFS_DIR, f) for f in cfg["gtfs"]]
    missing = [f for f in gtfs_feeds if not os.path.exists(f)]
    if missing:
        raise FileNotFoundError(f"{log_prefix} missing GTFS feeds: {missing}")

    print(f"{log_prefix} OSM extract: {osm_pbf}")
    print(f"{log_prefix} GTFS feeds: {[os.path.basename(f) for f in gtfs_feeds]}")

    print(f"{log_prefix} Building transport network (slow step)...")
    transport_network = r5py.TransportNetwork(osm_pbf, gtfs_feeds, allow_errors=True)
    print(f"{log_prefix} Transport network built.")

    today = datetime.now()
    days_until_saturday = (5 - today.weekday()) % 7
    days_until_saturday = days_until_saturday if days_until_saturday > 0 else 7
    next_saturday = today + timedelta(days=days_until_saturday)
    departure = next_saturday.replace(hour=18, minute=0, second=0, microsecond=0)
    print(f"{log_prefix} Departure scenario: {departure.strftime('%A %Y-%m-%d %H:%M')}")

    relocation_stadiums = pd.read_csv(
        os.path.join(DATA_PROCESSED_DIR, "comparison_relocation_stadiums.csv")
    )
    team_stadiums = relocation_stadiums[relocation_stadiums["team"] == cfg["team"]]
    if len(team_stadiums) != 2:
        raise ValueError(
            f"{log_prefix} expected 2 stadiums (old/new) for {cfg['team']!r}, "
            f"found {len(team_stadiums)}"
        )

    origins = gpd.GeoDataFrame(
        team_stadiums,
        geometry=gpd.points_from_xy(team_stadiums["longitude"], team_stadiums["latitude"]),
        crs="EPSG:4326",
    )
    origins = origins.rename(columns={"stadium_id": "id"})
    print(f"{log_prefix} Origins:\n{origins[['id', 'label', 'name']]}")

    # Isochrones
    isochrone_frames = []
    for _, origin_row in origins.iterrows():
        print(f"{log_prefix} Computing isochrones for {origin_row['name']} ({origin_row['label']})...")
        iso = r5py.Isochrones(
            transport_network,
            origins=origin_row.geometry,
            isochrones=ISOCHRONE_THRESHOLDS,
            point_grid_resolution=250,
            transport_modes=[r5py.TransportMode.TRANSIT],
            access_modes=[r5py.TransportMode.WALK],
            egress_modes=[r5py.TransportMode.WALK],
            departure=departure, speed_walking=SPEED_WALKING_KMH,
        )
        iso["site_label"] = origin_row["label"]
        iso["site_name"] = origin_row["name"]
        isochrone_frames.append(iso)

    isochrones = gpd.GeoDataFrame(pd.concat(isochrone_frames, ignore_index=True), crs=isochrone_frames[0].crs)
    isochrones["travel_time_minutes"] = isochrones["travel_time"].dt.total_seconds() / 60
    isochrones = isochrones.drop(columns=["travel_time"])
    iso_path = os.path.join(DATA_PROCESSED_DIR, f"{metro_key}_isochrones.geojson")
    isochrones.to_file(iso_path, driver="GeoJSON")
    print(f"{log_prefix} Saved {len(isochrones)} isochrone boundary lines to {iso_path}")

    # Travel-time matrix to every tract centroid
    tract_frames = []
    for zip_name in cfg["tracts"]:
        zip_path = os.path.join(CENSUS_DIR, zip_name)
        tracts = gpd.read_file(f"zip://{zip_path}")
        tract_frames.append(tracts)
    tracts = pd.concat(tract_frames, ignore_index=True)
    tracts = gpd.GeoDataFrame(tracts, crs=tract_frames[0].crs).to_crs("EPSG:4326")
    print(f"{log_prefix} Loaded {len(tracts)} tracts (state-wide)")

    min_lon, min_lat, max_lon, max_lat = cfg["bbox"]
    tracts = tracts.cx[min_lon:max_lon, min_lat:max_lat]
    print(f"{log_prefix} {len(tracts)} tracts fall within the metro bbox (network coverage)")

    # Centroids computed in a projected (metric) CRS -> use each origin's local
    # UTM zone rather than a hardcoded one, since metros span different zones.
    utm_crs = tracts.estimate_utm_crs()
    tract_centroids = tracts.copy()
    tract_centroids["geometry"] = tract_centroids.geometry.to_crs(utm_crs).centroid.to_crs("EPSG:4326")
    destinations = tract_centroids[["GEOID", "geometry"]].rename(columns={"GEOID": "id"})
    destinations["id"] = destinations["id"].astype(str)

    matrix_frames = []
    for _, origin_row in origins.iterrows():
        print(f"{log_prefix} Computing travel times from {origin_row['name']} to {len(destinations)} tract centroids...")
        origin_gdf = gpd.GeoDataFrame(
            [{"id": origin_row["id"]}], geometry=[origin_row.geometry], crs="EPSG:4326"
        )
        matrix = r5py.TravelTimeMatrix(
            transport_network,
            origins=origin_gdf,
            destinations=destinations,
            transport_modes=[r5py.TransportMode.TRANSIT],
            access_modes=[r5py.TransportMode.WALK],
            egress_modes=[r5py.TransportMode.WALK],
            departure=departure, speed_walking=SPEED_WALKING_KMH,
        )
        matrix["site_label"] = origin_row["label"]
        matrix["site_name"] = origin_row["name"]
        matrix_frames.append(matrix)

    travel_times = pd.concat(matrix_frames, ignore_index=True)
    travel_times = travel_times.rename(columns={"to_id": "GEOID", "travel_time": "travel_time_minutes"})
    travel_times["GEOID"] = travel_times["GEOID"].astype(str)
    tt_path = os.path.join(DATA_PROCESSED_DIR, f"{metro_key}_tract_travel_times.csv")
    travel_times.to_csv(tt_path, index=False)
    print(f"{log_prefix} Saved {len(travel_times)} origin-tract travel times to {tt_path}")

    n_unreachable = travel_times["travel_time_minutes"].isna().groupby(travel_times["site_label"]).sum()
    print(f"{log_prefix} Unreachable within max routing window, by site:\n{n_unreachable}")
    print(f"{log_prefix} DONE")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in METROS:
        print(f"Usage: python3 02_isochrones_comparison_cities.py <metro_key>")
        print(f"metro_key must be one of: {list(METROS)}")
        sys.exit(1)
    main(sys.argv[1])
