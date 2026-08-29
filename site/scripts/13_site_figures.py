"""
Re-render the charts the website embeds, as published graphics rather than lab plots.

The notebooks that produced these figures were written to help me think: axis labels are the
column names, titles carry the regression output, and a reader who hasn't read the code has no
way in. That's the right register for a notebook and the wrong one for a page someone lands on.
This script re-draws the same numbers with:

  - a title that states the finding, not the statistic
  - plain-English labels -- no `log_metro_size`, no `coef=`, no p-values in the headline
  - effects expressed in the reader's units (percent change in attendance), not log points
  - a source line on every figure

Nothing is recomputed except the SHAP decomposition, which has no intermediate CSV; every other
figure reads the same output/*.csv the notebooks already wrote, so the pictures cannot drift
away from the paper.

Deliberately NOT regenerated: synthetic_control_placebo_validation.png. Redrawing it would mean
refitting the synthetic control, and a refit that landed even slightly differently would put the
site out of step with the paper. It stays as notebook 04 produced it.

Reads:
    output/attendance_linear_model_coefficients.csv
    output/catboost_lovo_cv_results.csv
    output/catboost_attendance_model.cbm + output/gotham_synthetic_grid_base.csv
        + output/etihad_venue_features.csv + data/processed/catboost_training_table.csv
Writes (both copies, so output/ and the site stay identical):
    output/<name>.png  and  site/src/assets/figures/<name>.png

Usage (from site/scripts/): python3 13_site_figures.py
"""
import json
import os
import shutil
import sys
import textwrap

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# This script moved from code/ to site/scripts/ (2026-08-29) -- it's website-only tooling, not
# part of the graded analysis pipeline in code/, but it still borrows code/'s shared plot theme
# so the site's matplotlib-rendered figures (just the placebo-validation PNG now) match the
# paper's. Path up to code/ instead of duplicating plot_theme.py here.
sys.path.insert(0, os.path.join("..", "..", "code"))
from plot_theme import (
    COLOR_CORAL,
    COLOR_INK,
    COLOR_LINE,
    COLOR_NAVY,
    COLOR_PRIMARY_DEEP,
    COLOR_VIOLET,
    set_mpl_theme,
)

OUTPUT_DIR = os.path.join("..", "..", "output")
DATA_PROCESSED_DIR = os.path.join("..", "..", "data", "processed")
SITE_FIGURES_DIR = os.path.join("..", "src", "assets", "figures")

# The site's own type system is Source Serif 4 + Inter, neither of which matplotlib can load
# (they're webfonts). Georgia is the closest widely-installed serif and is already the documented
# fallback in plot_theme; using it for titles at least makes the figures rhyme with the serif
# headings they sit under instead of reading as a foreign object on the page.
TITLE_FONT = "Georgia"

SOURCE_LINE = (
    "Source: American Soccer Analysis; U.S. Census Bureau (ACS 5-year); transit agency GTFS "
    "feeds; OpenStreetMap.  Chart: Isabel Prado-Tucker"
)


def draw_title(fig, title, subtitle, *, x=0.01, y=0.98):
    """Headline states the finding; the deck underneath carries the qualification."""
    fig.text(x, y, title, fontsize=15, fontweight="bold", family=TITLE_FONT,
             color=COLOR_PRIMARY_DEEP, va="top", ha="left")
    fig.text(x, y - 0.085, subtitle, fontsize=10.5, color=COLOR_INK, alpha=0.8,
             va="top", ha="left", wrap=True)


def draw_footer(fig, note, *, x=0.01, y=0.045, line_height=0.030):
    """Method note, then source. Both small, both always present.

    The note is wrapped to the figure's own width rather than trusted to fit: matplotlib will
    happily run `fig.text` straight off the right edge, which silently truncates the method
    statement -- the one line a sceptical reader most wants to finish."""
    width_chars = int(fig.get_size_inches()[0] * 20)
    lines = textwrap.wrap(note, width=width_chars) or [note]
    for i, line in enumerate(reversed(lines)):
        fig.text(x, y + i * line_height, line, fontsize=8, color=COLOR_INK, alpha=0.65,
                 va="bottom", ha="left")
    fig.text(x, y - 0.038, SOURCE_LINE, fontsize=7.5, color=COLOR_INK, alpha=0.5,
             va="bottom", ha="left")


def save(fig, name):
    """Write the print/paper copy to output/.

    The website no longer consumes these PNGs -- it draws the same numbers as inline SVG from the
    data file this script also emits, so the charts scale, stay selectable and use the site's own
    typefaces. The rasters remain for the paper, which does want a fixed image."""
    out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    print(f"  wrote {out_path}")


# ---------------------------------------------------------------------------
# 1. The accessibility coefficient
#
# The notebook version plotted a log-log coefficient against an axis labelled `log_metro_size`,
# with `coef=+0.1772, 95% CI [+0.0094, +0.3450], p=0.038` as the title. Both are unreadable to
# anyone who hasn't fit the model. A coefficient b on log population means that doubling the
# population multiplies attendance by 2**b, so the whole interval can be restated as a percent
# change per doubling -- the same finding, in units a reader already owns.
# ---------------------------------------------------------------------------
def figure_accessibility_coefficient():
    coefs = pd.read_csv(os.path.join(OUTPUT_DIR, "attendance_linear_model_coefficients.csv"))
    row = coefs.set_index("predictor").loc["log_metro_size"]

    def per_doubling(b):
        return (2 ** b - 1) * 100

    point = per_doubling(row["coef"])
    low = per_doubling(row["ci_low"])
    high = per_doubling(row["ci_high"])

    fig, ax = plt.subplots(figsize=(8.2, 3.5))
    fig.subplots_adjust(top=0.70, bottom=0.30, left=0.06, right=0.97)

    ax.hlines(0, low, high, color=COLOR_NAVY, linewidth=5, alpha=0.35, zorder=2)
    ax.plot([point], [0], "o", markersize=13, color=COLOR_NAVY, zorder=3)
    ax.axvline(0, color=COLOR_INK, linestyle="--", linewidth=1, alpha=0.5, zorder=1)

    ax.annotate(f"+{point:.0f}%", (point, 0), textcoords="offset points", xytext=(0, 17),
                ha="center", fontsize=13, fontweight="bold", color=COLOR_PRIMARY_DEEP)
    for value, label, align in ((low, f"+{low:.1f}%", "right"), (high, f"+{high:.0f}%", "left")):
        ax.annotate(label, (value, 0), textcoords="offset points",
                    xytext=(-8 if align == "right" else 8, -20),
                    ha=align, fontsize=9, color=COLOR_INK, alpha=0.75)
    ax.annotate("no effect", (0, 0), textcoords="offset points", xytext=(-8, 22),
                ha="right", fontsize=9, color=COLOR_INK, alpha=0.6)

    ax.set_yticks([])
    ax.set_ylim(-0.6, 0.6)
    ax.set_xlabel("Change in attendance each time the reachable population doubles")
    ax.xaxis.set_major_formatter(lambda v, _pos: f"{v:+.0f}%".replace("+0%", "0%"))
    ax.grid(axis="y", visible=False)
    ax.spines["left"].set_visible(False)

    draw_title(
        fig,
        "More people within reach, more fans in the stands",
        "Each doubling of the population that can reach a stadium within an hour is worth about "
        f"{point:.0f}% more fans.\nThe range is wide, which is why every estimate built on it is "
        "reported as a range too.",
    )
    draw_footer(
        fig,
        "Ordinary least squares of log attendance on log reachable population, 950 home games, "
        f"2016-2026. Standard errors clustered by team; p = {row['p_value']:.2f}. "
        "Shaded bar is the 95% confidence interval.",
    )
    save(fig, "nwsl_attendance_accessibility_coefficient")
    return {
        "pointPct": round(point, 2),
        "lowPct": round(low, 2),
        "highPct": round(high, 2),
        "pValue": round(float(row["p_value"]), 4),
    }


# ---------------------------------------------------------------------------
# 2. Per-venue error under leave-one-venue-out
#
# Same bars as the notebook, but sorted and labelled so the shape of the failure is the point:
# the model misses hardest exactly where crowds are biggest.
# ---------------------------------------------------------------------------
def figure_lovo_per_venue():
    lovo = pd.read_csv(os.path.join(OUTPUT_DIR, "catboost_lovo_cv_results.csv"))
    lovo = lovo.sort_values("mae")
    # The venue's own average crowd rides in the category label rather than as a bar annotation:
    # inside the bar it overflowed the short ones, and outside it collided with the value.
    labels = [
        f"{t} — {v}  ({a:,.0f})"
        for t, v, a in zip(lovo["team"], lovo["venue_name"], lovo["mean_attendance"])
    ]

    fig, ax = plt.subplots(figsize=(9.0, 6.4))
    fig.subplots_adjust(top=0.80, bottom=0.16, left=0.40, right=0.97)

    y = np.arange(len(lovo))
    # Coral marks the three worst misses -- which are exactly the three best-drawing venues, the
    # claim the headline makes. An absolute cutoff instead swept in Chicago Stars, whose crowds
    # are among the smallest in the league, and quietly contradicted it.
    worst_three = set(lovo["mae"].nlargest(3).index)
    colors = [COLOR_CORAL if i in worst_three else COLOR_NAVY for i in lovo.index]
    ax.barh(y, lovo["mae"], color=colors, height=0.72)
    ax.set_yticks(y, labels, fontsize=8.5)
    ax.invert_yaxis()

    for yi, mae in enumerate(lovo["mae"]):
        ax.annotate(f"{mae:,.0f}", (mae, yi), textcoords="offset points", xytext=(6, 0),
                    va="center", fontsize=8.5, color=COLOR_INK, alpha=0.8)

    ax.set_xlabel("Average miss, in fans, when this venue is held out of training")
    ax.xaxis.set_major_formatter(lambda v, _pos: f"{v:,.0f}")
    ax.set_xlim(0, lovo["mae"].max() * 1.16)
    ax.grid(axis="y", visible=False)
    ax.spines["left"].set_visible(False)

    draw_title(
        fig,
        "The model misses hardest where the crowds are biggest",
        "Each venue in turn is removed from training, then predicted from the other 16. The three\n"
        "worst misses are the three best-drawing grounds — Portland, San Diego and Angel City —\n"
        "which the model has no way to reach once they are held out.",
        y=0.985,
    )
    draw_footer(
        fig,
        "Leave-one-venue-out cross-validation across 17 team-venue pairs. Figures in brackets are "
        "each venue's own average crowd. Coral marks the three largest misses.",
        y=0.055,
    )
    save(fig, "catboost_lovo_per_venue_mae")
    return lovo


# ---------------------------------------------------------------------------
# 3. What drives the predicted move
#
# Recomputed rather than read from a CSV, because notebook 12 never wrote one. Same model, same
# paired grid, so the numbers reproduce exactly -- the assertions at the end check that.
#
# The notebook plotted log-point contributions against raw feature names. Here each contribution
# is converted to the percent change it represents (exp(v) - 1) and given a human label. The
# contributions combine multiplicatively, which the footnote says.
# ---------------------------------------------------------------------------
PLAIN_NAMES = {
    "linear_stage (accessibility)": "People who can reach the stadium",
    "points_back_from_playoff_line": "Points from a playoff place",
    "venue_name": "Which venue",
    "home_team": "Which home team",
    "temp_max_c": "Temperature",
    "shared_with_other_league": "Shares the ground with an MLS club",
    "precipitation_mm": "Rain",
    "prior_sellout_rate": "Past sellout rate",
    "dedicated_soccer_facility": "Soccer-specific ground",
    "days_since_last_home_game": "Days since the last home game",
    "away_team": "Which opponent",
    "opponent_table_rank": "Opponent's league position",
    "stadium_capacity": "Stadium capacity",
    "stop_count_catchment": "Transit stops nearby",
    "table_rank": "Gotham's league position",
    "ppg": "Recent form",
    "pct_commute_transit": "Share of the city commuting by transit",
    "day_of_week": "Day of the week",
    "team_league_tenure": "Years in the league",
    "year": "Season",
    "team_venue_tenure": "Years at the venue",
}


def figure_mechanism():
    import shap
    from catboost import CatBoostRegressor

    cat_features = ["day_of_week", "venue_name", "home_team", "away_team"]
    num_features = [
        "table_rank", "opponent_table_rank", "days_since_last_home_game", "year",
        "stadium_capacity", "dedicated_soccer_facility", "shared_with_other_league",
        "team_venue_tenure", "team_league_tenure", "ppg", "points_back_from_playoff_line",
        "temp_max_c", "precipitation_mm", "stop_count_catchment", "pct_commute_transit",
        "prior_sellout_rate",
    ]
    features = cat_features + num_features

    model = CatBoostRegressor()
    model.load_model(os.path.join(OUTPUT_DIR, "catboost_attendance_model.cbm"))

    coefs = pd.read_csv(os.path.join(OUTPUT_DIR, "attendance_linear_model_coefficients.csv")).set_index("predictor")
    intercept, slope = coefs.loc["Intercept", "coef"], coefs.loc["log_metro_size", "coef"]

    df = pd.read_csv(os.path.join(DATA_PROCESSED_DIR, "catboost_training_table.csv"))
    gotham = df[(df["home_team"] == "NJ/NY Gotham FC") & df["stadium_capacity"].notna() & (df["year"] == 2026)]
    rba = gotham.sort_values("date_time_utc").iloc[-1] if "date_time_utc" in df.columns else gotham.iloc[-1]

    rba_features = {
        "venue_name": "Sports Illustrated Stadium", "stadium_capacity": rba["stadium_capacity"],
        "dedicated_soccer_facility": rba["dedicated_soccer_facility"],
        "shared_with_other_league": rba["shared_with_other_league"],
        "team_venue_tenure": rba["team_venue_tenure"], "team_league_tenure": rba["team_league_tenure"],
        "ppg": rba["ppg"], "points_back_from_playoff_line": rba["points_back_from_playoff_line"],
        "temp_max_c": rba["temp_max_c"], "precipitation_mm": rba["precipitation_mm"],
        "stop_count_catchment": rba["stop_count_catchment"],
        "pct_commute_transit": rba["pct_commute_transit"], "prior_sellout_rate": rba["prior_sellout_rate"],
    }
    etihad_features = pd.read_csv(os.path.join(OUTPUT_DIR, "etihad_venue_features.csv")).iloc[0].to_dict()
    etihad_features["team_venue_tenure"] = 0
    etihad_features["team_league_tenure"] = 2026 - 2013

    base_rows = pd.read_csv(os.path.join(OUTPUT_DIR, "gotham_synthetic_grid_base.csv")).to_dict("records")
    rba_rows = pd.DataFrame([{**r, **rba_features} for r in base_rows])
    etihad_rows = pd.DataFrame([{**r, **etihad_features} for r in base_rows])
    for c in cat_features:
        rba_rows[c] = rba_rows[c].astype(str)
        etihad_rows[c] = etihad_rows[c].astype(str)

    explainer = shap.TreeExplainer(model)
    shap_rba = explainer(rba_rows[features])
    shap_etihad = explainer(etihad_rows[features])

    shift = pd.Series(shap_etihad.values.mean(axis=0) - shap_rba.values.mean(axis=0), index=features)
    linear_shift = slope * np.log(float(etihad_features["metro_size"])) - slope * np.log(float(rba["metro_size"]))
    shift["linear_stage (accessibility)"] = linear_shift
    shift = shift.sort_values()

    # Guard rails: these are the numbers the page and the paper quote. If a rebuild of the model
    # ever moves them, this should fail loudly rather than quietly redrawing a different finding.
    assert abs(shift["linear_stage (accessibility)"] - 0.197) < 0.002, shift["linear_stage (accessibility)"]
    assert abs(shift["venue_name"] - 0.116) < 0.002, shift["venue_name"]

    pct = (np.exp(shift) - 1) * 100
    net_pct = (np.exp(shift.sum()) - 1) * 100

    fig, ax = plt.subplots(figsize=(8.6, 6.6))
    fig.subplots_adjust(top=0.80, bottom=0.16, left=0.38, right=0.95)

    y = np.arange(len(pct))
    colors = []
    for name, v in pct.items():
        if name == "linear_stage (accessibility)":
            colors.append(COLOR_VIOLET)
        elif abs(v) < 0.15:
            colors.append(COLOR_LINE)
        else:
            colors.append(COLOR_NAVY if v >= 0 else COLOR_CORAL)

    ax.barh(y, pct.values, color=colors, height=0.72)
    ax.axvline(0, color=COLOR_INK, linewidth=0.9, alpha=0.5, zorder=3)
    ax.set_yticks(y, [PLAIN_NAMES.get(n, n) for n in pct.index], fontsize=9)
    ax.invert_yaxis()

    for yi, v in zip(y, pct.values):
        if abs(v) < 0.15:
            continue
        ax.annotate(f"{v:+.1f}%", (v, yi), textcoords="offset points",
                    xytext=(5 if v >= 0 else -5, 0), va="center",
                    ha="left" if v >= 0 else "right", fontsize=8.5, fontweight="bold",
                    color=COLOR_INK, alpha=0.85)

    ax.set_xlabel("Effect on predicted attendance, moving from Harrison to Queens")
    ax.xaxis.set_major_formatter(lambda v, _pos: f"{v:+.0f}%".replace("+0%", "0%"))
    # Extra room on the negative side: the value labels sit outside the bar ends, and on the
    # short negative bars they would otherwise run into the category names.
    ax.set_xlim(pct.min() * 2.4 - 1, pct.max() * 1.28)
    ax.grid(axis="y", visible=False)
    ax.spines["left"].set_visible(False)

    draw_title(
        fig,
        "Reach drives almost the whole predicted jump",
        "Every other thing the model knows about a match — the opponent, the weather, the day of\n"
        "the week, the team's form — barely moves the answer. Reach is also the one input I gave\n"
        "its own model, so it had the best chance to matter.",
        y=0.985,
    )
    draw_footer(
        fig,
        "Linear accessibility stage plus TreeSHAP on the CatBoost residual, averaged over 54 "
        f"matched fixtures. Effects combine multiplicatively to a net {net_pct:+.0f}%.",
        y=0.055,
    )
    save(fig, "shap_shift_diverging")
    return pct, net_pct


def write_site_data(effect, lovo, pct, net_pct):
    """Emit the numbers behind the three charts as a typed module the site imports.

    The site draws these as inline SVG rather than showing the PNGs above: an SVG chart scales to
    the reader's viewport, keeps its labels as real selectable text for search and screen readers,
    and can use the site's own Source Serif / Inter rather than whatever matplotlib had to hand.

    Generated, never hand-edited -- so a chart on the page cannot drift away from the model that
    produced it. Re-run this script after any model change."""
    # json.dumps, not repr-and-swap-quotes: venue names contain apostrophes ("Children's Mercy
    # Park") and a naive quote swap turns them into broken TypeScript.
    rows = "\n".join(
        f"  {{ team: {json.dumps(t)}, venue: {json.dumps(v)}, mae: {m:.0f}, "
        f"meanAttendance: {a:.0f}, games: {g:.0f} }},"
        for t, v, m, a, g in zip(
            lovo["team"], lovo["venue_name"], lovo["mae"], lovo["mean_attendance"], lovo["n_games"]
        )
    )
    bars = "\n".join(
        f"  {{ label: {json.dumps(PLAIN_NAMES.get(name, name))}, pct: {value:.2f} }},"
        for name, value in pct.items()
    )
    ts = f'''// GENERATED by site/scripts/13_site_figures.py -- do not edit by hand.
// Re-run that script after any model change; it recomputes these from the saved model and the
// output/*.csv the notebooks wrote, so the charts on the page cannot drift from the paper.

/** Effect of accessibility on attendance, restated in the reader's units: the percent change in
 *  attendance for each doubling of the population within 60 minutes. Derived from the log-log
 *  coefficient as 2**b - 1. */
export const accessibilityEffect = {{
  pointPct: {effect["pointPct"]},
  lowPct: {effect["lowPct"]},
  highPct: {effect["highPct"]},
  pValue: {effect["pValue"]},
  games: 950,
}}

/** Leave-one-venue-out error, one row per team-venue pair, ascending by miss. */
export type VenueError = {{ team: string; venue: string; mae: number; meanAttendance: number; games: number }}
export const venueErrors: VenueError[] = [
{rows}
]

/** Contribution of each input to the predicted Harrison-to-Queens change, as a percent effect on
 *  attendance. These combine multiplicatively, not additively. */
export type MechanismBar = {{ label: string; pct: number }}
export const mechanismShift: MechanismBar[] = [
{bars}
]
export const mechanismNetPct = {net_pct:.1f}

export const CHART_SOURCE =
  'American Soccer Analysis; U.S. Census Bureau (ACS 5-year); transit agency GTFS feeds; OpenStreetMap'
'''
    path = os.path.join("..", "src", "data", "chartData.ts")
    with open(path, "w") as fh:
        fh.write(ts)
    print(f"  wrote {path}")


def main():
    set_mpl_theme()
    print("Re-rendering figures for the paper, and chart data for the site...")
    effect = figure_accessibility_coefficient()
    lovo = figure_lovo_per_venue()
    pct, net_pct = figure_mechanism()
    write_site_data(effect, lovo, pct, net_pct)
    print("Done.")


if __name__ == "__main__":
    main()
