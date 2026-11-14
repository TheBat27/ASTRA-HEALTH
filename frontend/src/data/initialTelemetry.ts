/**
 * ASTRA HEALTH — Initial Telemetry State (Stable Mission Baseline)
 * All values are SIMULATED. Not real sensor readings.
 */

import type { TelemetryState, DataPoint } from '../types';

const now = () => Date.now();

/** Generate a small history of datapoints with gentle noise */
function genHistory(base: number, count: number, noise: number): DataPoint[] {
  const pts: DataPoint[] = [];
  const t = now();
  for (let i = count; i >= 0; i--) {
    const jitter = (Math.random() - 0.5) * 2 * noise;
    pts.push({ timestamp: t - i * 10_000, value: parseFloat((base + jitter).toFixed(2)) });
  }
  return pts;
}

export function buildInitialTelemetry(): TelemetryState {
  return {
    heartRate: {
      id: 'heartRate',
      name: 'Frecuencia Cardíaca',
      unit: 'bpm',
      current: 68,
      history: genHistory(68, 30, 4),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Latidos por minuto. Variaciones normales en microgravedad.',
    },
    spO2: {
      id: 'spO2',
      name: 'Saturación de Oxígeno',
      unit: '%',
      current: 97.5,
      history: genHistory(97.5, 30, 0.5),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'SpO₂ periférica. Indicador clave de oxigenación tisular.',
    },
    bodyTemp: {
      id: 'bodyTemp',
      name: 'Temperatura Corporal',
      unit: '°C',
      current: 36.8,
      history: genHistory(36.8, 30, 0.1),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Temperatura central estimada. Puede verse afectada por actividad física.',
    },
    respRate: {
      id: 'respRate',
      name: 'Frecuencia Respiratoria',
      unit: 'rpm',
      current: 15,
      history: genHistory(15, 30, 1),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Respiraciones por minuto. Referencia de función pulmonar.',
    },
    sleepHours: {
      id: 'sleepHours',
      name: 'Horas de Sueño',
      unit: 'h',
      current: 7.5,
      history: genHistory(7.5, 10, 0.3),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Horas de sueño en las últimas 24 h. El sueño insuficiente afecta el rendimiento.',
    },
    fatigue: {
      id: 'fatigue',
      name: 'Fatiga',
      unit: '/10',
      current: 2.5,
      history: genHistory(2.5, 30, 0.3),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Escala de fatiga percibida de 0 a 10. Autodeclarada + estimación de sensor.',
    },
    stress: {
      id: 'stress',
      name: 'Estrés Percibido',
      unit: '/10',
      current: 2.0,
      history: genHistory(2.0, 30, 0.3),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Nivel de estrés autodeclarado en escala 0–10.',
    },
    radiationRate: {
      id: 'radiationRate',
      name: 'Tasa de Dosis (Radiación)',
      unit: 'mSv/h',
      current: 0.08,
      history: genHistory(0.08, 30, 0.01),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Tasa de dosis de radiación actual. Valor simulado de tránsito interplanetario.',
    },
    radiationAccum: {
      id: 'radiationAccum',
      name: 'Dosis Acumulada (Radiación)',
      unit: 'mSv',
      current: 12.4,
      history: genHistory(12.4, 30, 0.05),
      trend: 'up',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Dosis total acumulada durante la misión. Siempre creciente.',
    },
    co2: {
      id: 'co2',
      name: 'CO₂ de Cabina',
      unit: 'ppm',
      current: 820,
      history: genHistory(820, 30, 30),
      trend: 'stable',
      status: 'green',
      lastUpdated: now(),
      available: true,
      simulated: true,
      description: 'Concentración de CO₂ en la atmósfera de la nave. Monitoreo ambiental.',
    },
  };
}
