import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { DataPoint, AlertLevel } from '../../types';

interface Props {
  data: DataPoint[];
  status: AlertLevel;
  height?: number;
}

const STROKE: Record<AlertLevel, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

const FILL: Record<AlertLevel, string> = {
  green: 'rgba(34,197,94,0.15)',
  yellow: 'rgba(234,179,8,0.15)',
  red: 'rgba(239,68,68,0.15)',
};

export default function Sparkline({ data, status, height = 48 }: Props) {
  if (!data || data.length < 2) return <div style={{ height }} className="flex items-center justify-center text-slate-600 text-xs">Sin datos</div>;

  const chartData = data.slice(-20).map((p) => ({ v: p.value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`sg_${status}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={STROKE[status]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={STROKE[status]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={STROKE[status]}
          strokeWidth={1.5}
          fill={`url(#sg_${status})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
