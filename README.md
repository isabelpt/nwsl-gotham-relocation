# NWSL Geospatial: Gotham FC's Move to Queens

**Question:** How will Gotham FC's relocation from Red Bull Arena (Harrison, NJ) to Etihad
Park (Willets Point, Queens, shared with NYCFC, opening 2027) change transit/walk
accessibility for fans, and how will that accessibility change affect attendance?

**Course-scope note (2026-08-23):** the pipeline below was pared down to match what QSS 45
actually covered -- OLS/logistic regression, gradient-boosted trees + SHAP, and (per the
instructor's direct instruction for this project) synthetic control. Panel fixed-effects
regression with clustered/robust standard errors and difference-in-differences were never
taught in this course, so the sections that depended on them (a fixed-effects follow-up to `04`
and a standalone DiD cross-check, `13`) were cut rather than kept as unteachable machinery. Both
are described in "Known limitations" below rather than deleted from the record entirely -- the
git history keeps the removed notebook content if it's ever needed again.

This project reuses substantial prior work rather than starting from scratch:

- **[nwsl-project](../../QSS%2020/nwsl-project)** -- cleaned NWSL/MLS game, team, and stadium
  data (`itscalledsoccer`), and an existing attendance regression
  (`code/03_stadiums_analyze.ipynb`) predicting `log(attendance)` from `ppg`,
  `market_size_log`, `new_stadium_flag`, `rivalry_flag`, `dist_miles`. This is the baseline
  model we extend with accessibility features.
- **[nwsl_transportation](../nwsl_transportation)** -- GTFS feeds + OSM extracts for the NY/NJ
  metro, NY(36)/NJ(34) Census tract shapefiles + ACS population, and a working r5py transit
  network with isochrones already computed for Red Bull Arena and Etihad Park
  (`code/08_gtfs_isochrones.ipynb`), plus per-stadium accessibility features for every
  NWSL/MLS venue (`data/processed/stadium_accessibility.csv`, `games_with_transit.csv`).
  **These specific files are vendored into this repo's own `data/` folder** (not read live from
  `../nwsl_transportation` at runtime) so `nwsl_geospatial` has no external-repo dependency --
  see `data/processed/{stadium_accessibility,games_with_transit,relocation_stadiums,
  nwsl_transportation_teams_clean}.csv`, `data/processed/relocation_{isochrones.geojson,
  tract_travel_times.csv}`, and `data/raw/census/acs_{population_by_tract,demographics_ny_nj}.csv`.
  The GTFS zips and NY/NJ tract shapefiles this project also needs were already present locally
  in `data/raw/{gtfs,census}` from this project's own comparison-city/new-venue pulls (`01`,
  `09`), so nothing further needed copying there.

`nwsl_geospatial` is where this gets pulled together, extended to the comparison cities,
modeled, and turned into the final deliverable.

## Repo structure (as built, numbered in run order)

`code/` holds only the steps that get a real section in the paper -- `01` through `13`, numbered
in run order, with one exception: `04` reads an output written by `11` (see `04`'s writeup
below), so `11` has to run before `04` despite the numbering. (The original `13`, a standalone
DiD cross-check, was cut for course scope -- see
below -- so the former `14` was renumbered down to `13` to close the gap.) `code/supplementary/` holds one notebook,
`08_tract_clustering.ipynb`, kept only because the web map's demographic-cluster layer reads its
output -- it's explicitly not part of what's presented/defended as this project's modeling
approach (k-means wasn't covered in class). Everything else that was superseded or abandoned
during exploration -- including the prior version of this pipeline's random-search-tuned
CatBoost, its bootstrap confidence intervals, a PyMC hierarchical model, a fixed-effects panel
regression follow-up to `04`, and a standalone DiD cross-check (`13`) -- isn't kept as a growing
graveyard of scripts nobody runs; the "what was tried and why it didn't make the cut" story is
preserved in prose below, not in files. The fixed-effects/DiD cuts specifically are a
course-scope decision (see the note above the file tree), not a methodological one -- those
sections were internally consistent and correctly computed, they just relied on panel
econometrics never covered in QSS 45.

```
code/
  plot_theme.py                          # shared styling, copied from nwsl-project/nwsl_transportation
  01_gtfs_pull_comparison_cities.ipynb   # GTFS/OSM/Census pull for KC, San Diego, Seattle, DC
  02_isochrones_comparison_cities.py     # r5py isochrones + tract travel times for those 4 metros
  03_comparison_cities_demographics.ipynb  # does Gotham's demographic shift generalize? (it doesn't)
  04_attendance_model.ipynb              # baseline + transit regression, k-fold CV, GBT/SHAP robustness + team-identity leakage check
  05_synthetic_control.ipynb             # donor pool of NWSL teams, counterfactual Gotham attendance, treated-vs-synthetic gap chart
  06_nyc_isochrones.ipynb                # transit+walk NYC isochrones (merged w/ old 07, 16)
  07_nyc_visualization.ipynb             # static isochrone map, reachable-population + demographic figures
  09_gtfs_pull_new_venues.ipynb          # GTFS/OSM/Census pull for the 9 current-NWSL venues outside the 5 already covered
  10_isochrones_new_venues.py            # r5py isochrones + tract travel times for those 9 venues (all 14 current venues now covered)
  11_catboost_feature_engineering.ipynb  # builds the CatBoost training table: table_rank, venue/schedule features, capacity-censoring exclusion
  12_catboost_attendance_model.ipynb     # CatBoostRegressor(iterations=1000, learning_rate=0.1, depth=6), evaluated with a random split vs. a Leave-One-Team-Out split (plain pandas, team by team) -- see "CatBoost extension" below
  13_shap_mechanism_check.ipynb          # shap.TreeExplainer + bar/beeswarm/waterfall plots, averaged across 54 paired synthetic rows (not one cherry-pickable example) -- see "CatBoost extension" below
  summary_tables.py                      # not numbered/graded -- joins/reshapes existing 02/03/06/07/12 outputs into 3 paper-ready CSV tables (accessibility gain by relocation, synthetic-control comparables, leakage-check summary); computes nothing new
  supplementary/
    08_tract_clustering.ipynb            # k-means on tract demographics + accessibility -- not part of the graded pipeline (k-means wasn't covered in class), kept only because the web map's cluster layer reads its output
data/
  raw/       # GTFS zips, OSM pbfs, Census tract shapefiles/ACS pulls
  processed/ # joined isochrone/demographic/model tables
output/      # final figures + model output tables
```

`02` and `10` are the two `.py` scripts left in the main sequence, not notebooks, because each
takes a CLI argument (`<metro_key>`) and is launched as parallel background processes, one per
metro -- a real requirement a notebook can't replicate. Everything else that used to be a script
for the same reason (`06`, formerly two scripts merged from `07`/`16`; `09`, a linear download
pass with no CLI argument at all) has been converted to a notebook, since none of them actually
needed to stay one -- `09` in particular was always a plain script by choice, not requirement,
which just meant it didn't match the rest of the sequence's format.


## What actually got built

**01, comparison-city data pull**: GTFS, OSM (clipped to each metro's bbox, not full-state
extracts, ~30x smaller), and Census tract/ACS data for the 4 relocated stadiums:
- CPKC Stadium, Kansas City Current (2024)
- Snapdragon Stadium, San Diego Wave (2023)
- Lumen Field, Seattle Reign (2022, not the smaller Event Center, corrected during data pull)
- Audi Field, Washington Spirit (2021, from Maryland SoccerPlex)
- (precedent, not a formal validation case) Red Bull Arena, Gotham's own earlier move from
  Yurcak Field (2021)

**02, isochrones for the 4 comparison metros**: r5py isochrones + tract travel times, run in
parallel across all 4 metros. Every relocation showed a large accessibility gain, old venue to
new (e.g. DC: 4 reachable tracts -> 204). Gotham's own isochrones (Red Bull Arena vs. Etihad
Park) were already built in `nwsl_transportation`; the specific output files they produced are
vendored into this repo's own `data/` (see the note above), reused directly rather than
recomputed or read live from that sibling project.

**03, does Gotham's demographic shift generalize?**: it doesn't. Gotham's reachable population
shifts +21.2 percentage points whiter and +39% wealthier, but 3 of the 4 comparison relocations
shift *less* white as accessibility improves, and income moves in no consistent direction at
all. The shift is specific to Gotham's particular geography (leaving industrial Harrison, NJ
for a site an express subway ride from Manhattan), not a general consequence of moving toward
transit accessibility.

**04, attendance model**: extended `nwsl-project`'s team-season regression with
`catchment_pop_60min` (this project's own r5py-isochrone accessibility measure, the same one
CatBoost calls `metro_size` in `11`/`12` -- an earlier version of this notebook used
`nearest_stop_distance_mi`, a vendored OSM stop-distance figure that predates this project's own
isochrone pipeline and was never the same accessibility measure CatBoost uses; switched for
consistency), dropping `has_rail_access` after it turned out to be identified off just 2-3
teams. Because `catchment_pop_60min` is written only to `output/venue_catchment_population.csv`
by `11`, **`04` now has to run after `11`**, breaking the otherwise strict 01-13 run order --
called out in `04`'s own intro cell rather than left implicit. COVID seasons (2020-2021)
excluded throughout. Cross-validated R^2 is weak (~-0.02 to 0.16 depending on spec) once COVID
years are properly excluded, reported as a real limitation, not smoothed over.
`catchment_pop_60min` also correlates more with `market_size_log` (0.70) than
`nearest_stop_distance_mi` did (0.22); rather than let that distort `market_size_log`'s
coefficient, `market_size_log` is dropped from the extended spec entirely (kept in the baseline,
so the baseline still matches `nwsl-project`'s original regression exactly). `dist_miles` is
also dropped from the extended spec, for the same reason -- its coefficient was tiny and
sign-unstable across specs, not carrying real signal once `catchment_pop_60min` is in the model.
The extended model's predictors are `ppg`, `new_stadium_flag`, `rivalry_flag`, and
`catchment_pop_60min`. This notebook stops at the GBT+SHAP leakage check (below) -- a
fixed-effects follow-up that used to continue past it was cut for course scope (panel regression
with clustered/robust SEs wasn't taught); see "Known limitations."

**05, synthetic control**: donor pool of 8 non-relocating NWSL teams, weighted to match
Gotham's 2022-2026 trajectory (North Carolina Courage, Orlando Pride, Washington Spirit carry
most of the weight). Projects a 2027 no-move baseline plus **2** accessibility-driven scenarios
(originally 3 -- the mid and high lift estimates both projected past Etihad Park's 25,000
capacity and rounded to the identical capped number, so they're collapsed into one
`capacity_cap` scenario instead of two point estimates that happened to be the same): `low`
(22,140, 88.6% of capacity) and `capacity_cap` (25,000, 100%). Both scenarios are computed
directly in the notebook from each comparable relocating team's own pre/post move attendance
change (San Diego 68.8%, Seattle 103.5%, Washington Spirit 174.3% -- the latter two both round
to the capacity cap), no dependency on a separate validation notebook. KC Current is excluded
from this comparison because its attendance is capacity-suppressed: it sells out its smaller
new stadium every game (every 2024-2026 home game reports the identical figure), so its raw
attendance change understates true demand rather than reflecting it. The notebook also produces
the standard SCM "gap chart" (treated vs. synthetic, vertical line at the move date, diverging
after it) as `output/synthetic_control_gap_plot.png` -- since Etihad Park hasn't opened yet, the
post-2026 portion is explicitly labeled as a projection, not observed data.

**06, NYC isochrones**: one r5py `TransportNetwork` build (merged from the former standalone `07`
and `16`, once both were just transit+walk builds with nothing left to keep them separate).
Uses `speed_walking=5.0` km/h (see "Walking speed correction" below) -- a real fix, not the
original build. Covers Red Bull Arena vs. Etihad Park at 30/45/60/90 min -- the
reachable-population numbers `07` and `08` are built on. (The Yankee Stadium/Citi Field
comparison this used to also build isochrones for was removed -- see `supplementary/09`,
`supplementary/10`. A walk-only isochrone build that used to isolate how much of the
accessibility gain required transit vs. was just walkable was cut too -- redundant once it
wasn't feeding anything beyond a single supporting chart.)

**07, NYC visualization**: static isochrone map (now 30/45/60/90 min) with a real basemap and
actual transit lines (subway/PATH/NJ Transit Rail/LIRR in their official colors), a
reachable-population bar chart, and the demographic breakdown of who gains access.

**Why Manhattan looks slow to "reach" on the map**: at 30/45 min neither stadium reaches any
meaningful part of Manhattan; by 90 min both reach ~97-99% of it. The middle thresholds tell the
real story and it's mechanical, not a bug: Red Bull Arena's only Manhattan connection is PATH,
which terminates in Lower Manhattan (WTC) -- reaching Midtown or further requires a second leg,
so almost nothing in Manhattan is reachable before 60 min (11% at 60 min). Etihad Park sits
directly on the 7 train, a single-seat ride into the center of Midtown, so it reaches 71% of
Manhattan by 60 min. That's a real structural advantage of the Willets Point site's transit
connection, not an artifact.

**GBT + SHAP robustness check (added to 04)**: a gradient boosted tree model on the same
features hit a 5-fold CV R^2 of 0.512, dramatically higher than the linear model's 0.156 on
identical folds. SHAP confirms `catchment_pop_60min_100k` is that GBT model's single
largest-magnitude driver. That gap turned out to be team-identity leakage, not real signal:
grouping the CV folds by team (so no team's seasons span train and test) collapses both models
to well below a mean-only baseline (GBT: -1.875, Linear: -2.258). This means the panel and
feature set show no demonstrated ability to predict an unseen team's attendance at all, a
materially stronger limitation than "weak fit," and it retroactively means the earlier
row-shuffled CV numbers in `04` were optimistic too. Documented in place rather than deleted so
the investigation is visible in the notebook, not just the conclusion.

**Cut for course scope: fixed-effects follow-up.** `04` originally continued past the GBT/SHAP
leakage check with a two-part fixed-effects follow-up -- a team+season-dummy panel regression
(NWSL+MLS, 399 team-seasons, clustered/HC1 SEs) confirming the accessibility coefficient's
direction but not its significance (p=0.793), then the same check with real isochrone-based
reachable population instead of the distance proxy on the 4 relocating teams specifically
(still not significant, p=0.351). Both were internally correct -- the panel and clustering
machinery simply isn't material this course covers, so they're cut rather than defended as
course work. The substantive finding they produced (the number of relocation events, ~4-5, is
a hard ceiling no amount of additional isochrone data moves) still holds and is carried forward
qualitatively below and in "Known limitations," just not as a p-value.

**Walking speed correction (06, 02)**: r5py's default `speed_walking` is 3.6 km/h (~2.2
mph), noticeably slower than the ~5 km/h real-world walking pace most estimates (Google Maps
etc.) assume. Confirmed directly with `r5py.DetailedItineraries` on a real route (Red Bull
Arena -> Harrison PATH station: a genuine 1,001m walked path for a 660m straight-line distance,
normal ~1.5x circuity, but 16:44 at the default speed vs. ~12 min at a realistic pace). Every
walk leg in every isochrone built with the default was inflated the same way. Fixed everywhere
now (`speed_walking=5.0` in `06` and `02`) -- Red Bull Arena's 60-min reach nearly doubled
(620K -> 1.05M) once walking wasn't artificially slow, and the 4 comparison-city builds were
rebuilt with the same fix so `03`'s cross-metro comparison is on consistent footing.

**(supplementary) tract clustering**: k-means on standardized per-tract demographic +
accessibility features, at 3 different ways of counting "reachable." Lives in
`code/supplementary/08_tract_clustering.ipynb`, not the main numbered sequence -- k-means
wasn't covered in class, so it's not part of what's presented as this project's modeling
approach. `03`'s aggregate before/after demographic numbers (below) are the headline finding on
who gains/loses access; the tract-level clustering is kept only because the web map's
demographic-cluster layer reads its output, not as a second thing to defend.

**Headline result**: Etihad Park reaches 3.20M people within 60 minutes (was 2.27M before the
walking-speed fix), 3.0x Red Bull Arena's corrected 1.05M -- a real, striking descriptive fact
about the site choice on its own. `05`'s synthetic control range (68.8%-103.5%+ attendance
lift, capped at Etihad Park's 25,000 capacity) is this project's causal claim for what that
accessibility gain does to attendance; it's a 2-point scenario range from 3 comparable
relocations, not a precise point estimate, and is reported as such rather than smoothed into a
single number.

**Plan B (building isochrones for all 16 current NWSL stadiums) was built, then removed.** It
answered a real question -- would extending isochrones to every NWSL city change what the data
can show? No: the number of relocation events available to learn an accessibility effect from
is fixed by history (~4-5), not by how many stadiums have isochrones, so more cities' isochrones
don't add usable identifying variation -- but the full-league descriptive ranking it produced
wasn't needed going forward. All 11 non-relocation metros' GTFS/OSM/Census pulls, isochrones,
and the `15` full-league notebook were deleted; `supplementary/13`, `14`, `14b` are gone too.
California/San Diego's shared resources were preserved during the cleanup (`San Jose`/`Los
Angeles` used the same `california-latest.osm.pbf` and CA tract data San Diego needs).

**09-13, CatBoost extension**: real isochrones now cover all 14 current NWSL venues (was 5) --
`09`/`10` fill in the 9 that weren't already built for a relocation comparison. `11` builds a
game-level training table (`table_rank`/`opponent_table_rank` as running, no-leakage standings;
`games_since_venue_open`; venue supply-side features) with one real fix worth naming:
**~8% of the panel had capacity-censored attendance** -- several teams (confirmed directly for
Kansas City Current: every 2024-2026 home game reports the identical figure, 11,500, matching
CPKC Stadium's real capacity that's missing from the wiki source) report a fixed "sold out"
number instead of real turnout. Detected by flagging any exact attendance value repeating 3+
times within a team-season at/near listed capacity, and excluded from training -- a real,
previously undocumented data-quality finding, not just a modeling footnote.

`12` fits a single `CatBoostRegressor(iterations=1000, learning_rate=0.1, depth=6)`, evaluated
two ways: a plain random `train_test_split` first, then a Leave-One-Team-Out split (a plain loop
over teams -- train on every other team, test on the held-out one), the same leakage check `04`
already ran for its GBT spec. LOTO's pooled Pearson r is the headline generalization number
(printed by the script, along with a `sns.regplot` of actual vs. predicted); it's expected to
land well below the random split's r, for the same team-identity-leakage reason `04` found.
Then, in the same script, the Queens counterfactual (synthetic Gotham/Etihad Park schedule) --
a single point prediction, against `year=2026` specifically, not a hypothetical 2027, since tree
models can't extrapolate a trend past years they've seen, and comparing against Gotham's full
2016-2026 attendance average rather than 2026 alone would overstate the apparent lift by
measuring against a mostly-irrelevant, deflated baseline from a completely different era of the
team.

**Bottom line**: CatBoost's role here is to corroborate the *mechanism* behind `05`'s synthetic
control range, not to compete with it as a second point estimate. Its Queens/Etihad Park
prediction points the same direction as the synthetic control scenarios, and `13`'s SHAP check
confirms `metro_size` is the largest correctly-signed positive driver of that
prediction -- independent evidence, from an unrelated model class, that accessibility is
plausibly doing the work, not just correlated with it. `metro_size` (r5py isochrone catchment
population) is the only accessibility feature in the model -- an earlier version also included
`transit_accessibility`, a composite built from stop counts/distances vendored wholesale from
`nwsl_transportation`'s Overpass API pull rather than computed anywhere in this project, and it
was cut for that reason. The reported number for "what will Queens
attendance be" is still `05`'s scenario range, not this model's point prediction: both hit the
same wall (there have only ever been ~4-5 real NWSL relocation events to learn an effect size
from), and a range is the honest way to report an estimate built on that little data.

**Two more features were added to `11`/`12` after the first pass, and one of them exposed a real
data bug worth its own paragraph.** `venue_name` was kept (dropping team/venue identity was
tested and made LOTO generalization worse), but `dedicated_soccer_facility` and
`shared_with_other_league` were added alongside it -- both fully computable for every venue
(0% missing, unlike `roof`/`turf`, which have a real 28.5% gap hitting current venues like
Snapdragon Stadium and were tried and dropped for that reason). The first version of
`shared_with_other_league` sent almost the entire predicted Queens shift through that one flag
in `13`'s TreeSHAP check -- which led to checking *why*, and finding **Red Bull Arena itself was
mislabeled "not shared"** in the wiki-scraped `Team_nwsl`/`Team_mls` columns, despite being the
New York Red Bulls' actual MLS home. `11` was fixed to compute `shared_with_other_league` from
the reliable `primary_team_id`/`secondary_team_id` columns instead (5 of 21 venues were
mislabeled this way). After the fix, `shared_with_other_league`'s SHAP contribution collapsed to
~0 (confirming it was the bug, not a real effect), and `metro_size` became the
single largest correctly-signed positive contributor -- a real, isolated mechanism confirmation,
no longer confounded.

**A parallel NWSL+MLS pooled model was built, evaluated, and deleted** (not archived --
`supplementary/16-24` no longer exist): expanding to 27 MLS teams gives 16 real relocation
events instead of 4 to calibrate `games_since_venue_open` from, plus a `league`-differentiated,
row-weighted CatBoost model. Removed rather than the main sequence for three reasons, not
because the underlying work was wrong: (1) NWSL-specific LOTO R^2 was *worse* (0.03) than the
NWSL-only model, since MLS's larger row count still dominated which splits the trees learned
even after league-balanced weighting; (2) it needed a whole additional layer of methodology
(why pool two economically different leagues, how the weighting works) that wasn't worth the
exposition cost for a modest accuracy trade; (3) TreeSHAP on it found the predicted Queens lift
traced almost entirely to `shared_with_other_league` (55%) -- the same mislabeling bug found and
fixed above, undiagnosed at the time. Once that bug was understood, keeping a second full model
line around just to re-diagnose the same issue twice stopped being worth it.

## Decisions made along the way
- **Deadline**: analysis complete by Sunday night (2026-08-23), full deliverable (paper +
  website) due Wednesday (2026-08-26).
- **Engine**: r5py throughout, no city2graph bake-off. Already proven end-to-end on NYC, and
  the timeline didn't support running two engines across 5 metros.
- **Synthetic control donor pool**: NWSL teams only, MLS excluded.
- **Census geography**: tract-level throughout, supports the demographic breakdowns.
- **COVID handling**: 2020 and 2021 excluded from every attendance analysis. 2021 in particular
  matters, it's the move year for both Washington Spirit and Gotham.

## Known limitations, flagged rather than hidden
- **Fixed-effects panel regression and DiD were cut for course scope, not methodological
  failure.** A team+season-dummy panel regression (399 NWSL+MLS team-seasons, clustered/HC1 SEs)
  and a one-line DiD cross-check were both built and both worked correctly -- the accessibility
  coefficient's direction was positive and consistent across every specification tried, but
  never statistically significant, because ~4-5 real relocation events is a hard sample-size
  ceiling no amount of additional feature or isochrone precision moves. That finding is real and
  is carried forward qualitatively (see `05`'s and the CatBoost section's write-ups above), just
  not as a citable p-value, since panel econometrics wasn't covered in QSS 45. The removed
  notebook content is recoverable from git history if a future version of this course covers it.
- `04`'s attendance model shows no demonstrated ability to generalize to a team it hasn't seen
  (team-grouped CV R^2 is negative for both the linear and GBT specs), not just weak predictive
  power -- this is from the GBT+SHAP leakage check, which stayed in scope (gradient boosting and
  SHAP were both taught).
- `05`'s accessibility-driven lift range comes from only 3 comparable relocations (KC excluded,
  its attendance change is capacity-suppressed) -- a small-sample descriptive range, not an
  inferential estimate with a confidence interval.
- `03`'s finding rules out a general "accessibility whitens/enriches fanbases" mechanism, but
  with only 5 relocations total, it can't rule out smaller or more conditional effects either.
- `12`'s CatBoost model corroborates `05`'s synthetic control range in direction and mechanism
  (SHAP: `metro_size` is the top positive driver) but shouldn't be read as
  independent confirmation of a precise magnitude -- LOTO generalization is real but modest, and
  both approaches hit the same ~4-5-relocation-event ceiling regardless of how precisely
  accessibility is measured.
- ~8% of the full attendance panel (NWSL + MLS) is capacity-censored -- teams reporting a fixed
  "sold out" figure instead of real turnout, confirmed directly for Kansas City Current (every
  2024-2026 home game: identical 11,500). Excluded from `11`'s training table; worth checking
  for in any future extension of this panel, not assumed fixed once and forgotten.
