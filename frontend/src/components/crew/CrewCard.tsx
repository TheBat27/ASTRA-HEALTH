/**
 * ASTRA HEALTH — Crew Member Card
 * Shows a crew member with their current status and key vitals.
 */
import { AlertTriangle } from 'lucide-react';
import type { CrewMember } from '../../types';
import clsx from 'clsx';

interface Props {
  member: CrewMember;
  isActive: boolean;
  onClick: () => void;
  alertCount: number;
}

const STATUS_RING: Record<string, string> = {
  green: 'ring-2 ring-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]',
  yellow: 'ring-2 ring-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.25)]',
  red: 'ring-2 ring-red-500/70 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
};

const STATUS_DOT: Record<string, string> = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400 animate-pulse',
  red: 'bg-red-400 animate-pulse',
};

const STATUS_LABEL: Record<string, string> = {
  green: 'Salud Óptima',
  yellow: 'Precaución',
  red: 'Alerta',
};

const STATUS_TEXT: Record<string, string> = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
};

export default function CrewCard({ member, isActive, onClick, alertCount }: Props) {
  const hr = member.telemetry.heartRate.current.toFixed(0);
  const spo2 = member.telemetry.spO2.current.toFixed(1);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left w-full',
        'bg-space-800/70 hover:bg-space-700/80 border-white/5',
        isActive
          ? 'border-electric-500/50 bg-space-700/90 ' + STATUS_RING[member.overallStatus]
          : STATUS_RING[member.overallStatus],
      )}
    >
      {/* Alert badge */}
      {alertCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border border-space-900 flex items-center justify-center z-10">
          <AlertTriangle size={10} className="text-white" />
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
      )}

      {/* Avatar */}
      <div className={clsx(
        'w-14 h-14 rounded-full flex items-center justify-center text-2xl',
        `bg-gradient-to-br ${member.avatarColor}`,
        'border-2',
        member.overallStatus === 'red' ? 'border-red-400/60' :
        member.overallStatus === 'yellow' ? 'border-yellow-400/50' : 'border-white/20',
      )}>
        {member.avatarEmoji}
      </div>

      {/* Name */}
      <div className="text-center w-full">
        <div className="text-white font-bold text-sm leading-tight">{member.callsign}</div>
        <div className="text-slate-400 text-xs truncate">{member.role}</div>
      </div>

      {/* Status */}
      <div className={clsx('flex items-center gap-1.5 text-xs font-medium', STATUS_TEXT[member.overallStatus])}>
        <span className={clsx('w-1.5 h-1.5 rounded-full', STATUS_DOT[member.overallStatus])} />
        {STATUS_LABEL[member.overallStatus]}
      </div>

      {/* Key vitals */}
      <div className="w-full grid grid-cols-2 gap-1 text-xs">
        <div className="bg-space-900/50 rounded px-1.5 py-1 text-center">
          <div className="text-slate-500 text-[10px]">FC</div>
          <div className="text-white font-mono font-bold">{hr}</div>
        </div>
        <div className="bg-space-900/50 rounded px-1.5 py-1 text-center">
          <div className="text-slate-500 text-[10px]">SpO₂</div>
          <div className="text-white font-mono font-bold">{spo2}%</div>
        </div>
      </div>
    </button>
  );
}
