type TallyBarProps = { yes: number; no: number; abstain: number };

const ROWS = [
  { key: "yes", label: "Yes", bar: "bg-emerald-400" },
  { key: "no", label: "No", bar: "bg-rose-400" },
  { key: "abstain", label: "Abstain", bar: "bg-zinc-500" },
] as const;

export function TallyBar({ yes, no, abstain }: TallyBarProps) {
  const counts = { yes, no, abstain };
  const total = yes + no + abstain;

  return (
    <div className="space-y-5">
      {ROWS.map(({ key, label, bar }) => {
        const count = counts[key];
        const pct = total === 0 ? 0 : Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-zinc-200">{label}</span>
              <span className="text-sm tabular-nums text-zinc-400">
                {count}
                <span className="ml-2 inline-block w-10 text-right text-xs text-zinc-500">
                  {pct}%
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${bar} transition-[width] duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
