"""
Three consolidated summary tables that back up claims currently made only in
README prose, built entirely from data this project already produced -- no
new modeling. Not part of the numbered 01-13 pipeline (nothing here computes
anything; it just joins/reshapes existing outputs), so it's a plain script,
not a notebook, and isn't renumbered into the main sequence.

Outputs (all to ../output/, csv only):
  1. accessibility_gain_by_relocation.csv -- reachable pop/tracts, old venue
     vs. new, for all 5 relocations (Gotham + 4 comparison cities)
  2. synthetic_control_comparables.csv    -- the 3 comparable teams' own
     pre/post move attendance change that `05`'s lift scenarios are built from
  3. leakage_check_summary.csv            -- naive vs. team-grouped CV, side
     by side, across all three model families (linear, GBT, CatBoost)

Run from code/: python summary_tables.py
"""

import os

import numpy as np
import pandas as pd

DATA_PROCESSED_DIR = os.path.join("..", "data", "processed")
OUTPUT_DIR = os.path.join("..", "output")
NWSL_PROJECT_PROCESSED = os.path.join("..", "..", "..", "QSS 20", "nwsl-project", "data", "processed")

THRESHOLD_MIN = 60


# ---------------------------------------------------------------------------
# Table 1: accessibility gain by relocation (all 5 relocations, 60-min reach)
# ---------------------------------------------------------------------------

def build_table1():
    # Gotham: computed in this project's own build (06), walk-speed-fixed.
    gotham_tt = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, "nyc_tract_travel_times_90min.csv"))
    gotham_pop = pd.read_csv(os.path.join(OUTPUT_DIR, "gotham_reachable_population.csv"))
    gotham_pop = gotham_pop[gotham_pop["threshold_min"] == THRESHOLD_MIN]

    def gotham_row():
        rows = {}
        for label in ["current", "future"]:
            sub = gotham_tt[gotham_tt["site_label"] == label]
            reach = sub[sub["travel_time_minutes"] <= THRESHOLD_MIN]
            pop_row = gotham_pop[gotham_pop["site_label"] == label]
            rows[label] = {
                "site_name": sub["site_name"].iloc[0],
                "reachable_tracts": reach["GEOID"].nunique(),
                "reachable_population": pop_row["reachable_population"].iloc[0],
            }
        return rows

    g = gotham_row()
    gotham_entry = {
        "team": "NJ/NY Gotham FC",
        "old_venue": g["current"]["site_name"],
        "new_venue": g["future"]["site_name"],
        "old_reachable_tracts": g["current"]["reachable_tracts"],
        "new_reachable_tracts": g["future"]["reachable_tracts"],
        "old_reachable_population": g["current"]["reachable_population"],
        "new_reachable_population": g["future"]["reachable_population"],
    }

    # Comparison cities: per-metro tract_travel_times files (rebuilt with the
    # walk-speed fix, per README) for tract counts; comparison_cities_reachable_demographics.csv
    # (same 60-min threshold, confirmed in 03) for population.
    metro_files = {
        "Kansas City Current": "kansas_city_tract_travel_times.csv",
        "San Diego Wave FC": "san_diego_tract_travel_times.csv",
        "Seattle Reign FC": "seattle_tacoma_tract_travel_times.csv",
        "Washington Spirit": "dc_tract_travel_times.csv",
    }
    demo = pd.read_csv(os.path.join(OUTPUT_DIR, "comparison_cities_reachable_demographics.csv"))

    rows = [gotham_entry]
    for team, fname in metro_files.items():
        tt = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, fname))
        entry = {"team": team}
        for key in ["old", "new"]:
            sub = tt[tt["site_label"] == key]
            reach = sub[sub["travel_time_minutes"] <= THRESHOLD_MIN]
            entry[f"{key}_venue"] = sub["site_name"].iloc[0]
            entry[f"{key}_reachable_tracts"] = reach["GEOID"].nunique()
            entry[f"{key}_reachable_population"] = demo.loc[
                (demo["team"] == team) & (demo["site_label"] == key), "reachable_population"
            ].iloc[0]
        rows.append(entry)

    df = pd.DataFrame(rows)
    df["pct_change_population"] = (
        (df["new_reachable_population"] / df["old_reachable_population"]) - 1
    ) * 100
    df["pct_change_tracts"] = (
        (df["new_reachable_tracts"] / df["old_reachable_tracts"]) - 1
    ) * 100
    df = df[[
        "team", "old_venue", "new_venue",
        "old_reachable_tracts", "new_reachable_tracts", "pct_change_tracts",
        "old_reachable_population", "new_reachable_population", "pct_change_population",
    ]]
    df.to_csv(os.path.join(OUTPUT_DIR, "accessibility_gain_by_relocation.csv"), index=False)
    print(df.to_string(index=False))
    return df


# ---------------------------------------------------------------------------
# Table 2: synthetic-control comparables (the 3 teams `05`'s scenarios are
# built from -- reproduces 05's lift_df, which was printed but never saved)
# ---------------------------------------------------------------------------

def build_table2():
    games = pd.read_csv(os.path.join(NWSL_PROJECT_PROCESSED, "games_clean.csv"))
    teams = pd.read_csv(os.path.join(NWSL_PROJECT_PROCESSED, "teams_clean.csv"))
    nwsl_games = games[games["league"] == "nwsl"].dropna(subset=["attendance"])
    nwsl_games = nwsl_games[nwsl_games["attendance"] > 0]
    nwsl_games = nwsl_games.merge(teams[["team_id", "team_name"]], left_on="home_team_id", right_on="team_id")

    COVID_SEASONS = [2020, 2021]
    nwsl_games = nwsl_games[~nwsl_games["season_name"].isin(COVID_SEASONS)]

    MOVE_YEAR = {"San Diego Wave FC": 2023, "Seattle Reign FC": 2022, "Washington Spirit": 2021}
    SCENARIO = {
        "San Diego Wave FC": "low",
        "Seattle Reign FC": "capacity_cap",
        "Washington Spirit": "capacity_cap (unused, rounds same as Seattle)",
    }

    rows = []
    for team, move_year in MOVE_YEAR.items():
        pre = nwsl_games[(nwsl_games["team_name"] == team) & (nwsl_games["year"] < move_year)]["attendance"]
        post = nwsl_games[(nwsl_games["team_name"] == team) & (nwsl_games["year"] >= move_year)]["attendance"]
        pct_lift = (post.mean() / pre.mean() - 1) * 100
        rows.append({
            "team": team,
            "move_year": move_year,
            "pre_move_avg_attendance": pre.mean(),
            "pre_move_n_games": len(pre),
            "post_move_avg_attendance": post.mean(),
            "post_move_n_games": len(post),
            "pct_lift": pct_lift,
            "used_as_scenario": SCENARIO[team],
        })

    # KC Current shown for context, excluded from scenarios (capacity-suppressed)
    kc_pre = nwsl_games[(nwsl_games["team_name"] == "Kansas City Current") & (nwsl_games["year"] < 2024)]["attendance"]
    kc_post = nwsl_games[(nwsl_games["team_name"] == "Kansas City Current") & (nwsl_games["year"] >= 2024)]["attendance"]
    rows.append({
        "team": "Kansas City Current",
        "move_year": 2024,
        "pre_move_avg_attendance": kc_pre.mean(),
        "pre_move_n_games": len(kc_pre),
        "post_move_avg_attendance": kc_post.mean(),
        "post_move_n_games": len(kc_post),
        "pct_lift": (kc_post.mean() / kc_pre.mean() - 1) * 100,
        "used_as_scenario": "excluded (capacity-suppressed: sells out every game)",
    })

    df = pd.DataFrame(rows).sort_values("pct_lift")
    df.to_csv(os.path.join(OUTPUT_DIR, "synthetic_control_comparables.csv"), index=False)
    print(df.to_string(index=False))
    return df


# ---------------------------------------------------------------------------
# Table 3: leakage-check summary across all three model families
# (numbers transcribed from 04's and 12's printed notebook output; no
# re-fitting here, since the point is to lay them side by side, not rerun
# them)
# ---------------------------------------------------------------------------

def build_table3():
    rows = [
        {"model": "Linear (baseline, 5 predictors)", "features": "ppg, market_size_log, new_stadium_flag, rivalry_flag, dist_miles",
         "naive_scheme": "row-shuffled 5-fold KFold", "naive_metric": "R^2", "naive_value": -0.018,
         "grouped_scheme": "-", "grouped_metric": "-", "grouped_value": np.nan, "source": "04"},
        {"model": "Linear (extended, +transit)", "features": "ppg, new_stadium_flag, rivalry_flag, catchment_pop_60min_100k",
         "naive_scheme": "row-shuffled 5-fold KFold", "naive_metric": "R^2", "naive_value": 0.156,
         "grouped_scheme": "GroupKFold (by team)", "grouped_metric": "R^2", "grouped_value": -2.258, "source": "04"},
        {"model": "GBT (extended, same features)", "features": "same as Linear extended",
         "naive_scheme": "row-shuffled 5-fold KFold", "naive_metric": "R^2", "naive_value": 0.512,
         "grouped_scheme": "GroupKFold (by team)", "grouped_metric": "R^2", "grouped_value": -1.875, "source": "04"},
        {"model": "CatBoost (full feature set)", "features": "table_rank, venue/schedule, metro_size, etc.",
         "naive_scheme": "random 80/20 split", "naive_metric": "Pearson r", "naive_value": 0.862,
         "grouped_scheme": "Leave-One-Team-Out", "grouped_metric": "pooled Pearson r", "grouped_value": 0.440, "source": "12"},
    ]
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(OUTPUT_DIR, "leakage_check_summary.csv"), index=False)
    print(df.to_string(index=False))
    return df


if __name__ == "__main__":
    print("=== Table 1: accessibility gain by relocation ===")
    build_table1()
    print("\n=== Table 2: synthetic control comparables ===")
    build_table2()
    print("\n=== Table 3: leakage check summary ===")
    build_table3()
