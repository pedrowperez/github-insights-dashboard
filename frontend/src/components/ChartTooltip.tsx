import { formatFull } from './ui';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-card backdrop-blur dark:border-white/10 dark:bg-night-700/95">
      {label && (
        <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-500 dark:text-slate-400">
              {item.name}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {formatFull(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
