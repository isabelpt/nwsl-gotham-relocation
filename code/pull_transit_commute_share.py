"""
Transit-dependence covariate: what share of each stadium's home CITY commutes by public transit
vs. walking, from ACS 5-year table B08301 (means of transportation to work), at the Census
"place" (incorporated city) level -- NOT the stadium's own tract-level isochrone catchment,
deliberately, since the whole point is to measure how transit-oriented that city's culture
already is, independent of any one site's own transit access.

Addresses a real gap: `metro_size` (transit+walk-reachable population) treats a person reached
in car-dependent Houston the same as one reached in transit-dependent NYC, when the same raw
count means something different in each. This doesn't fix that by itself, but gives the model a
covariate to at least partially separate "how big is the reachable market" from "how
transit-culture-dependent is this market."

Requires CENSUS_API_KEY (same one already used elsewhere in this pipeline).

Usage:
    python3 pull_transit_commute_share.py
"""
import os
import time

import pandas as pd
import requests

CENSUS_DIR = os.path.join("..", "data", "raw", "census")
CENSUS_API_KEY = os.environ.get("CENSUS_API_KEY")

# Each current venue's home city, and the Census "place" name substring to match against.
# 3 venues have no city in stadium_accessibility.csv at all (never geocoded, same 2 that were
# missing lat/lon for the weather pull, plus CPKC Stadium) -- filled in manually from public info.
VENUE_CITY = {
    "Vj58W84M8n": ("CA", "San Jose city"),          # PayPal Park, Bay FC
    "0x5g6ojM7O": ("TX", "Houston city"),           # Shell Energy Stadium, Houston Dash
    "xW5p3L0Mg1": ("MO", "Kansas City city"),       # CPKC Stadium, Kansas City Current (manual: no city in source)
    "Oa5wKXY514": ("CA", "San Diego city"),         # Snapdragon Stadium, San Diego Wave (manual: no city in source)
    "9Yqda07QvJ": ("WA", "Seattle city"),           # Lumen Field, Seattle Reign
    "KXMe8lXQ64": ("IL", "Evanston city"),          # Northwestern Stadium, Chicago Stars FC (manual: no city in source)
    "p6qbX06M0G": ("OR", "Portland city"),          # Providence Park, Portland Thorns
    "vzqoJrj5ap": ("FL", "Orlando city"),           # Inter&Co Stadium, Orlando Pride
    "xW5pwORMg1": ("DC", "Washington city"),        # Audi Field, Washington Spirit
    "e7MzlRjqr0": ("UT", "Sandy city"),             # America First Field, Utah Royals FC
    "BLMvra8Mxe": ("KY", "Louisville"),             # Lynn Family Stadium, Racing Louisville FC (metro gov't, not "city")
    "7vQ7xbOMD1": ("CA", "Los Angeles city"),       # BMO Stadium, Angel City FC
    "NWMW84L5lz": ("NJ", "Harrison town"),          # Sports Illustrated Stadium, NJ/NY Gotham FC
    "gpMOrLOQzy": ("NC", "Cary town"),              # WakeMed Soccer Park, North Carolina Courage
}
STATE_FIPS = {
    "CA": "06", "TX": "48", "MO": "29", "WA": "53", "IL": "17", "OR": "41", "FL": "12",
    "DC": "11", "UT": "49", "KY": "21", "NJ": "34", "NC": "37",
}

out_path = os.path.join(CENSUS_DIR, "acs_transit_commute_by_place.csv")

if not CENSUS_API_KEY:
    raise SystemExit("No CENSUS_API_KEY found in the environment.")

needed_states = sorted({abbr for abbr, _ in VENUE_CITY.values()})
place_frames = {}
for abbr in needed_states:
    fips = STATE_FIPS[abbr]
    url = (
        "https://api.census.gov/data/2023/acs/acs5"
        f"?get=NAME,B08301_001E,B08301_010E,B08301_019E&for=place:*&in=state:{fips}&key={CENSUS_API_KEY}"
    )
    for attempt in range(1, 4):
        try:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            rows = resp.json()
            break
        except (requests.exceptions.RequestException, ValueError) as e:
            print(f"    {abbr} attempt {attempt}/3 failed ({e}); status={getattr(resp, 'status_code', '?')} "
                  f"body[:200]={getattr(resp, 'text', '')[:200]!r}, retrying...")
            if attempt == 3:
                raise
            time.sleep(3 * attempt)
    pdf = pd.DataFrame(rows[1:], columns=rows[0])
    for col in ["B08301_001E", "B08301_010E", "B08301_019E"]:
        pdf[col] = pd.to_numeric(pdf[col], errors="coerce")
    place_frames[abbr] = pdf
    print(f"  {abbr}: {len(pdf)} places loaded")
    time.sleep(0.3)

rows = []
for stadium_id, (abbr, name_fragment) in VENUE_CITY.items():
    pdf = place_frames[abbr]
    match = pdf[pdf["NAME"].str.contains(name_fragment, case=False, na=False)]
    if match.empty:
        print(f"  WARNING: no place match for {stadium_id} ({name_fragment}, {abbr})")
        continue
    if len(match) > 1:
        # take the largest by total commuters -- avoids picking a same-named small CDP
        match = match.sort_values("B08301_001E", ascending=False)
    r = match.iloc[0]
    total, transit, walk = r["B08301_001E"], r["B08301_010E"], r["B08301_019E"]
    rows.append({
        "stadium_id": stadium_id, "place_name": r["NAME"],
        "pct_commute_transit": transit / total * 100 if total else None,
        "pct_commute_walk": walk / total * 100 if total else None,
    })
    print(f"  {stadium_id} -> {r['NAME']}: {transit / total * 100:.1f}% transit, {walk / total * 100:.1f}% walk")

out = pd.DataFrame(rows)
out.to_csv(out_path, index=False)
print(f"\nWrote {out_path} ({len(out)} venues)")
