import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Filter, Shield } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '../store/AppContext';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import type { AlertLevel, AlertStatus } from '../types';
import { Link } from 'react-router-dom';

type FilterLevel = AlertLevel | 'all';
type FilterStatus = AlertStatus | 'all';

const LEVEL_BG: Record<AlertLevel, string> = {
  green: 'border-green-500/20 bg-green-500/5',
  yellow: 'border-yellow-500/20 bg-yellow-500/5',
  red: 'border-red-500/20 bg-red-500/5',
};

export default function Alerts() {
  const { state, acknowledgeAlert, activeCrew } = useApp();
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const filtered = state.alerts
    .filter(a => filterLevel === 'all' || a.level === filterLevel)
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => b.timestamp - a.timestamp);

  function handleAcknowledge(id: string) {
    acknowledgeAlert(id, noteInputs[id]);
    setExpandedId(null);
  }

  const counts = {
    active: state.alerts.filter(a => a.status === 'active').length,
    red: state.alerts.filter(a => a.level === 'red').length,
    yellow: state.alerts.filter(a => a.level === 'yellow').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Alertas e Historial</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Motor de reglas autónomo ·{' '}
          <span className="text-electric-400 font-semibold">{activeCrew.callsign} · {activeCrew.name}</span>
        </p>
      </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Panel className="text-center">
          <div className="text-2xl font-bold text-white font-mono">{counts.active}</div>
          <div className="text-slate-400 text-xs mt-1">Alertas Activas</div>
        </Panel>
        <Panel className="text-center" glow={counts.red > 0 ? 'red' : 'none'}>
          <div className="text-2xl font-bold text-red-400 font-mono">{counts.red}</div>
          <div className="text-slate-400 text-xs mt-1">Alta Prioridad</div>
        </Panel>
        <Panel className="text-center" glow={counts.yellow > 0 ? 'yellow' : 'none'}>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{counts.yellow}</div>
          <div className="text-slate-400 text-xs mt-1">Advertencias</div>
        </Panel>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-500" />
        <div className="flex gap-1">
          {(['all', 'red', 'yellow', 'green'] as const).map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterLevel === l ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40' : 'text-slate-400 hover:text-white border border-white/5 hover:border-white/10'}`}>
              {l === 'all' ? 'Todas' : l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterStatus === s ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40' : 'text-slate-400 hover:text-white border border-white/5 hover:border-white/10'}`}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Activo' : s === 'acknowledged' ? 'Revisado' : 'Resuelto'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <Panel>
          <div className="text-center py-12 text-slate-500">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-500/30" />
            <p className="text-lg font-medium text-slate-400">Sin alertas en esta categoría</p>
            <p className="text-sm mt-1">El motor de reglas no ha detectado anomalías para los filtros seleccionados</p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={alert.id} className={`rounded-xl border p-4 transition-all ${LEVEL_BG[alert.level]}`}>
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className={alert.level === 'red' ? 'text-red-400 mt-0.5 animate-pulse' : alert.level === 'yellow' ? 'text-yellow-400 mt-0.5' : 'text-green-400 mt-0.5'} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{alert.vitalName}</span>
                      <StatusBadge level={alert.level} size="sm" />
                      {alert.status === 'acknowledged' && (
                        <span className="text-xs text-slate-400 border border-white/10 rounded px-1.5 py-0.5">Revisado</span>
                      )}
                      {alert.status === 'resolved' && (
                        <span className="text-xs text-green-400 border border-green-500/30 rounded px-1.5 py-0.5">Resuelto</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{alert.reason}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={11} />{format(new Date(alert.timestamp), 'dd/MM HH:mm:ss')}</span>
                      <span>Valor: <span className="text-slate-300 font-mono">{alert.observedValue}</span></span>
                    </div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs mt-1">{expandedId === alert.id ? '▲' : '▼'}</span>
              </div>

              {expandedId === alert.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 mb-1">Umbral utilizado</p>
                      <p className="text-slate-300 font-mono">{alert.threshold}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Recomendación</p>
                      <p className="text-slate-300">{alert.recommendation}</p>
                    </div>
                  </div>

                  {alert.status === 'active' && (
                    <div className="flex flex-col gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Añadir observación (opcional)"
                        value={noteInputs[alert.id] ?? ''}
                        onChange={e => setNoteInputs(p => ({ ...p, [alert.id]: e.target.value }))}
                        className="w-full bg-space-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500/50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-500/20 border border-electric-500/40 text-electric-400 text-sm font-medium hover:bg-electric-500/30 transition-all"
                        >
                          <CheckCircle size={14} /> Marcar como revisada
                        </button>
                        <Link
                          to="/countermeasures"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700 border border-white/10 text-slate-300 text-sm hover:border-white/20 transition-all"
                        >
                          <Shield size={14} /> Ver contramedida
                        </Link>
                      </div>
                    </div>
                  )}

                  {alert.acknowledgedNote && (
                    <div className="text-xs text-slate-400 bg-space-700/50 rounded p-2">
                      <span className="text-slate-500">Nota: </span>{alert.acknowledgedNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
