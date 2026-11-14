import { Info } from 'lucide-react';
import { useState } from 'react';
import type { VitalSensor } from '../../types';
import Sparkline from '../../components/charts/Sparkline';
import TrendIcon from '../../components/ui/TrendIcon';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

interface Props {
  sensor: VitalSensor;
  invertTrend?: boolean;
}

const STATUS_RING: Record<string, string> = {
  green: 'ring-1 ring-green-500/30',
  yellow: 'ring-1 ring-yellow-500/40',
  red: 'ring-1 ring-red-500/50',
};

const STATUS_VALUE: Record<string, string> = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
};

export default function VitalCard({ sensor, invertTrend = false }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const ago = formatDistanceToNow(new Date(sensor.lastUpdated), { addSuffix: true, locale: es });

  if (!sensor.available) {
    return (
      <div className="rounded-xl border border-white/5 bg-space-800/40 p-4 flex flex-col gap-2">
        <div className="text-slate-400 text-sm font-medium">{sensor.name}</div>
        <div className="text-slate-600 text-xs">Sensor no disponible</div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-xl border border-white/5 bg-space-800/60 p-4 flex flex-col gap-3 transition-all duration-300 hover:bg-space-800/80 hover:border-white/10 relative',
      STATUS_RING[sensor.status],
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-300 text-sm font-medium leading-tight">{sensor.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TrendIcon trend={sensor.trend} size={12} invertColor={invertTrend} />
            <span className="text-slate-500 text-xs">{ago}</span>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
          aria-label="Información del sensor"
        >
          <Info size={14} />
        </button>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className={clsx('text-2xl font-bold font-mono tracking-tight', STATUS_VALUE[sensor.status])}>
          {typeof sensor.current === 'number' ? sensor.current.toFixed(sensor.unit === '%' || sensor.unit === '°C' ? 1 : sensor.unit === 'mSv' ? 2 : 0) : sensor.current}
        </span>
        <span className="text-slate-500 text-sm font-mono">{sensor.unit}</span>
      </div>

      {/* Sparkline */}
      <Sparkline data={sensor.history} status={sensor.status} height={44} />

      {/* Simulated badge */}
      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs font-mono">SIMULADO</span>
        {sensor.status !== 'green' && (
          <span className={clsx(
            'text-xs font-mono font-bold uppercase animate-pulse',
            sensor.status === 'red' ? 'text-red-400' : 'text-yellow-400'
          )}>
            {sensor.status === 'red' ? '⚠ ALERTA' : '▲ REVISAR'}
          </span>
        )}
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-space-700 border border-white/10 rounded-lg p-3 text-xs text-slate-300 shadow-xl z-10 animate-fade-in">
          <p className="font-medium text-white mb-1">{sensor.name}</p>
          <p className="text-slate-400">{sensor.description}</p>
          <p className="text-slate-500 mt-1 font-mono">Unidad: {sensor.unit}</p>
        </div>
      )}
    </div>
  );
}
