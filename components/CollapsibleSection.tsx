'use client';

import { type ReactNode, useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-white/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 text-left text-text min-h-[44px] cursor-pointer"
      >
        <span className="font-semibold text-base">
          {icon && <span className="mr-1.5">{icon}</span>}
          {title}
        </span>
        <span
          className="text-text-muted transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? '1000px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
