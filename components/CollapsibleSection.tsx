import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen || undefined}
      className="group rounded-xl border border-border bg-white/80"
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 text-left text-text min-h-[44px] list-none [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-base">
          {icon && <span className="mr-1.5">{icon}</span>}
          {title}
        </span>
        <span className="text-text-muted transition-transform duration-300 group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
