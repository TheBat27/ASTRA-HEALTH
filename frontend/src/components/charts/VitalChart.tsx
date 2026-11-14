import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend
} from 'recharts';
import type { DataPoint, AlertLevel } from '../../types';
import { DEFAULT_THRESHOLDS } from '../../data/thresholds';
import type { VitalKey } from '../../types';
import { format } from 'date-fns';

interface Props {
  data: DataPoint[];
  vitalKey: VitalKey;
  unit: string;
  color?: string;
  height?: number;
  showThresholds?: boolean;
  name?: string;
}

const STATUS_COLOR: Record<AlertLevel, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

export default function VitalChart({
  data, vitalKey, unit, color = '#38bdf8', height = 200, showThresholds = true, name = 'Valor'
}: Props) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-slate-500 text-sm border border-white/5 rounded-lg">
        Datos insuficientes para mostrar la gráfica
      </div>
    );
  }

  const chartData = data.slice(-60).map((p) => ({
    t: format(new Date(p.timestamp), 'HH:mm:ss'),
    v: parseFloat(p.value.toFixed(2)),
  }));

  const t = DEFAULT_THRESHOLDS[vitalKey];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="t"
          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          unit={` ${unit}`}
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono',
          }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(v: number) => [`${v} ${unit}`, name]}
        />
        {showThresholds && t.warnHigh !== undefined && (
          <ReferenceLine y={t.warnHigh} stroke={STATUS_COLOR.yellow} strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `↑ ${t.warnHigh}`, fill: STATUS_COLOR.yellow, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
        )}
        {showThresholds && t.critHigh !== undefined && (
          <ReferenceLine y={t.critHigh} stroke={STATUS_COLOR.red} strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `↑ ${t.critHigh}`, fill: STATUS_COLOR.red, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
        )}
        {showThresholds && t.warnLow !== undefined && (
          <ReferenceLine y={t.warnLow} stroke={STATUS_COLOR.yellow} strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `↓ ${t.warnLow}`, fill: STATUS_COLOR.yellow, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
        )}
        {showThresholds && t.critLow !== undefined && (
          <ReferenceLine y={t.critLow} stroke={STATUS_COLOR.red} strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `↓ ${t.critLow}`, fill: STATUS_COLOR.red, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
        )}
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="v"
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
