import type { AlertLevel } from '../../types';

interface Props {
  level: AlertLevel;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS: Record<AlertLevel, string> = {
  green: 'bg-green-500/20 text-green-400 border-green-500/40',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  red: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const DOT_COLORS: Record<AlertLevel, string> = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
};

const LABELS: Record<AlertLevel, string> = {
  green: 'NORMAL',
  yellow: 'ADVERTENCIA',
  red: 'ALERTA',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function StatusBadge({ level, label, pulse = false, size = 'md' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold tracking-wider ${COLORS[level]} ${SIZES[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[level]} ${pulse && level !== 'green' ? 'animate-pulse' : ''}`} />
      {label ?? LABELS[level]}
    </span>
  );
}
