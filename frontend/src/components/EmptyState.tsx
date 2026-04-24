import type { ReactNode } from "react";
import { IconSparkle } from "./icons";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 p-10 text-center">
      <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-700 bg-gradient-to-br from-brand/15 to-accent-cyan/10 text-brand-300">
        <span className="glitch">
          {icon ?? <IconSparkle size={28} gradient />}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
