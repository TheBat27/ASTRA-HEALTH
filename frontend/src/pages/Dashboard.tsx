import { Activity, Wind, AlertTriangle, Shield, Brain, Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import VitalCard from '../components/telemetry/VitalCard';
import VitalChart from '../components/charts/VitalChart';
import CrewCard from '../components/crew/CrewCard';
import type { CrewMemberId, ScenarioId } from '../types';
import clsx from 'clsx';

// Mini scenario buttons for dashboard
const SCENARIO_BUTTONS: Array<{ id: ScenarioId; label: string; emoji: string; color: string }> = [
  { id: 'solar_storm',       label: 'Tormenta Solar', emoji: '☀️', color: 'bg-orange-500/15 border-orange-500/40 text-orange-300 hover:bg-orange-500/25' },
  { id: 'fatigue',           label: 'Fatiga',         emoji: '🔋', color: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/25' },
  { id: 'sleep_deprivation', label: 'Poco Sueño',     emoji: '🌙', color: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25' },
  { id: 'co2_high',          label: 'Aire Cargado',   emoji: '💨', color: 'bg-teal-500/15 border-teal-500/40 text-teal-300 hover:bg-teal-500/25' },
  { id: 'low_oxygen',        label: 'Oxígeno Bajo',   emoji: '🫧', color: 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25' },
];

type ChartRange = '1h' | '6h' | '24h' | '7d';
const CHART_RANGES: ChartRange[] = ['1h', '6h', '24h', '7d'];
const CHART_POINTS: Record<ChartRange, number> = { '1h': 20, '6h': 40, '24h': 60, '7d': 60 };

export default function Dashboard() {
  const { state, activeCrew, selectCrew, startScenario, stopScenario, acknowledgeAlert } = useApp();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<ChartRange>('24h');

  const telemetry = activeCrew.telemetry;
  const activeAlerts = state.alerts.filter(a => a.status === 'active');
  const topAlert = activeAlerts[0] ?? null;

  // Last cognitive result
  const lastCog = state.cognitiveResults[0] ?? null;

  function handleCrewClick(id: CrewMemberId) {
    selectCrew(id);
  }

  function handleScenarioClick(id: ScenarioId) {
    if (state.simulator.activeScenario === id) {
      stopScenario();
    } else {
      startScenario(id);
    }
  }

  const points = CHART_POINTS[chartRange];

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Row 1: Crew status + Active alert ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Crew grid — 2/3 width */}
        <div className="xl:col-span-2">
          <Panel padding={false}>
            <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={14} className="text-electric-400" />
                  Estado General de la Tripulación
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Todos los datos son simulados · ARTEMIS-VII</p>
              </div>
              <StatusBadge level={state.overallStatus} pulse size="sm" />
            </div>
            <div className="p-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {state.crew.map(member => {
                const memberAlerts = (state.allAlerts[member.id] ?? []).filter(a => a.status === 'active').length;
                return (
                  <CrewCard
                    key={member.id}
                    member={member}
                    isActive={member.id === state.activeCrewId}
                    alertCount={memberAlerts}
                    onClick={() => handleCrewClick(member.id)}
                  />
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Active alert panel — 1/3 */}
        <div>
          {topAlert ? (
            <Panel
              padding={false}
              glow={topAlert.level === 'red' ? 'red' : 'yellow'}
              className="h-full"
            >
              <div className={clsx(
                'px-4 py-2 flex items-center gap-2 border-b',
                topAlert.level === 'red' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
              )}>
                <AlertTriangle size={15} className={topAlert.level === 'red' ? 'text-red-400 animate-pulse' : 'text-yellow-400'} />
                <span className={clsx('font-bold text-sm', topAlert.level === 'red' ? 'text-red-300' : 'text-yellow-300')}>
                  ALERTA ACTIVA
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-lg shrink-0">
                    {activeCrew.avatarEmoji}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{activeCrew.callsign}</div>
                    <div className="text-slate-300 text-xs mt-0.5">{topAlert.vitalName}</div>
                    <div className={clsx('text-xs font-semibold mt-1', topAlert.level === 'red' ? 'text-red-400' : 'text-yellow-400')}>
                      Prioridad: {topAlert.level === 'red' ? 'Alta' : 'Media'}
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {topAlert.reason}
                </p>

                <div className="bg-space-900/60 rounded-lg p-2.5 text-xs">
                  <p className="text-slate-500 mb-1">Valor observado</p>
                  <p className="text-white font-mono">{topAlert.observedValue}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/alerts"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric-500/15 border border-electric-500/40 text-electric-400 text-xs font-medium hover:bg-electric-500/25 transition-all"
                  >
                    Ver detalles <ChevronRight size={11} />
                  </Link>
                  <button
                    onClick={() => acknowledgeAlert(topAlert.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/25 transition-all"
                  >
                    <CheckCircle size={12} />
                  </button>
                </div>
              </div>
              {activeAlerts.length > 1 && (
                <div className="px-4 pb-3">
                  <Link to="/alerts" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    +{activeAlerts.length - 1} alerta{activeAlerts.length > 2 ? 's' : ''} más →
                  </Link>
                </div>
              )}
            </Panel>
          ) : (
            <Panel className="h-full flex flex-col items-center justify-center text-center py-6" glow="none">
              <CheckCircle size={32} className="text-green-500/40 mb-2" />
              <p className="text-green-400 font-semibold text-sm">Sin alertas activas</p>
              <p className="text-slate-500 text-xs mt-1 max-w-[160px]">
                Todos los indicadores dentro de los parámetros configurados
              </p>
            </Panel>
          )}
        </div>
      </div>

      {/* ── Row 2: Telemetry cards ──────────────────────────── */}
      <Panel padding={false}>
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            Telemetría en Tiempo Real
            <span className="text-xs text-slate-500 font-normal">· {activeCrew.callsign} · {activeCrew.name}</span>
          </h2>
          <span className="text-xs font-mono text-orange-400 border border-orange-500/20 rounded px-2 py-0.5 bg-orange-500/5">SIMULADO</span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
          <VitalCard sensor={telemetry.heartRate} />
          <VitalCard sensor={telemetry.spO2} />
          <VitalCard sensor={telemetry.bodyTemp} />
          <VitalCard sensor={telemetry.respRate} />
          <VitalCard sensor={telemetry.sleepHours} />
          <VitalCard sensor={telemetry.radiationRate} invertTrend />
          <VitalCard sensor={telemetry.radiationAccum} invertTrend />
          <VitalCard sensor={telemetry.co2} invertTrend />
          <VitalCard sensor={telemetry.fatigue} invertTrend />
          <VitalCard sensor={telemetry.stress} invertTrend />
        </div>
      </Panel>

      {/* ── Row 3: Chart + Cognitive + Simulator ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Evolution chart — 3/5 */}
        <Panel className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={14} className="text-electric-400" />
              Evolución de Indicadores
            </h3>
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              {CHART_RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={clsx(
                    'px-2.5 py-1 text-xs font-mono transition-colors',
                    chartRange === r ? 'bg-electric-500/20 text-electric-400' : 'text-slate-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <VitalChart
            data={telemetry.heartRate.history.slice(-points)}
            vitalKey="heartRate"
            unit="bpm"
            color="#38bdf8"
            name="FC"
            height={200}
            showThresholds
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <VitalChart
              data={telemetry.spO2.history.slice(-points)}
              vitalKey="spO2"
              unit="%"
              color="#22d3ee"
              name="SpO₂"
              height={120}
              showThresholds
            />
            <VitalChart
              data={telemetry.bodyTemp.history.slice(-points)}
              vitalKey="bodyTemp"
              unit="°C"
              color="#a78bfa"
              name="Temp."
              height={120}
              showThresholds
            />
          </div>
        </Panel>

        {/* Right column: Cognitive + Simulator — 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Cognitive test summary */}
          <Panel>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Brain size={14} className="text-purple-400" />
              Test Cognitivo y Bienestar
            </h3>
            {lastCog ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  {/* Circular score indicator */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={lastCog.correct / (lastCog.trials.length || 1) > 0.8 ? '#22c55e' : '#eab308'}
                        strokeWidth="2.5"
                        strokeDasharray={`${((lastCog.correct / (lastCog.trials.length || 1)) * 100).toFixed(0)} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white font-mono">
                        {((lastCog.correct / (lastCog.trials.length || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400 text-xs">Última prueba: {
                      (() => {
                        const diff = Date.now() - lastCog.completedAt;
                        if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`;
                        if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} h`;
                        return new Date(lastCog.completedAt).toLocaleDateString('es');
                      })()
                    }</div>
                    <div className="text-white font-mono text-sm font-bold">
                      {lastCog.medianRT ? `${lastCog.medianRT.toFixed(0)} ms` : 'N/A'}
                      <span className="text-slate-500 text-xs font-sans ml-1">TR mediano</span>
                    </div>
                  </div>
                </div>

                {lastCog.wellness && (
                  <div className="space-y-1.5">
                    {[
                      { label: '¿Cómo te sientes?', value: lastCog.wellness.mood },
                      { label: '¿Nivel de estrés?', value: lastCog.wellness.stress },
                      { label: '¿Nivel de fatiga?', value: lastCog.wellness.fatigue },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(v => (
                            <div key={v} className={clsx(
                              'w-3 h-3 rounded-full border',
                              v <= value ? 'bg-purple-400 border-purple-300' : 'bg-transparent border-white/20'
                            )} />
                          ))}
                          <span className="text-white font-mono ml-1">{value}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">Sin pruebas anteriores</p>
              </div>
            )}
            <Link
              to="/cognitive"
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-all"
            >
              <Brain size={13} /> Realizar Nueva Prueba
            </Link>
          </Panel>

          {/* Simulator mini-panel */}
          <Panel>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Zap size={14} className="text-orange-400" />
              Simulador de Misión
              <span className="text-xs text-slate-500 font-normal">Prueba escenarios de riesgo</span>
            </h3>
            <div className="space-y-2">
              {SCENARIO_BUTTONS.map(({ id, label, emoji, color }) => {
                const isActive = state.simulator.activeScenario === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleScenarioClick(id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-white/10 border-white/30 text-white scale-[0.99]'
                        : color,
                    )}
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="flex-1 text-left">{label}</span>
                    {isActive && (
                      <span className="text-[10px] font-mono bg-white/20 rounded px-1.5 py-0.5 animate-pulse">
                        ACTIVO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <Link
              to="/simulator"
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-space-700 border border-white/10 text-slate-400 text-xs hover:border-white/20 hover:text-white transition-all"
            >
              Gestionar simulador <ChevronRight size={12} />
            </Link>
          </Panel>

          {/* Contramedidas mini */}
          {activeAlerts.length > 0 && (
            <Panel glow={activeAlerts[0].level === 'red' ? 'red' : 'yellow'}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Shield size={14} className="text-green-400" />
                Contramedidas Recomendadas
              </h3>
              <p className="text-slate-400 text-xs mb-2">Para: <span className="text-white font-semibold">{activeCrew.callsign}</span></p>
              <div className="space-y-1 text-xs text-slate-300 mb-3">
                {/* Show first few steps from first countermeasure */}
                {[
                  'Seguir el protocolo de misión correspondiente.',
                  'Registrar el evento en el historial.',
                  'Notificar al equipo médico si persiste.',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-electric-400 font-mono shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/countermeasures"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-electric-500/15 border border-electric-500/30 text-electric-400 text-xs font-medium hover:bg-electric-500/25 transition-all"
              >
                Registrar Acción <ChevronRight size={12} />
              </Link>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
