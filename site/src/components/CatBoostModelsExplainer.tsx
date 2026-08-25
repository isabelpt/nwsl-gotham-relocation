const MODELS = [
  {
    tag: '1',
    name: 'Naive 80/20 split',
    role: "One model, fit on a random 80% of rows. Gotham's other seasons can leak into its own held-out fold, so this is the model behind the optimistic-looking r = 0.867.",
    use: 'Diagnostic only — discarded after use',
    accent: false,
  },
  {
    tag: '2',
    name: 'LOTO (14 throwaway models)',
    role: 'Refit once per team, that team fully excluded each time, tested only on the held-out team. This is the honest generalization check — pooled r = 0.496.',
    use: 'Diagnostic only — discarded after use',
    accent: false,
  },
  {
    tag: '3',
    name: 'final_model',
    role: 'Fit once on every team-season, Gotham included. Not tested on a held-out team — this is the model actually used to answer the question.',
    use: 'Produces the Queens prediction + the SHAP mechanism check',
    accent: true,
  },
]

export default function CatBoostModelsExplainer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {MODELS.map((m) => (
        <div
          key={m.tag}
          className={
            m.accent
              ? 'border border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white p-5'
              : 'border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-5'
          }
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={
                m.accent
                  ? 'font-mono text-xs font-semibold w-5 h-5 flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-primary-deep)]'
                  : 'font-mono text-xs font-semibold w-5 h-5 flex items-center justify-center bg-[var(--color-primary)] text-white'
              }
            >
              {m.tag}
            </span>
            <p className={m.accent ? 'font-serif-heading text-base font-semibold' : 'font-serif-heading text-base font-semibold text-[var(--color-primary-deep)]'}>
              {m.name}
            </p>
          </div>
          <p className={m.accent ? 'text-sm text-white/85 leading-relaxed' : 'text-sm text-[var(--color-ink)]/75 leading-relaxed'}>
            {m.role}
          </p>
          <p
            className={
              m.accent
                ? 'font-mono-label text-[10px] text-[var(--color-accent)] mt-3'
                : 'font-mono-label text-[10px] text-[var(--color-primary)]/70 mt-3'
            }
          >
            {m.use}
          </p>
        </div>
      ))}
    </div>
  )
}
