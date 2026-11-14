/**
 * ASTRA HEALTH — Mission Scenario Definitions
 * All scenarios are SIMULATIONS for demonstration purposes.
 */
import type { ScenarioConfig } from '../types';

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'stable',
    name: 'Misión Estable',
    description: 'Todos los indicadores dentro de parámetros normales.',
    icon: 'CheckCircle',
    buttonColor: 'bg-status-green',
    affectedVitals: {
      heartRate: 68,
      spO2: 97.5,
      bodyTemp: 36.8,
      respRate: 15,
      sleepHours: 7.5,
      fatigue: 2.5,
      stress: 2.0,
      radiationRate: 0.08,
      radiationAccum: 12.4,
      co2: 820,
    },
    durationMs: 0,
  },
  {
    id: 'solar_storm',
    name: 'TORMENTA SOLAR',
    description: 'Evento de partículas energéticas. Incremento de dosis de radiación.',
    icon: 'Sun',
    buttonColor: 'bg-orange-500',
    affectedVitals: {
      radiationRate: 2.4,
      radiationAccum: 85,
    },
    durationMs: 120_000,
    steps: [
      { atMs: 0,     deltas: { radiationRate: 0.3,  radiationAccum: 0.5 } },
      { atMs: 5000,  deltas: { radiationRate: 0.8,  radiationAccum: 1.2 } },
      { atMs: 15000, deltas: { radiationRate: 1.5,  radiationAccum: 2.1 } },
      { atMs: 30000, deltas: { radiationRate: 2.4,  radiationAccum: 3.8 } },
      { atMs: 60000, deltas: { radiationRate: 2.4,  radiationAccum: 6.2 } },
    ],
  },
  {
    id: 'fatigue',
    name: 'FATIGA',
    description: 'Acumulación progresiva de fatiga tras actividad extravehicular intensa.',
    icon: 'Battery',
    buttonColor: 'bg-yellow-600',
    affectedVitals: {
      fatigue: 8.5,
      stress: 7.0,
      heartRate: 95,
    },
    durationMs: 90_000,
    steps: [
      { atMs: 0,     deltas: { fatigue: 4.0, stress: 3.5 } },
      { atMs: 10000, deltas: { fatigue: 6.0, stress: 5.0, heartRate: 85 } },
      { atMs: 25000, deltas: { fatigue: 7.5, stress: 6.5, heartRate: 92 } },
      { atMs: 45000, deltas: { fatigue: 8.5, stress: 7.0, heartRate: 95 } },
    ],
  },
  {
    id: 'sleep_deprivation',
    name: 'POCO SUEÑO',
    description: 'Privación de sueño tras turno doble y fallo del sistema de control de luz.',
    icon: 'Moon',
    buttonColor: 'bg-indigo-600',
    affectedVitals: {
      sleepHours: 3.5,
      fatigue: 7.0,
      stress: 5.5,
    },
    durationMs: 60_000,
    steps: [
      { atMs: 0,     deltas: { sleepHours: 5.0 } },
      { atMs: 8000,  deltas: { sleepHours: 4.0, fatigue: 5.5 } },
      { atMs: 20000, deltas: { sleepHours: 3.5, fatigue: 7.0, stress: 5.5 } },
    ],
  },
  {
    id: 'co2_high',
    name: 'AIRE CARGADO',
    description: 'Fallo parcial del sistema de eliminación de CO₂. Concentración en ascenso.',
    icon: 'Wind',
    buttonColor: 'bg-teal-600',
    affectedVitals: {
      co2: 7500,
    },
    durationMs: 90_000,
    steps: [
      { atMs: 0,      deltas: { co2: 1500 } },
      { atMs: 10000,  deltas: { co2: 3000 } },
      { atMs: 25000,  deltas: { co2: 5000 } },
      { atMs: 50000,  deltas: { co2: 7500 } },
    ],
  },
  {
    id: 'low_oxygen',
    name: 'OXÍGENO BAJO',
    description: 'Descenso de saturación de oxígeno. Verificar lectura y protocolo de misión.',
    icon: 'Droplets',
    buttonColor: 'bg-red-700',
    affectedVitals: {
      spO2: 87.5,
      heartRate: 108,
      respRate: 26,
    },
    durationMs: 90_000,
    steps: [
      { atMs: 0,      deltas: { spO2: 95.0 } },
      { atMs: 8000,   deltas: { spO2: 93.0, heartRate: 88 } },
      { atMs: 20000,  deltas: { spO2: 90.5, heartRate: 98, respRate: 22 } },
      { atMs: 40000,  deltas: { spO2: 87.5, heartRate: 108, respRate: 26 } },
    ],
  },
];
