import { Settings2, Trash2, Download, Info } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_THRESHOLDS } from '../data/thresholds';
import Panel from '../components/ui/Panel';
import { useApp } from '../store/AppContext';
import type { VitalKey } from '../types';

const VITAL_LABELS: Record<VitalKey, string> = {
  heartRate: 'Frecuencia Cardíaca (bpm)',
  spO2: 'Saturación O₂ (%)',
  bodyTemp: 'Temperatura Corporal (°C)',
  respRate: 'Frecuencia Respiratoria (rpm)',
  sleepHours: 'Horas de Sueño (h)',
  fatigue: 'Fatiga (/10)',
  stress: 'Estrés (/10)',
  radiationRate: 'Tasa de Dosis Radiación (mSv/h)',
  radiationAccum: 'Dosis Acumulada Radiación (mSv)',
  co2: 'CO₂ de Cabina (ppm)',
};

export default function Settings() {
  const { state } = useApp();
  const [cleared, setCleared] = useState(false);

  function clearData() {
    if (confirm('¿Eliminar todos los datos guardados (alertas, historial cognitivo)? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('astra_health_state');
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      mission: 'ARTEMIS-VII',
      note: 'Todos los datos son simulados. No contiene información médica real.',
      alerts: state.alerts,
      cognitiveResults: state.cognitiveResults,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra_health_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const rows = [['Timestamp', 'Tipo', 'Indicador', 'Nivel', 'Valor', 'Estado', 'Motivo']];
    for (const a of state.alerts) {
      rows.push([
        new Date(a.timestamp).toISOString(),
        'alerta',
        a.vitalName,
        a.level,
        String(a.observedValue),
        a.status,
        a.reason,
      ]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra_health_alertas_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings2 size={22} className="text-slate-400" /> Configuración
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Umbrales, datos y exportación</p>
      </div>

      {/* Disclaimer */}
      <Panel className="border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Info size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-blue-200 text-sm">
            Los umbrales mostrados son <strong>valores de demostración</strong>. No son límites médicos o ambientales oficiales.
            Cualquier aplicación real requeriría validación por especialistas en medicina espacial y conformidad con los protocolos de misión.
          </p>
        </div>
      </Panel>

      {/* Thresholds table */}
      <Panel>
        <h2 className="text-base font-semibold text-white mb-4">Umbrales de Referencia (Solo lectura)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-400 font-mono text-xs py-2 pr-4">Indicador</th>
                <th className="text-right text-yellow-400 font-mono text-xs py-2 px-2">Adv. Mín</th>
                <th className="text-right text-yellow-400 font-mono text-xs py-2 px-2">Adv. Máx</th>
                <th className="text-right text-red-400 font-mono text-xs py-2 px-2">Crítico Mín</th>
                <th className="text-right text-red-400 font-mono text-xs py-2 pl-2">Crítico Máx</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(DEFAULT_THRESHOLDS) as VitalKey[]).map(key => {
                const t = DEFAULT_THRESHOLDS[key];
                return (
                  <tr key={key} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-2.5 pr-4 text-slate-300">{VITAL_LABELS[key]}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-400">{t.warnLow ?? '—'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-400">{t.warnHigh ?? '—'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-400">{t.critLow ?? '—'}</td>
                    <td className="py-2.5 pl-2 text-right font-mono text-slate-400">{t.critHigh ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Data management */}
      <Panel>
        <h2 className="text-base font-semibold text-white mb-4">Gestión de Datos</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-slate-200 text-sm">Alertas almacenadas</p>
              <p className="text-slate-500 text-xs">{state.alerts.length} registros en LocalStorage</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs hover:bg-electric-500/20 transition-all">
                <Download size={13} /> CSV
              </button>
              <button onClick={exportData} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs hover:bg-electric-500/20 transition-all">
                <Download size={13} /> JSON
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-slate-200 text-sm">Test cognitivos</p>
              <p className="text-slate-500 text-xs">{state.cognitiveResults.length} resultados guardados</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-slate-200 text-sm">Eliminar todos los datos</p>
              <p className="text-slate-500 text-xs">Borra alertas, historial cognitivo y preferencias guardadas</p>
            </div>
            <button
              onClick={clearData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
        {cleared && <p className="text-green-400 text-sm mt-3">✓ Datos eliminados. Recargando…</p>}
      </Panel>

      {/* About */}
      <Panel>
        <h2 className="text-base font-semibold text-white mb-3">Acerca de ASTRA HEALTH</h2>
        <div className="space-y-1.5 text-sm text-slate-400">
          <p><span className="text-slate-300">Versión:</span> 1.0.0</p>
          <p><span className="text-slate-300">Evento:</span> NASA International Space Apps Challenge 2026</p>
          <p><span className="text-slate-300">Arquitectura:</span> PWA · React · TypeScript · Vite · Tailwind CSS · Recharts</p>
          <p><span className="text-slate-300">Almacenamiento:</span> LocalStorage (sin servidor)</p>
          <p><span className="text-slate-300">Datos:</span> Todos los datos biométricos y ambientales son SIMULADOS</p>
          <p><span className="text-slate-300">Motor de reglas:</span> Determinista, ejecutado completamente en el navegador</p>
          <p className="pt-2 text-slate-500 text-xs">
            ASTRA HEALTH es un prototipo de demostración. No es un producto médico certificado ni un producto oficial de NASA.
            Los datos de demostración no representan mediciones de astronautas reales.
          </p>
        </div>
      </Panel>
    </div>
  );
}
