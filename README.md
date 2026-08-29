# Gotham FC's Move to Queens

**Does transit accessibility translate to attendance?**

Gotham FC is relocating from Sports Illustrated Stadium in Harrison, NJ to Etihad Park in
Willets Point, Queens in 2028, where it will share the venue with NYCFC. I built transit and
walk isochrones around every current NWSL stadium to measure how many people can actually reach
each venue, then used that to ask whether Gotham's accessibility gain will meaningfully increase
its attendance.

This repo holds the full pipeline behind my QSS 45 final paper: the isochrone build, the
two-stage attendance model, the synthetic control, and every figure and table in the paper.

## What I found

**Etihad Park reaches 3.20 million people within 60 minutes by transit and walking. Sports
Illustrated Stadium reaches 1.05 million.** That is a 3x gain, and it is the single most striking
descriptive fact in the project. Manhattan is the reason: Sports Illustrated Stadium's only
Manhattan connection is PATH, which terminates downtown, so 11 percent of Manhattan is reachable
within an hour. Etihad Park sits on the 7 train, a single-seat ride into Midtown, so 71 percent
is reachable in the same hour.

**Accessibility is a positive and significant predictor of attendance**, with a coefficient of
0.177 on log catchment population (95% CI [0.009, 0.345], p = 0.038), and it is the largest
single driver of the model's predicted shift from Sports Illustrated Stadium to Etihad Park.

**No model here generalizes to a venue it has not seen.** Under Leave-One-Venue-Out
cross-validation, the linear stage falls below a mean-only baseline (R² = -0.045) and the
combined linear plus CatBoost model only reaches R² = 0.004. Naive fit looks much better
(R² = 0.788 on a random 80/20 split), which is exactly the gap LOVO exists to expose.

**The synthetic control is my strongest estimate**: 17,961 to 25,000 fans in Gotham's first
season at Etihad Park, or 72 to 100 percent of capacity, once league-wide growth is separated
from the move itself. I report a range rather than a point estimate because it rests on three
comparable relocations, and that is the honest way to present an estimate built on that little
data.

**Roughly 8 percent of the attendance panel is capacity-censored.** Several teams report a fixed
sellout figure instead of real turnout. I confirmed this directly for Kansas City Current, where
every 2024 to 2026 home game reports the identical 11,500. I detect it by flagging any exact
attendance value repeating three or more times within a team-season at or near listed capacity,
and I exclude those rows from training. This was not documented anywhere I could find, and it
changes how the Kansas City relocation should be read.

## Running the pipeline

Notebooks are numbered in strict run order. `02` and `08` are `.py` scripts rather than
notebooks because each takes a `<metro_key>` CLI argument and is launched as parallel background
processes, one per metro.

```
code/
  plot_theme.py                            shared plot styling
  01_gtfs_pull_comparison_cities.ipynb     GTFS, OSM, Census pulls for KC, San Diego, Seattle, DC
  02_isochrones_comparison_cities.py       r5py isochrones + tract travel times for those 4 metros
  03_comparison_cities_demographics.ipynb  does Gotham's demographic shift generalize? (it does not)
  04_synthetic_control.ipynb               donor pool, counterfactual Gotham, placebo validation
  05_nyc_isochrones.ipynb                  transit + walk isochrones for both Gotham venues
  06_nyc_visualization.ipynb               isochrone map, reachable population, demographic figures
  07_gtfs_pull_new_venues.ipynb            GTFS, OSM, Census for the 9 remaining NWSL venues
  08_isochrones_new_venues.py              isochrones for those 9 (all 14 venues now covered)
  09_catboost_feature_engineering.ipynb    builds the game-level training table
  10_attendance_model.ipynb                linear accessibility stage, clustered SE, LOVO
  11_catboost_attendance_model.ipynb       CatBoost on the linear residual + Queens counterfactual
  12_shap_mechanism_check.ipynb            TreeSHAP decomposition of the predicted shift
  summary_tables.py                        joins existing outputs into paper-ready tables
  supplementary/
    08_tract_clustering.ipynb              k-means on tract demographics (not part of the graded pipeline)
data/
  raw/        GTFS zips, OSM extracts, Census shapefiles and ACS pulls
  processed/  joined isochrone, demographic, and model tables
output/       final figures and model output tables
paper/        LaTeX source, figures, and Supporting Information
```

Files should be run in numerical order.

## Data sources

| Source | Used for |
|---|---|
| American Soccer Analysis API (via `itscalledsoccer`) | game, team, and stadium data, 2016 onward |
| GTFS static feeds | transit schedules for every metro |
| OpenStreetMap (Geofabrik, clipped per metro) | pedestrian and road networks for walk legs |
| Census TIGER/Line + ACS 5-year | tract geometries, population, income, race and ethnicity |
| Open-Meteo Archive API | game-day temperature and precipitation |

The NWSL began in 2013, but ASA only reports attendance reliably from 2016, so 2013 to 2015 are
excluded. I also exclude 2020 and 2021 from every attendance model because of COVID-19
restrictions, which matters especially because Washington Spirit and Gotham both relocated in
2021.

## Decisions worth knowing about

**I fixed r5py's walking speed.** The default is 3.6 km/h, noticeably slower than the roughly
5 km/h most real-world estimates assume. I confirmed this against a real route with
`r5py.DetailedItineraries`: Sports Illustrated Stadium to the Harrison PATH station is a genuine
1,001 meter walked path, which took 16:44 at the default versus about 12 minutes at a realistic
pace. Every walk leg in every isochrone was inflated the same way. After setting
`speed_walking=5.0` everywhere, Sports Illustrated Stadium's 60-minute reach nearly doubled,
from 620K to 1.05M, and I rebuilt the comparison metros with the same fix so the cross-metro
comparison stays on consistent footing.

**I split the model into two stages so the tree model never extrapolates.** CatBoost trained
directly on `log_attendance` with `metro_size` as a feature had a real bug: tree models cannot
extrapolate past their training range, and Etihad Park's catchment is 2.2x the largest value in
training. Capping `metro_size` at the training maximum versus feeding the real value produced
the identical prediction, silently. So the linear stage now carries accessibility alone, where
it can extrapolate, and CatBoost trains on the residual using every other feature. The final
prediction is `exp(linear_pred + catboost_residual_pred)`. Log-transforming the predictor is
what keeps that extrapolation defensible, since it puts Etihad Park only 0.78 log-units past the
training maximum.

**I validate with Leave-One-Venue-Out, not Leave-One-Team-Out.** LOTO asks whether the model can
handle a team it has never seen, which is not my question: Gotham is always in-sample, and only
the venue is genuinely new. LOVO holds out one (team, venue) pair at a time, which is the closer
analog to the real deployment question.

**I tuned CatBoost against LOVO, not the naive split.** A 24-combination grid search scored by
pooled LOVO R² selected `depth=6, iterations=300, learning_rate=0.05, l2_leaf_reg=3`. Scoring
against the naive split would have rewarded memorizing venues harder, which is the opposite of
what I need.

**Finding a data bug changed a result.** The first version of `shared_with_other_league` sent
almost the entire predicted Queens shift through that one flag. Checking why turned up Sports
Illustrated Stadium mislabeled as "not shared" in the Wikipedia-scraped columns, despite being
the New York Red Bulls' actual MLS home. Five of 21 venues were mislabeled this way. I now
compute the flag from the reliable `primary_team_id` and `secondary_team_id` columns instead,
and after the fix its SHAP contribution collapsed to roughly zero, confirming it was the bug and
not a real effect.

## Known limitations

- Neither model shows any demonstrated ability to generalize to an unfamiliar venue. Pooled LOVO
  R² is negative for the linear stage and barely positive for the combined model. That is a
  materially stronger limitation than "weak fit."
- The synthetic control range rests on three comparable relocations, since Kansas City is
  excluded as capacity-suppressed. It is a small-sample descriptive range, not an inferential
  estimate with a confidence interval.
- The placebo tests on Seattle and Washington Spirit return p = 0.2, which is not conventionally
  significant. With only four potential placebo units, the test cannot rule out chance.
- Both approaches hit the same ceiling of roughly 4 to 5 real relocation events, regardless of
  how precisely accessibility is measured. More isochrone precision does not fix this.
- Every isochrone is computed for Saturday at 6pm, a standard game time. This does not capture
  transit variability within markets, and it matters most where service is sparse: Children's
  Mercy Park is served by a single hourly bus route on Saturdays, so its 60-minute catchment of
  6,028 people is real but unusually sensitive to the departure time chosen.
- The demographic shift I find for Gotham does not generalize. Three of the four comparison
  relocations shift less white as accessibility improves, so the pattern is specific to Gotham's
  geography rather than a general consequence of gaining transit access.
