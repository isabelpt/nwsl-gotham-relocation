"""
r5py isochrone + tract-travel-time build for the 9 current-NWSL venues outside the 5 metros
already covered (Gotham, KC Current, San Diego Wave, Seattle Reign, Washington Spirit).

Unlike 02_isochrones_comparison_cities.py (which computes isochrones from an old/new stadium
PAIR for a relocation), these 9 teams haven't relocated, so only one origin per metro, straight from
stadium_accessibility.csv. Same isochrone method otherwise (r5py.Isochrones + TravelTimeMatrix,
30/45/60-min TRANSIT+WALK, speed_walking=5.0 km/h per the walking-speed correction in 06/02).

Standalone process per metro (like 02), so all 9 can build in parallel. 

Usage:
    python3 08_isochrones_new_venues.py <metro_key>

<metro_key> must be one of the keys in METROS below.
"""
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
SPEED_WALKING_KMH = 5.0  # fixed because default is slowwww

# stadium_id/lat/lon pulled from stadium_accessibility.csv (nwsl_transportation)
METROS = {
    "san_jose": {
        "osm": "san-jose-metro.osm.pbf",
        "gtfs": ["vta.zip", "caltrain.zip"],
        "team": "Bay FC",
        "stadium_id": "Vj58W84M8n",
        "name": "PayPal Park",
        "lat": 37.3514, "lon": -121.925,
        "tracts": ["tl_2023_06_tract.zip"],
        "bbox": (-122.15, 37.10, -121.70, 37.55),
    },
    "los_angeles": {
        "osm": "los-angeles-metro.osm.pbf",
        "gtfs": ["lametro_bus.zip"],
        "team": "Angel City FC",
        "stadium_id": "7vQ7xbOMD1",
        "name": "BMO Stadium",
        "lat": 34.013, "lon": -118.285,
        "tracts": ["tl_2023_06_tract.zip"],
        "bbox": (-118.55, 33.85, -118.05, 34.25),
    },
    "houston": {
        "osm": "houston-metro.osm.pbf",
        "gtfs": ["houston_metro.zip"],
        "team": "Houston Dash",
        "stadium_id": "0x5g6ojM7O",
        "name": "Shell Energy Stadium",
        "lat": 29.7522, "lon": -95.3524,
        "tracts": ["tl_2023_48_tract.zip"],
        "bbox": (-95.65, 29.55, -95.05, 29.95),
    },
    "chicago": {
        "osm": "chicago-metro.osm.pbf",
        "gtfs": ["cta.zip", "metra.zip"],
        "team": "Chicago Stars FC",
        "stadium_id": "KXMe8lXQ64",
        "name": "Northwestern Medicine Field at Martin Stadium",
        "lat": 42.0620, "lon": -87.6930,
        "tracts": ["tl_2023_17_tract.zip"],
        "bbox": (-87.95, 41.85, -87.45, 42.25),
    },
    "portland": {
        "osm": "portland-metro.osm.pbf",
        "gtfs": ["trimet.zip"],
        "team": "Portland Thorns FC",
        "stadium_id": "p6qbX06M0G",
        "name": "Providence Park",
        "lat": 45.5214, "lon": -122.6917,
        "tracts": ["tl_2023_41_tract.zip"],
        "bbox": (-122.95, 45.30, -122.40, 45.70),
    },
    "orlando": {
        "osm": "orlando-metro.osm.pbf",
        "gtfs": ["lynx.zip"],
        "team": "Orlando Pride",
        "stadium_id": "vzqoJrj5ap",
        "name": "Inter&Co Stadium",
        "lat": 28.5411, "lon": -81.3893,
        "tracts": ["tl_2023_12_tract.zip"],
        "bbox": (-81.65, 28.30, -81.10, 28.70),
    },
    "salt_lake": {
        "osm": "salt-lake-metro.osm.pbf",
        "gtfs": ["uta.zip"],
        "team": "Utah Royals FC",
        "stadium_id": "e7MzlRjqr0",
        "name": "America First Field",
        "lat": 40.5829, "lon": -111.8932,
        "tracts": ["tl_2023_49_tract.zip"],
        "bbox": (-112.10, 40.40, -111.70, 40.80),
    },
    "louisville": {
        "osm": "louisville-metro.osm.pbf",
        "gtfs": ["tarc.zip"],
        "team": "Racing Louisville FC",
        "stadium_id": "BLMvra8Mxe",
        "name": "Lynn Family Stadium",
        "lat": 38.2503, "lon": -85.7034,
        "tracts": ["tl_2023_21_tract.zip"],
        "bbox": (-85.95, 38.05, -85.45, 38.45),
    },
    "raleigh_cary": {
        "osm": "raleigh-cary-metro.osm.pbf",
        "gtfs": ["gotriangle.zip"],
        "team": "North Carolina Courage",
        "stadium_id": "gpMOrLOQzy",
        "name": "WakeMed Soccer Park",
        "lat": 35.78686, "lon": -78.7549887,
        "tracts": ["tl_2023_37_tract.zip"],
        "bbox": (-78.95, 35.65, -78.55, 36.05),
    },
}


def main(metro_key):
    cfg = METROS[metro_key]
    log_prefix = f"[{metro_key}]"

    osm_pbf = os.path.join(OSM_DIR, cfg["osm"])
    gtfs_feeds = [os.path.join(GTFS_DIR, f) for f in cfg["gtfs"]]
    missing = [f for f in gtfs_feeds if not os.path.exists(f)] + ([osm_pbf] if not os.path.exists(osm_pbf) else [])
    if missing:
        raise FileNotFoundError(f"{log_prefix} missing inputs, run 07_gtfs_pull_new_venues.ipynb first: {missing}")

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

    origin = gpd.GeoDataFrame(
        [{"id": cfg["stadium_id"], "name": cfg["name"], "team": cfg["team"]}],
        geometry=gpd.points_from_xy([cfg["lon"]], [cfg["lat"]]),
        crs="EPSG:4326",
    ).iloc[0]
    print(f"{log_prefix} Origin: {origin['name']} ({origin['team']})")

    # Isochromes
    print(f"{log_prefix} Computing isochrones for {origin['name']}...")
    isochrones = r5py.Isochrones(
        transport_network,
        origins=origin.geometry,
        isochrones=ISOCHRONE_THRESHOLDS,
        point_grid_resolution=250,
        transport_modes=[r5py.TransportMode.TRANSIT],
        access_modes=[r5py.TransportMode.WALK],
        egress_modes=[r5py.TransportMode.WALK],
        departure=departure, speed_walking=SPEED_WALKING_KMH,
    )
    isochrones["site_label"] = origin["id"]
    isochrones["site_name"] = origin["name"]
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

    utm_crs = tracts.estimate_utm_crs()
    tract_centroids = tracts.copy()
    tract_centroids["geometry"] = tract_centroids.geometry.to_crs(utm_crs).centroid.to_crs("EPSG:4326")
    destinations = tract_centroids[["GEOID", "geometry"]].rename(columns={"GEOID": "id"})
    destinations["id"] = destinations["id"].astype(str)

    print(f"{log_prefix} Computing travel times from {origin['name']} to {len(destinations)} tract centroids...")
    origin_gdf = gpd.GeoDataFrame([{"id": origin["id"]}], geometry=[origin.geometry], crs="EPSG:4326")
    travel_times = r5py.TravelTimeMatrix(
        transport_network,
        origins=origin_gdf,
        destinations=destinations,
        transport_modes=[r5py.TransportMode.TRANSIT],
        access_modes=[r5py.TransportMode.WALK],
        egress_modes=[r5py.TransportMode.WALK],
        departure=departure, speed_walking=SPEED_WALKING_KMH,
    )
    travel_times["site_label"] = origin["id"]
    travel_times["site_name"] = origin["name"]
    travel_times = travel_times.rename(columns={"to_id": "GEOID", "travel_time": "travel_time_minutes"})
    travel_times["GEOID"] = travel_times["GEOID"].astype(str)
    tt_path = os.path.join(DATA_PROCESSED_DIR, f"{metro_key}_tract_travel_times.csv")
    travel_times.to_csv(tt_path, index=False)
    print(f"{log_prefix} Saved {len(travel_times)} origin-tract travel times to {tt_path}")

    n_unreachable = travel_times["travel_time_minutes"].isna().sum()
    print(f"{log_prefix} Unreachable within max routing window: {n_unreachable} / {len(travel_times)}")
    print(f"{log_prefix} DONE")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in METROS:
        print(f"Usage: python3 08_isochrones_new_venues.py <metro_key>")
        print(f"metro_key must be one of: {list(METROS)}")
        sys.exit(1)
    main(sys.argv[1])
