import { Play, Square, RotateCcw, Zap, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { SCENARIOS } from '../data/scenarios';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import type { ScenarioId } from '../types';
import clsx from 'clsx';

// The 5 demo buttons in required order
const DEMO_BUTTONS: ScenarioId[] = [
  'solar_storm',
  'fatigue',
  'sleep_deprivation',
  'co2_high',
  'low_oxygen',
];

export default function Simulator() {
  const { state, startScenario, stopScenario, resetScenario, pauseScenario, resumeScenario, activeCrew } = useApp();
  const { simulator, isSimRunning, overallStatus, alerts } = state;

  const activeScenarioConfig = SCENARIOS.find(s => s.id === simulator.activeScenario);
  const recentAlerts = alerts.filter(a => a.status === 'active').slice(0, 3);

  const demoScenarios = SCENARIOS.filter(s => DEMO_BUTTONS.includes(s.id as ScenarioId));

  function getButtonStyle(scenarioId: string): string {
    const isActive = simulator.activeScenario === scenarioId;
    if (scenarioId === 'solar_storm') return isActive ? 'bg-orange-500 text-white border-orange-400' : 'bg-orange-500/15 text-orange-300 border-orange-500/40 hover:bg-orange-500/30';
    if (scenarioId === 'fatigue') return isActive ? 'bg-yellow-500 text-white border-yellow-400' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30';
    if (scenarioId === 'sleep_deprivation') return isActive ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30';
    if (scenarioId === 'co2_high') return isActive ? 'bg-teal-500 text-white border-teal-400' : 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/30';
    if (scenarioId === 'low_oxygen') return isActive ? 'bg-red-600 text-white border-red-400' : 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/30';
    return 'bg-space-700 text-slate-300 border-white/10 hover:border-white/20';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Simulador de Misión</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Escenarios aplicados a: <span className="text-electric-400 font-semibold">{activeCrew.callsign} · {activeCrew.name}</span>
          {' '}· Todos los escenarios son <strong className="text-orange-400">SIMULACIONES</strong>.
        </p>
      </div>

      {/* Disclaimer */}
      <Panel className="border-orange-500/20 bg-orange-500/5">
        <div className="flex gap-3">
          <Info size={16} className="text-orange-400 mt-0.5 shrink-0" />
          <p className="text-orange-200 text-sm">
            Los escenarios modifican los datos simulados de telemetría y activan el motor de reglas para demostrar el flujo completo de detección de anomalías y contramedidas.
            Los cambios son reversibles con el botón <strong>Reiniciar</strong>.
          </p>
        </div>
      </Panel>

      {/* Status bar */}
      <Panel>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase">Estado General</p>
              <div className="mt-1"><StatusBadge level={overallStatus} size="lg" pulse /></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase">Escenario Activo</p>
              <p className="text-white font-semibold mt-1 text-sm">
                {activeScenarioConfig?.name ?? 'Ninguno'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase">Simulación</p>
              <p className={`font-semibold mt-1 text-sm ${isSimRunning ? 'text-green-400' : 'text-yellow-400'}`}>
                {isSimRunning ? '⬤ Activa' : '⏸ Pausada'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => isSimRunning ? pauseScenario() : resumeScenario()}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                isSimRunning
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                  : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
              )}
            >
              {isSimRunning ? <><Square size={14} /> Pausar</> : <><Play size={14} /> Reanudar</>}
            </button>
            <button
              onClick={resetScenario}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-space-700 border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all"
            >
              <RotateCcw size={14} /> Reiniciar
            </button>
          </div>
        </div>
      </Panel>

      {/* THE 5 BIG BUTTONS */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
          Escenarios de Demostración
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {demoScenarios.map(scenario => {
            const isActive = simulator.activeScenario === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => isActive ? stopScenario() : startScenario(scenario.id as ScenarioId)}
                className={clsx(
                  'flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 font-bold text-sm uppercase tracking-wider transition-all duration-200 min-h-[140px] relative',
                  getButtonStyle(scenario.id),
                  isActive ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
                )}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 text-xs font-mono bg-black/30 rounded-full px-2 py-0.5 animate-pulse">
                    ACTIVO
                  </span>
                )}
                <span className="text-3xl" role="img" aria-label={scenario.name}>
                  {scenario.id === 'solar_storm' ? '☀️' :
                   scenario.id === 'fatigue' ? '🔋' :
                   scenario.id === 'sleep_deprivation' ? '🌙' :
                   scenario.id === 'co2_high' ? '💨' : '🫧'}
                </span>
                <span className="text-center leading-tight">{scenario.name}</span>
                <span className="text-xs font-normal opacity-70 text-center leading-tight normal-case font-sans">
                  {scenario.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <Panel>
        <h3 className="text-sm font-semibold text-white mb-3">Flujo de un escenario</h3>
        <ol className="space-y-2">
          {[
            'Pulsa un botón → los datos de telemetría cambian progresivamente',
            'El motor de reglas analiza los nuevos valores en cada tick (cada 3 s)',
            'Cuando se supera un umbral configurado, el estado cambia a AMARILLO o ROJO',
            'Se genera automáticamente una alerta con motivo, umbral y valor observado',
            'La contramedida correspondiente aparece en la sección Contramedidas',
            'El evento queda registrado en el historial de Alertas',
            'Pulsa Reiniciar para volver al estado estable inicial',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="w-5 h-5 rounded-full bg-electric-500/20 border border-electric-500/40 flex items-center justify-center text-electric-400 text-xs font-mono shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Panel>

      {/* Live alerts from active scenario */}
      {recentAlerts.length > 0 && (
        <Panel glow={recentAlerts.some(a => a.level === 'red') ? 'red' : 'yellow'}>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap size={15} className="text-yellow-400" /> Alertas generadas por el escenario
          </h3>
          <div className="space-y-2">
            {recentAlerts.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm border border-white/5 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <StatusBadge level={a.level} size="sm" />
                  <span className="text-slate-300">{a.vitalName}</span>
                </div>
                <span className="text-slate-500 text-xs font-mono">{a.observedValue}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
