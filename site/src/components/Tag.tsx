export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono-label text-[11px] border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[var(--color-primary)]">
      {children}
    </span>
  )
}
