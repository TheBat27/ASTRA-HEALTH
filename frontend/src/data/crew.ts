/**
 * ASTRA HEALTH — Crew Members Data
 * Six fictional astronauts for ARTEMIS-VII mission.
 * All biometric data is SIMULATED.
 */

import type { CrewMember, CrewMemberId, TelemetryState } from '../types';
import { buildInitialTelemetry } from './initialTelemetry';

/** Build a telemetry state with offset variations per crew member */
function buildCrewTelemetry(offsets: Partial<Record<keyof TelemetryState, number>>): TelemetryState {
  const base = buildInitialTelemetry();
  const result = { ...base } as TelemetryState;
  for (const key of Object.keys(offsets) as (keyof TelemetryState)[]) {
    const delta = offsets[key] ?? 0;
    const sensor = { ...base[key] };
    sensor.current = parseFloat((sensor.current + delta).toFixed(2));
    // Shift history with the same delta
    sensor.history = sensor.history.map(p => ({
      ...p,
      value: parseFloat((p.value + delta).toFixed(2)),
    }));
    (result as unknown as Record<string, typeof sensor>)[key] = sensor;
  }
  return result;
}

export const INITIAL_CREW: CrewMember[] = [
  {
    id: 'alpha1',
    callsign: 'Alpha-1',
    name: 'Cmdr. A. Reyes',
    role: 'Comandante',
    avatarEmoji: '👨‍🚀',
    avatarColor: 'from-blue-600 to-blue-800',
    telemetry: buildCrewTelemetry({}),   // baseline
    overallStatus: 'green',
  },
  {
    id: 'beta1',
    callsign: 'Beta-1',
    name: 'Dr. M. Okafor',
    role: 'Médico de Misión',
    avatarEmoji: '👩‍🚀',
    avatarColor: 'from-teal-600 to-teal-800',
    telemetry: buildCrewTelemetry({ heartRate: 4, fatigue: 1.5, stress: 1.5 }),
    overallStatus: 'yellow',
  },
  {
    id: 'gamma1',
    callsign: 'Gamma-1',
    name: 'Ing. P. Novak',
    role: 'Ingeniero de Sistemas',
    avatarEmoji: '🧑‍🚀',
    avatarColor: 'from-purple-600 to-purple-800',
    telemetry: buildCrewTelemetry({ heartRate: -3, spO2: 0.5 }),
    overallStatus: 'green',
  },
  {
    id: 'delta1',
    callsign: 'Delta-1',
    name: 'Dra. S. Lin',
    role: 'Científica Principal',
    avatarEmoji: '👩‍🚀',
    avatarColor: 'from-cyan-600 to-cyan-800',
    telemetry: buildCrewTelemetry({ sleepHours: 0.5, bodyTemp: 0.1 }),
    overallStatus: 'green',
  },
  {
    id: 'epsilon1',
    callsign: 'Epsilon-1',
    name: 'Cap. T. Volkov',
    role: 'Piloto',
    avatarEmoji: '👨‍🚀',
    avatarColor: 'from-red-700 to-red-900',
    // This crew member has an anomaly to demonstrate alerts
    telemetry: buildCrewTelemetry({ heartRate: 36, fatigue: 4, stress: 3.5, sleepHours: -3 }),
    overallStatus: 'red',
  },
  {
    id: 'zeta1',
    callsign: 'Zeta-1',
    name: 'Esp. K. Müller',
    role: 'Especialista EVA',
    avatarEmoji: '🧑‍🚀',
    avatarColor: 'from-green-600 to-green-800',
    telemetry: buildCrewTelemetry({ heartRate: -5, fatigue: -0.5 }),
    overallStatus: 'green',
  },
];

export const CREW_BY_ID: Record<CrewMemberId, CrewMember> = Object.fromEntries(
  INITIAL_CREW.map(c => [c.id, c])
) as Record<CrewMemberId, CrewMember>;
