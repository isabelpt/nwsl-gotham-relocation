"""
Shared visual theme for every notebook in this project.

Import this from any notebook in code/ (they live in the same folder, so a
plain `import plot_theme` or `from plot_theme import ...` works with no path
setup) and call `set_mpl_theme()` once near the top, then wrap Plotly figures
with `style_plotly_fig(fig)` before showing/saving them.

Palette: a brighter, higher-chroma categorical set anchored on the site's own
navy + light-purple brand hues, validated against the six-check method in the
`dataviz` skill (fixed hue order, OKLCH lightness band, chroma floor, CVD
separation, normal-vision floor, contrast vs. surface) — run
`node scripts/validate_palette.js "<hexes>" --mode light` from the skill's
`references/` tooling to re-check if you ever change a slot. The site's own
muted navy/lilac/terracotta tokens read fine as small UI accents but FAIL the
chroma-floor and lightness-band checks as *chart* colors (they read gray at a
glance) — this palette keeps the same two brand hues but re-steps them
brighter specifically so they hold up as data-ink. See site/STYLE_GUIDE tokens
for the site's own (unchanged) UI palette in site/src/index.css.
"""

import matplotlib.pyplot as plt
import matplotlib as mpl

# --- Site UI tokens (site/src/index.css) — used for chart chrome (paper
# background, ink text, hairline gridlines) but NOT for data-ink; see
# NWSL_PALETTE below for why. -------------------------------------------
COLOR_INK = "#1b2430"
COLOR_PAPER = "#fbfaf8"
COLOR_PAPER_ALT = "#f2efe9"
COLOR_LINE = "#e3ddd3"

# --- Chart categorical palette (validated) ----------------------------------
# Fixed hue order — never cycled, never re-sorted per chart. Passes all six
# dataviz-skill checks (one WARN-band CVD pair, legal because every chart
# using it also carries a legend and/or direct value labels as the required
# secondary encoding).
COLOR_NAVY = "#1f5fa8"     # brighter re-step of the site's navy — primary series
COLOR_GOLD = "#b8790f"
COLOR_TEAL = "#1f9985"
COLOR_PLUM = "#b23a72"
COLOR_VIOLET = "#8b5cf6"   # brighter re-step of the site's lilac accent
COLOR_CORAL = "#e2574c"    # negative/decline pole — replaces the old dull terracotta

COLOR_PRIMARY = COLOR_NAVY       # positive pole / primary series (semantic alias)
COLOR_PRIMARY_DEEP = "#14263f"   # still used for title text — matches the site's darkest navy
COLOR_ACCENT = COLOR_VIOLET
COLOR_NEGATIVE = COLOR_CORAL

NWSL_PALETTE = [COLOR_NAVY, COLOR_GOLD, COLOR_TEAL, COLOR_PLUM, COLOR_VIOLET, COLOR_CORAL]

# Sequential scale (paper -> navy) for continuous color encodings (attendance
# heat/size gradients, choropleths, etc.)
NWSL_SEQUENTIAL = [COLOR_PAPER_ALT, "#c7d9ef", "#8fb3df", "#4a80bf", COLOR_NAVY]

# Diverging scale (coral -> paper -> navy) for lift/premium charts: positive =
# navy, negative = coral, neutral gray-paper midpoint — never a hue at the
# midpoint.
NWSL_DIVERGING = [COLOR_CORAL, "#f0b6ad", COLOR_PAPER_ALT, "#a9c3e0", COLOR_NAVY]

PLOTLY_TEMPLATE = "plotly_white"

# Font stacks matching the site's type system (site/src/index.css):
# serif for headings/titles, humanist sans for everything else. Uses system
# fallbacks since matplotlib/plotly can't load the site's Google Fonts.
FONT_SERIF = "Georgia, Source Serif 4, serif"
FONT_SANS = "Helvetica Neue, Arial, Inter, sans-serif"


def set_mpl_theme():
    """Apply the shared matplotlib theme. Call once near the top of a notebook."""
    plt.rcdefaults()
    mpl.rcParams.update({
        "axes.prop_cycle": mpl.cycler(color=NWSL_PALETTE),
        "font.family": "sans-serif",
        "font.sans-serif": ["Helvetica Neue", "Arial", "DejaVu Sans"],
        "text.color": COLOR_INK,
        "axes.titleweight": "bold",
        "axes.titlesize": 13,
        "axes.titlecolor": COLOR_PRIMARY_DEEP,
        "axes.labelsize": 11,
        "axes.labelcolor": COLOR_INK,
        "axes.edgecolor": COLOR_LINE,
        "axes.linewidth": 1.0,
        "xtick.color": COLOR_INK,
        "ytick.color": COLOR_INK,
        "figure.facecolor": COLOR_PAPER,
        "axes.facecolor": COLOR_PAPER,
        "savefig.facecolor": COLOR_PAPER,
        "axes.grid": True,
        "axes.axisbelow": True,  # grid + spines render behind bars/lines/markers, not on top
        "grid.color": COLOR_LINE,
        "grid.linewidth": 0.8,
        "grid.alpha": 1.0,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "legend.frameon": False,
        "legend.labelcolor": COLOR_INK,
    })


def style_plotly_fig(fig, title=None):
    """Apply the shared Plotly theme/colorway to a figure in place (also returns it)."""
    fig.update_layout(
        template=PLOTLY_TEMPLATE,
        colorway=NWSL_PALETTE,
        font=dict(family=FONT_SANS, color=COLOR_INK),
        paper_bgcolor=COLOR_PAPER,
        plot_bgcolor=COLOR_PAPER,
        title_font=dict(family=FONT_SERIF, color=COLOR_PRIMARY_DEEP),
    )
    fig.update_xaxes(gridcolor=COLOR_LINE, linecolor=COLOR_LINE, zerolinecolor=COLOR_LINE)
    fig.update_yaxes(gridcolor=COLOR_LINE, linecolor=COLOR_LINE, zerolinecolor=COLOR_LINE)
    if title is not None:
        fig.update_layout(title=title)
    return fig
