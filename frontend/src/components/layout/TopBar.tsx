import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Clock, ChevronDown, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import StatusBadge from '../ui/StatusBadge';
import type { CrewMemberId } from '../../types';
import clsx from 'clsx';

const STATUS_DOT: Record<string, string> = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400 animate-pulse',
  red: 'bg-red-400 animate-pulse',
};

export default function TopBar() {
  const { state, activeCrew, selectCrew } = useApp();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelectCrew(id: CrewMemberId) {
    selectCrew(id);
    setDropdownOpen(false);
  }

  return (
    <header className="h-14 bg-space-900/90 backdrop-blur-sm border-b border-white/5 flex items-center px-5 gap-3 sticky top-0 z-30">
      {/* Mission ID */}
      <div className="font-mono text-xs text-slate-400 border border-white/10 rounded px-2.5 py-1 bg-space-800 hidden sm:block">
        <span className="text-electric-400">MIS</span> ARTEMIS-VII · SOL 142
      </div>

      {/* Overall status */}
      <StatusBadge level={state.overallStatus} pulse />

      {/* Sim indicator */}
      {state.simulator.activeScenario && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400 border border-orange-500/30 rounded px-2 py-1 bg-orange-500/10 animate-pulse hidden md:flex">
          ⚡ SIMULACIÓN
        </div>
      )}

      <div className="flex-1" />

      {/* UTC Time */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
        <Clock size={13} />
        <span>UTC {time.toLocaleTimeString('es', { hour12: false })}</span>
      </div>

      {/* Connection */}
      <div className={`flex items-center gap-1.5 text-xs ${state.isOnline ? 'text-green-400' : 'text-red-400'}`}>
        {state.isOnline
          ? <><Wifi size={14} /><span className="hidden sm:inline">En línea</span></>
          : <><WifiOff size={14} /><span className="hidden sm:inline">Sin conexión</span></>
        }
      </div>

      {/* Crew selector dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm bg-space-800 hover:bg-space-700 hover:border-electric-500/40 transition-all"
        >
          <span className="text-lg leading-none">{activeCrew.avatarEmoji}</span>
          <div className="text-left hidden sm:block">
            <div className="text-white text-xs font-semibold leading-tight">
              Astronauta: {activeCrew.callsign}
            </div>
            <div className="text-slate-500 text-[10px] leading-tight">{activeCrew.role}</div>
          </div>
          <span className={clsx('w-2 h-2 rounded-full ml-1', STATUS_DOT[activeCrew.overallStatus])} />
          <ChevronDown size={13} className={clsx('text-slate-400 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-space-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-in">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Tripulación ARTEMIS-VII</p>
            </div>
            {state.crew.map(member => {
              const memberAlerts = (state.allAlerts[member.id] ?? []).filter(a => a.status === 'active').length;
              return (
                <button
                  key={member.id}
                  onClick={() => handleSelectCrew(member.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-space-700 transition-colors',
                    state.activeCrewId === member.id && 'bg-electric-500/10',
                  )}
                >
                  <span className="text-xl">{member.avatarEmoji}</span>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-xs">{member.callsign}</div>
                    <div className="text-slate-500 text-[11px]">{member.name} · {member.role}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {memberAlerts > 0 && (
                      <span className="text-xs bg-red-500/80 text-white rounded-full px-1.5 py-0.5 font-bold">
                        {memberAlerts}
                      </span>
                    )}
                    <span className={clsx('w-2 h-2 rounded-full', STATUS_DOT[member.overallStatus])} />
                    {state.activeCrewId === member.id && <CheckCircle size={12} className="text-electric-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
