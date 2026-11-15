


/**
 * ASTRA HEALTH — Countermeasures UI Page
 *
 * Interfaz de visualización y gestión de contramedidas físicas, biomecánicas
 * y protocolos de emergencia. Documentado y adaptado por Darnelis (Sakuga Team).
 */
import { Shield, AlertTriangle, Info, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { COUNTERMEASURES } from '../data/countermeasures';
import type { Alert } from '../types';
import { format } from 'date-fns';

const ALERT_PRIORITY = { red: 0, yellow: 1, green: 2 } as const;

export default function Countermeasures() {
  const { state, acknowledgeAlert, activeCrew } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [attendedIds, setAttendedIds] = useState<Set<string>>(new Set());
  const [alertNotes, setAlertNotes] = useState<Record<string, string>>({});

  // Filtrar y ordenar alertas activas o reconocidas por prioridad
  const relevantAlerts = state.alerts
    .filter(a => a.status === 'active' || a.status === 'acknowledged')
    .sort((a, b) => ALERT_PRIORITY[a.level] - ALERT_PRIORITY[b.level]);

  const handleMarkAttended = (alertId: string) => {
    setAttendedIds(prev => new Set(prev).add(alertId));
    acknowledgeAlert(alertId, alertNotes[alertId]);
  };

  const getAlertBorderColor = (level: Alert['level']) => {
    switch (level) {
      case 'red': return 'border-red-500/30 bg-red-500/5';
      case 'yellow': return 'border-yellow-500/20 bg-yellow-500/5';
      default: return 'border-green-500/20 bg-green-500/5';
    }
  };

  const getAlertIconColor = (level: Alert['level']) => {
    switch (level) {
      case 'red': return 'text-red-400 mt-0.5';
      case 'yellow': return 'text-yellow-400 mt-0.5';
      default: return 'text-green-400 mt-0.5';
    }
  };

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
            const cm = COUNTERMEASURES[alert.countermeasureId];
            const isExpanded = expandedId === alert.id;
            const isAttended = attendedIds.has(alert.id) || alert.status === 'acknowledged';

            return (
              <div 
                key={alert.id} 
                className={`rounded-xl border transition-all ${getAlertBorderColor(alert.level)} ${isAttended ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-start justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className={getAlertIconColor(alert.level)} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold">{cm?.title ?? 'Protocolo de Respuesta'}</span>
                        <StatusBadge level={alert.level} size="sm" />
                        {isAttended && (
                          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Atendida
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Generada: {format(new Date(alert.timestamp), 'PPpp')}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="text-slate-400 hover:text-white p-1"
                    aria-label={isExpanded ? "Contraer detalles" : "Expandir detalles"}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-800/60 mt-2 space-y-3">
                    <div className="pt-3">
                      <p className="text-slate-300 text-sm">{cm?.description ?? alert.message}</p>
                    </div>

                    {cm?.actions && cm.actions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones recomendadas:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                          {cm.actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isAttended && (
                      <div className="pt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Notas de atención (opcional)..."
                          value={alertNotes[alert.id] || ''}
                          onChange={(e) => setAlertNotes({ ...alertNotes, [alert.id]: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white flex-1 focus:outline-none focus:border-electric-500"
                        />
                        <button
                          onClick={() => handleMarkAttended(alert.id)}
                          className="bg-electric-500 hover:bg-electric-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Marcar Atendida
                        </button>
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

```