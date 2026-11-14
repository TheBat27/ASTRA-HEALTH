import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, AlertTriangle, Shield,
  Brain, Rocket, Settings, ChevronRight
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/telemetry',    icon: Activity,        label: 'Telemetría' },
  { to: '/alerts',       icon: AlertTriangle,   label: 'Alertas e Historial' },
  { to: '/countermeasures', icon: Shield,       label: 'Contramedidas' },
  { to: '/cognitive',    icon: Brain,           label: 'Test Cognitivo\ny Bienestar' },
  { to: '/simulator',    icon: Rocket,          label: 'Simulador de Misión' },
  { to: '/settings',     icon: Settings,        label: 'Configuración' },
];

export default function Sidebar() {
  const { state } = useApp();
  const activeAlerts = state.alerts.filter(a => a.status === 'active').length;

  return (
    <aside className="w-56 min-h-screen bg-space-900 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-electric-500/20 border border-electric-500/40 flex items-center justify-center shrink-0">
            <Activity size={16} className="text-electric-400" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wider leading-tight">ASTRA HEALTH</div>
            <div className="text-slate-500 text-[10px] font-mono">Sistema Operativo ●</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-electric-400 shrink-0' : 'shrink-0'} />
                <span className="flex-1 leading-tight whitespace-pre-wrap">{label}</span>
                {label === 'Alertas e Historial' && activeAlerts > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shrink-0">
                    {activeAlerts > 9 ? '9+' : activeAlerts}
                  </span>
                )}
                {isActive && <ChevronRight size={12} className="text-electric-500/50 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mission info — matches reference image bottom-left */}
      <div className="px-4 py-4 border-t border-white/5 space-y-1.5">
        <div className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Misión</div>
        <div className="text-white font-bold text-sm">Astra-26</div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={clsx(
            'w-2 h-2 rounded-full',
            state.isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          )} />
          <span className={state.isOnline ? 'text-green-400' : 'text-red-400'}>
            Conexión {state.isOnline ? 'Autónoma' : 'Sin conexión'}
          </span>
        </div>
        <div className="text-slate-500 text-[10px] font-mono">
          {new Date().toUTCString().split(' ').slice(4, 5).join('')} UTC
        </div>
      </div>
    </aside>
  );
}
