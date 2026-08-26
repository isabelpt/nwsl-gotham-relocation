import { useEffect, useRef, useState } from "react";
import IsochroneMap, { IsochroneMapHandle } from "./IsochroneMap";
import { ClusterInfo, MapView, SITE_CONFIG, SiteLabel, StatsFile, THRESHOLDS, Threshold } from "./types";

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

const VIEW_OPTIONS: { key: MapView; label: string }[] = [
  { key: "accessibility", label: "Accessibility comparison" },
  { key: "clusters", label: "Demographic clusters" },
];

export default function App() {
  const [view, setView] = useState<MapView>("accessibility");
  const [threshold, setThreshold] = useState<Threshold>(60);
  const [stats, setStats] = useState<StatsFile | null>(null);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [hoverProps, setHoverProps] = useState<Record<string, unknown> | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const mapRef = useRef<IsochroneMapHandle>(null);

  useEffect(() => {
    fetch("./data/stats.json")
      .then((r) => r.json())
      .then(setStats);
    fetch("./data/clusters.json")
      .then((r) => r.json())
      .then(setClusters);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchText.trim() || !mapRef.current) return;
    setSearchStatus("loading");
    setSearchError(null);
    const result = await mapRef.current.searchAddress(searchText.trim());
    if (result.ok) {
      setSearchStatus("idle");
    } else {
      setSearchStatus("error");
      setSearchError(result.error);
    }
  }

  const isClusters = view === "clusters";
  const hoverRba = hoverProps?.[SITE_CONFIG.current.minutesField];
  const hoverEtihad = hoverProps?.[SITE_CONFIG.future.minutesField];
  const hoverCluster =
    hoverProps?.cluster != null ? clusters.find((c) => c.id === Number(hoverProps.cluster)) : undefined;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <aside
        style={{
          width: 320,
          flexShrink: 0,
          padding: "1.5rem",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: "1.15rem", lineHeight: 1.3, marginBottom: "0.25rem" }}>
          Gotham FC's Move to Queens
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#555", marginTop: 0 }}>
          Transit + walk accessibility, Sports Illustrated Stadium vs. Etihad Park (opening 2027)
        </p>

        <form onSubmit={handleSearch} style={{ marginTop: "1rem", display: "flex", gap: "0.4rem" }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search an address..."
            style={{
              flex: 1,
              padding: "0.45rem 0.6rem",
              fontSize: "0.85rem",
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />
          <button
            type="submit"
            disabled={searchStatus === "loading"}
            style={{
              padding: "0.45rem 0.7rem",
              fontSize: "0.85rem",
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#f7f6f3",
              cursor: "pointer",
            }}
          >
            {searchStatus === "loading" ? "..." : "Go"}
          </button>
        </form>
        {searchStatus === "error" && (
          <div style={{ color: "#c0392b", fontSize: "0.75rem", marginTop: "0.3rem" }}>{searchError}</div>
        )}

        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem",
            border: "1px solid #333",
            borderRadius: 8,
            fontSize: "0.85rem",
            color: "#1a1a2e",
            background: "#fbfaf7",
            minHeight: "3.8rem",
          }}
        >
          {hoverProps ? (
            <>
              <div style={{ fontWeight: 700 }}>
                {hoverProps.neighborhood ? String(hoverProps.neighborhood) : `Tract ${String(hoverProps.GEOID)}`}
              </div>
              <div style={{ color: "#999", fontSize: "0.72rem", marginBottom: "0.3rem" }}>
                {hoverProps.neighborhood ? `Tract ${String(hoverProps.GEOID)}` : "No NYC neighborhood match (NJ side)"}
              </div>
              {isClusters ? (
                hoverCluster ? (
                  <>
                    <div>{hoverCluster.name}</div>
                    {hoverProps.delta_transit_time != null && (
                      <div>
                        {Number(hoverProps.delta_transit_time) < 0 ? "▼" : "▲"}{" "}
                        {Math.abs(Math.round(Number(hoverProps.delta_transit_time)))} min{" "}
                        {Number(hoverProps.delta_transit_time) < 0 ? "faster" : "slower"} after the move
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: "#999" }}>Not in the clustered analysis</div>
                )
              ) : (
                <>
                  <div>Sports Illustrated Stadium: {hoverRba != null ? `${Math.round(Number(hoverRba))} min` : "90+ min"}</div>
                  <div>Etihad Park: {hoverEtihad != null ? `${Math.round(Number(hoverEtihad))} min` : "90+ min"}</div>
                </>
              )}
              <div>Population: {Number(hoverProps.population ?? 0).toLocaleString()}</div>
            </>
          ) : (
            <span style={{ color: "#aaa" }}>Hover or search a tract for details</span>
          )}
        </div>

        <div
          role="tablist"
          style={{
            display: "flex",
            marginTop: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              role="tab"
              aria-selected={view === opt.key}
              onClick={() => setView(opt.key)}
              style={{
                flex: 1,
                padding: "0.5rem 0.4rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: view === opt.key ? "#1a1a2e" : "#fff",
                color: view === opt.key ? "#fff" : "#333",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {!isClusters && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Travel time threshold: {threshold} min
            </div>
            <input
              type="range"
              min={0}
              max={THRESHOLDS.length - 1}
              step={1}
              value={THRESHOLDS.indexOf(threshold)}
              onChange={(e) => setThreshold(THRESHOLDS[Number(e.target.value)])}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#777" }}>
              {THRESHOLDS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#999", marginTop: "0.3rem" }}>
              Shading shows tracts reachable within {threshold} min from at least one stadium.
            </div>
          </div>
        )}

        {isClusters ? (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f7f6f3",
              borderRadius: 8,
              fontSize: "0.8rem",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.6rem" }}>
              Tract clusters (income, race/ethnicity, reach)
            </div>
            {clusters.length === 0 ? (
              <div style={{ color: "#999" }}>Loading...</div>
            ) : (
              clusters.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c.color,
                      flexShrink: 0,
                      marginTop: "0.2rem",
                    }}
                  />
                  <div>
                    <div>{c.name}</div>
                    <div style={{ color: "#888", fontSize: "0.72rem" }}>
                      {formatPopulation(c.population)} people, {c.n_tracts} tracts, median income $
                      {c.median_household_income.toLocaleString()}
                    </div>
                    <div
                      style={{
                        color: c.avg_delta_transit_min < 0 ? "#1a7d4f" : "#c0392b",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        marginTop: "0.15rem",
                      }}
                    >
                      {c.avg_delta_transit_min < 0 ? "▼" : "▲"}{" "}
                      {Math.abs(Math.round(c.avg_delta_transit_min))} min{" "}
                      {c.avg_delta_transit_min < 0 ? "faster" : "slower"} on average (
                      {Math.round(c.pct_gaining_access * 100)}% of tracts gain access)
                    </div>
                  </div>
                </div>
              ))
            )}
            <div style={{ color: "#999", fontSize: "0.72rem", marginTop: "0.4rem" }}>
              K-means on demographics + decay-weighted accessibility (
              <code>code/supplementary/08_tract_clustering.ipynb</code>). Arrows show the average change in transit
              time to the stadium, future vs. current. Tracts outside that analysis are hidden.
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#f7f6f3",
                borderRadius: 8,
                fontSize: "0.85rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Reading the comparison</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <span
                  style={{ width: 10, height: 10, borderRadius: "50%", background: SITE_CONFIG.current.color }}
                />
                Sports Illustrated Stadium is faster
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span
                  style={{ width: 10, height: 10, borderRadius: "50%", background: SITE_CONFIG.future.color }}
                />
                Etihad Park is faster
              </div>
              <div style={{ color: "#999", marginTop: "0.4rem", fontSize: "0.75rem" }}>
                Near-white tracts are roughly a wash between the two.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
              {(["current", "future"] as SiteLabel[]).map((key) => {
                const cfg = SITE_CONFIG[key];
                const stat = stats?.[key]?.by_threshold[String(threshold)];
                return (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#f7f6f3",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: cfg.color }}>{cfg.label}</div>
                    {stat ? (
                      <>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                          {formatPopulation(stat.reachable_population)}
                        </div>
                        <div style={{ color: "#666", fontSize: "0.72rem" }}>
                          {stat.reachable_tracts.toLocaleString()} tracts
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#999" }}>Loading...</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p style={{ fontSize: "0.7rem", color: "#999", marginTop: "1.5rem", lineHeight: 1.4 }}>
          Travel times computed with r5py (transit + 5.0 km/h walk speed), Saturday 6pm departure.
          Isochrone bands, clusters, and transit lines are pre-computed, not routed live in-browser.
        </p>
      </aside>
      <main style={{ flex: 1 }}>
        <IsochroneMap
          ref={mapRef}
          view={view}
          threshold={threshold}
          clusters={clusters}
          onTractHover={setHoverProps}
        />
      </main>
    </div>
  );
}
