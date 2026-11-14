import { Play, Pause, RotateCcw, Activity, Wind } from 'lucide-react';
import { useApp } from '../store/AppContext';
import VitalCard from '../components/telemetry/VitalCard';
import VitalChart from '../components/charts/VitalChart';
import Panel from '../components/ui/Panel';
import type { VitalKey } from '../types';

type TimeRange = '1h' | '6h' | '24h' | 'all';

const RANGES: { label: string; value: TimeRange; points: number }[] = [
  { label: '10 min', value: '1h', points: 20 },
  { label: '30 min', value: '6h', points: 40 },
  { label: 'Todo', value: '24h', points: 9999 },
];

import { useState } from 'react';

export default function Telemetry() {
  const { state, pauseScenario, resumeScenario, resetScenario, activeCrew } = useApp();
  const { isSimRunning } = state;
  const telemetry = activeCrew.telemetry;
  const [range, setRange] = useState<TimeRange>('24h');
  const selectedPoints = RANGES.find(r => r.value === range)?.points ?? 9999;

  function sliceHistory(key: VitalKey) {
    return telemetry[key].history.slice(-selectedPoints);
  }

  const VITALS_HEALTH: VitalKey[] = ['heartRate', 'spO2', 'bodyTemp', 'respRate', 'sleepHours', 'fatigue', 'stress'];
  const VITALS_ENV: VitalKey[] = ['radiationRate', 'radiationAccum', 'co2'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Telemetría en Vivo</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            <span className="text-electric-400 font-semibold">{activeCrew.callsign} · {activeCrew.name}</span> · Todos los datos son simulados · Actualización automática cada 3 s
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex border border-white/10 rounded-lg overflow-hidden">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${range === r.value ? 'bg-electric-500/20 text-electric-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => isSimRunning ? pauseScenario() : resumeScenario()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${isSimRunning ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'}`}
          >
            {isSimRunning ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reanudar</>}
          </button>
          <button
            onClick={resetScenario}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-space-700 border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all"
          >
            <RotateCcw size={14} /> Reiniciar
          </button>
        </div>
      </div>

      {/* Health cards */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity size={12} /> Salud del Astronauta
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {VITALS_HEALTH.map(key => (
            <VitalCard key={key} sensor={telemetry[key]} invertTrend={key === 'fatigue' || key === 'stress'} />
          ))}
        </div>
      </div>

      {/* Environment cards */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Wind size={12} /> Ambiente de la Nave
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VITALS_ENV.map(key => (
            <VitalCard key={key} sensor={telemetry[key]} invertTrend />
          ))}
        </div>
      </div>

      {/* Detailed charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {([
          { key: 'heartRate' as VitalKey, label: 'Frecuencia Cardíaca', unit: 'bpm', color: '#38bdf8' },
          { key: 'spO2' as VitalKey, label: 'Saturación O₂', unit: '%', color: '#22d3ee' },
          { key: 'bodyTemp' as VitalKey, label: 'Temperatura Corporal', unit: '°C', color: '#a78bfa' },
          { key: 'respRate' as VitalKey, label: 'Frecuencia Respiratoria', unit: 'rpm', color: '#34d399' },
          { key: 'fatigue' as VitalKey, label: 'Fatiga', unit: '/10', color: '#fbbf24' },
          { key: 'stress' as VitalKey, label: 'Estrés Percibido', unit: '/10', color: '#f97316' },
          { key: 'radiationRate' as VitalKey, label: 'Tasa de Dosis Radiación', unit: 'mSv/h', color: '#fb923c' },
          { key: 'radiationAccum' as VitalKey, label: 'Dosis Acumulada Radiación', unit: 'mSv', color: '#ef4444' },
          { key: 'co2' as VitalKey, label: 'CO₂ de Cabina', unit: 'ppm', color: '#2dd4bf' },
          { key: 'sleepHours' as VitalKey, label: 'Horas de Sueño', unit: 'h', color: '#818cf8' },
        ]).map(({ key, label, unit, color }) => (
          <Panel key={key}>
            <h3 className="text-sm font-semibold text-white mb-3">{label}</h3>
            <VitalChart
              data={sliceHistory(key)}
              vitalKey={key}
              unit={unit}
              color={color}
              name={label}
              height={180}
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
