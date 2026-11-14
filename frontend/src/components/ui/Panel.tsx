import type { ReactNode } from 'react';
import clsx from 'clsx';

interface Props {
  children: ReactNode;
  className?: string;
  glow?: 'green' | 'yellow' | 'red' | 'blue' | 'none';
  padding?: boolean;
}

const GLOW: Record<string, string> = {
  green: 'shadow-[0_0_20px_rgba(34,197,94,0.1)] border-green-500/20',
  yellow: 'shadow-[0_0_20px_rgba(234,179,8,0.1)] border-yellow-500/20',
  red: 'shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-500/30',
  blue: 'shadow-[0_0_20px_rgba(14,165,233,0.1)] border-electric-500/20',
  none: 'border-white/5',
};

export default function Panel({ children, className, glow = 'none', padding = true }: Props) {
  return (
    <div
      className={clsx(
        'rounded-xl border bg-space-800/60 backdrop-blur-sm',
        GLOW[glow],
        padding && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
