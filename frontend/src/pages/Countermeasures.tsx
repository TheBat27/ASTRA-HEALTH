import { Shield, CheckCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { COUNTERMEASURES } from '../data/countermeasures';
import type { Alert } from '../types';
import { format } from 'date-fns';

export default function Countermeasures() {
  const { state, acknowledgeAlert, activeCrew } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [attended, setAttended] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Get active/unresolved alerts and map to countermeasures
  const relevantAlerts = state.alerts
    .filter(a => a.status === 'active' || a.status === 'acknowledged')
    .sort((a, b) => {
      const priority = { red: 0, yellow: 1, green: 2 };
      return priority[a.level] - priority[b.level];
    });

  function markAttended(alertId: string) {
    setAttended(prev => new Set([...prev, alertId]));
    acknowledgeAlert(alertId, notes[alertId]);
  }

  function getCountermeasure(alert: Alert) {
    return COUNTERMEASURES[alert.countermeasureId] ?? null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Contramedidas</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          <span className="text-electric-400 font-semibold">{activeCrew.callsign} · {activeCrew.name}</span>
          {' '}· Orientaciones de apoyo a la decisión. Los protocolos definitivos deben proceder del plan de misión.
        </p>
      </div>

      {/* Disclaimer */}
      <Panel className="border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-blue-200 text-sm">
            Las contramedidas mostradas son <strong>orientaciones de apoyo a la decisión</strong> basadas en reglas configurables de demostración.
            No constituyen prescripciones médicas validadas. Los protocolos operativos reales requieren validación por especialistas en medicina espacial.
          </p>
        </div>
      </Panel>

      {relevantAlerts.length === 0 ? (
        <Panel>
          <div className="text-center py-16">
            <Shield size={48} className="mx-auto mb-4 text-green-500/30" />
            <p className="text-lg font-medium text-green-400">Sin contramedidas activas</p>
            <p className="text-slate-500 text-sm mt-2">
              El motor de reglas no ha generado alertas que requieran seguimiento.
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Esto indica que los indicadores están dentro de los parámetros configurados, no que el astronauta esté garantizadamente sano.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-4">
          {relevantAlerts.map(alert => {
            const cm = getCountermeasure(alert);
            const isExpanded = expanded === alert.id;
            const isAttended = attended.has(alert.id) || alert.status === 'acknowledged';

            return (
              <div key={alert.id} className={`rounded-xl border transition-all ${
                alert.level === 'red' ? 'border-red-500/30 bg-red-500/5' :
                alert.level === 'yellow' ? 'border-yellow-500/20 bg-yellow-500/5' :
                'border-green-500/20 bg-green-500/5'
              } ${isAttended ? 'opacity-60' : ''}`}>
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-start justify-between"
                  onClick={() => setExpanded(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className={
                      alert.level === 'red' ? 'text-red-400 mt-0.5' :
                      alert.level === 'yellow' ? 'text-yellow-400 mt-0.5' : 'text-green-400 mt-0.5'
                    } />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold">{cm?.title ?? 'Protocolo de Respuesta'}</span>
                        <StatusBadge level={alert.level} size="sm" />
                        {isAttended && (
                          <span className="flex items-center gap-1 text-xs text-green-400 border border-green-500/30 rounded px-1.5 py-0.5">
                            <CheckCircle size={10} /> Atendida
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5">{alert.vitalName} — {alert.reason}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Detectada: {format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500 mt-1" /> : <ChevronDown size={16} className="text-slate-500 mt-1" />}
                </div>

                {/* Expanded content */}
                {isExpanded && cm && (
                  <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 animate-fade-in">
                    {/* Alert data */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-space-700/50 rounded-lg p-3">
                        <p className="text-slate-500 text-xs mb-1">Valor observado</p>
                        <p className="text-white font-mono">{alert.observedValue}</p>
                      </div>
                      <div className="bg-space-700/50 rounded-lg p-3">
                        <p className="text-slate-500 text-xs mb-1">Umbral de referencia</p>
                        <p className="text-white font-mono text-xs">{alert.threshold}</p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-space-700/50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">Motivo de la alerta</p>
                      <p className="text-slate-200 text-sm">{cm.reason}</p>
                    </div>

                    {/* Steps */}
                    <div>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Pasos de respuesta</p>
                      <ol className="space-y-2">
                        {cm.steps.map(step => (
                          <li key={step.order} className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full border border-electric-500/40 flex items-center justify-center text-electric-400 text-xs font-mono shrink-0 mt-0.5">
                              {step.order}
                            </span>
                            <span className="text-slate-300">{step.action}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Disclaimer */}
                    <div className="text-xs text-slate-500 bg-space-800/50 rounded p-2 border border-white/5">
                      ⚠ {cm.disclaimer}
                    </div>

                    {/* Actions */}
                    {!isAttended && (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Registrar acción realizada (opcional)"
                          value={notes[alert.id] ?? ''}
                          onChange={e => setNotes(p => ({ ...p, [alert.id]: e.target.value }))}
                          className="w-full bg-space-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500/50"
                        />
                        <button
                          onClick={() => markAttended(alert.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all"
                        >
                          <CheckCircle size={15} /> Marcar como atendida
                        </button>
                      </div>
                    )}
                    {isAttended && alert.acknowledgedNote && (
                      <div className="text-xs text-slate-400 bg-space-700/50 rounded p-2">
                        <span className="text-slate-500">Acción registrada: </span>{alert.acknowledgedNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}