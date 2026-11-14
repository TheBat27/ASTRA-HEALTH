/**
 * ASTRA HEALTH — Autonomous Anomaly Detection Engine
 *
 * Deterministic rule-based engine running entirely in the browser.
 * Evaluates telemetry and returns alerts. Does NOT diagnose medical conditions.
 */

import type { TelemetryState, Alert, AlertLevel, VitalKey } from '../types';
import { DEFAULT_THRESHOLDS } from '../data/thresholds';

let _ruleIdCounter = 0;
function makeId(): string {
  return `alert_${Date.now()}_${++_ruleIdCounter}`;
}

function getLevel(value: number, key: VitalKey): AlertLevel {
  const t = DEFAULT_THRESHOLDS[key];
  if (
    (t.critHigh !== undefined && value >= t.critHigh) ||
    (t.critLow !== undefined && value <= t.critLow)
  ) return 'red';
  if (
    (t.warnHigh !== undefined && value >= t.warnHigh) ||
    (t.warnLow !== undefined && value <= t.warnLow)
  ) return 'yellow';
  return 'green';
}

export interface RuleResult {
  triggered: boolean;
  alert?: Omit<Alert, 'id' | 'timestamp' | 'status'>;
}

function checkSingle(
  key: VitalKey,
  value: number,
  vitalName: string,
  unit: string,
  cmYellow: string,
  cmRed: string,
  reasonFn: (v: number, l: AlertLevel) => string,
  recFn: (l: AlertLevel) => string,
): RuleResult {
  const level = getLevel(value, key);
  if (level === 'green') return { triggered: false };
  const t = DEFAULT_THRESHOLDS[key];
  const thresholdStr = level === 'red'
    ? `Crítico: ${t.critLow ?? '—'} / ${t.critHigh ?? '—'}`
    : `Advertencia: ${t.warnLow ?? '—'} / ${t.warnHigh ?? '—'}`;

  return {
    triggered: true,
    alert: {
      vitalKey: key,
      vitalName,
      level,
      observedValue: `${value} ${unit}`,
      threshold: thresholdStr,
      reason: reasonFn(value, level),
      recommendation: recFn(level),
      countermeasureId: level === 'red' ? cmRed : cmYellow,
    },
  };
}

// ── Individual rules ────────────────────────────────────────

export function ruleHeartRate(state: TelemetryState): RuleResult {
  const v = state.heartRate.current;
  return checkSingle(
    'heartRate', v, 'Frecuencia Cardíaca', 'bpm', 'cm_hr_high', 'cm_hr_critical',
    (val, l) => l === 'red'
      ? `FC ${val} bpm supera el umbral crítico configurado.`
      : val > (DEFAULT_THRESHOLDS.heartRate.warnHigh ?? 100)
        ? `FC ${val} bpm supera el umbral de advertencia configurado.`
        : `FC ${val} bpm está por debajo del umbral de advertencia configurado.`,
    (l) => l === 'red'
      ? 'Iniciar protocolo de evaluación cardiovascular de la misión inmediatamente.'
      : 'Detener actividad física y monitorizar durante 5 minutos.',
  );
}

export function ruleSpO2(state: TelemetryState): RuleResult {
  const v = state.spO2.current;
  return checkSingle(
    'spO2', v, 'Saturación de Oxígeno', '%', 'cm_spo2', 'cm_spo2_critical',
    (val, l) => l === 'red'
      ? `SpO₂ ${val}% alcanzó el umbral crítico. Posible hipoxemia significativa en simulación.`
      : `SpO₂ ${val}% está por debajo del umbral de advertencia configurado.`,
    (l) => l === 'red'
      ? 'Activar protocolo de emergencia de oxigenación. Notificar médico de misión.'
      : 'Verificar sensor y revisar protocolo de oxigenación de la misión.',
  );
}

export function ruleBodyTemp(state: TelemetryState): RuleResult {
  const v = state.bodyTemp.current;
  return checkSingle(
    'bodyTemp', v, 'Temperatura Corporal', '°C', 'cm_hr_high', 'cm_hr_critical',
    (val, l) => l === 'red'
      ? `Temperatura ${val}°C supera umbral crítico configurado.`
      : `Temperatura ${val}°C fuera del rango de advertencia configurado.`,
    (l) => l === 'red'
      ? 'Notificar al médico de misión y seguir protocolo de evaluación.'
      : 'Registrar lectura y monitorizar evolución.',
  );
}

export function ruleRespRate(state: TelemetryState): RuleResult {
  const v = state.respRate.current;
  return checkSingle(
    'respRate', v, 'Frecuencia Respiratoria', 'rpm', 'cm_hr_high', 'cm_hr_critical',
    (val, l) => l === 'red'
      ? `FR ${val} rpm supera umbral crítico configurado.`
      : `FR ${val} rpm fuera del rango de advertencia configurado.`,
    (l) => l === 'red'
      ? 'Notificar al médico de misión y seguir protocolo de evaluación respiratoria.'
      : 'Registrar y monitorizar. Verificar si está relacionado con actividad física reciente.',
  );
}

export function ruleSleep(state: TelemetryState): RuleResult {
  const v = state.sleepHours.current;
  return checkSingle(
    'sleepHours', v, 'Horas de Sueño', 'h', 'cm_sleep', 'cm_sleep_critical',
    (val, l) => l === 'red'
      ? `Solo ${val}h de sueño. Por debajo del umbral crítico configurado.`
      : `${val}h de sueño. Por debajo del umbral de advertencia configurado.`,
    (l) => l === 'red'
      ? 'Priorizar descanso inmediato. Evaluar rendimiento cognitivo antes de tareas de alto riesgo.'
      : 'Revisar planificación de descanso con el equipo médico.',
  );
}

export function ruleFatigue(state: TelemetryState): RuleResult {
  const v = state.fatigue.current;
  return checkSingle(
    'fatigue', v, 'Fatiga', '/10', 'cm_fatigue', 'cm_fatigue_critical',
    (val, l) => l === 'red'
      ? `Fatiga ${val}/10. Nivel crítico detectado según reglas configuradas.`
      : `Fatiga ${val}/10. Nivel de advertencia detectado.`,
    (l) => l === 'red'
      ? 'Detener actividades de alto riesgo. Iniciar protocolo de recuperación de emergencia.'
      : 'Reducir actividades exigentes y programar descanso.',
  );
}

export function ruleStress(state: TelemetryState): RuleResult {
  const v = state.stress.current;
  return checkSingle(
    'stress', v, 'Estrés Percibido', '/10', 'cm_fatigue', 'cm_fatigue_critical',
    (val, l) => l === 'red'
      ? `Estrés ${val}/10. Nivel crítico detectado.`
      : `Estrés ${val}/10. Nivel de advertencia detectado.`,
    (l) => l === 'red'
      ? 'Notificar al equipo médico y revisar carga de trabajo inmediatamente.'
      : 'Evaluar bienestar y reducir carga de trabajo si es posible.',
  );
}

export function ruleRadiation(state: TelemetryState): RuleResult {
  const rate = state.radiationRate.current;
  const accum = state.radiationAccum.current;
  const tRate = DEFAULT_THRESHOLDS.radiationRate;
  const tAccum = DEFAULT_THRESHOLDS.radiationAccum;

  const rateCrit = tRate.critHigh !== undefined && rate >= tRate.critHigh;
  const rateWarn = tRate.warnHigh !== undefined && rate >= tRate.warnHigh;
  const accumCrit = tAccum.critHigh !== undefined && accum >= tAccum.critHigh;
  const accumWarn = tAccum.warnHigh !== undefined && accum >= tAccum.warnHigh;

  if (!rateCrit && !rateWarn && !accumCrit && !accumWarn) return { triggered: false };

  const level: AlertLevel = (rateCrit || accumCrit) ? 'red' : 'yellow';
  const cm = level === 'red' ? 'cm_radiation_critical' : 'cm_radiation';

  return {
    triggered: true,
    alert: {
      vitalKey: ['radiationRate', 'radiationAccum'],
      vitalName: 'Radiación Espacial',
      level,
      observedValue: `Tasa: ${rate} mSv/h | Acumulada: ${accum} mSv`,
      threshold: `Tasa crítica: ${tRate.critHigh} mSv/h | Acumulada crítica: ${tAccum.critHigh} mSv`,
      reason: rateCrit
        ? `Tasa de dosis ${rate} mSv/h supera el umbral crítico. Posible evento de partículas energéticas.`
        : rateWarn
        ? `Tasa de dosis ${rate} mSv/h supera el umbral de advertencia configurado.`
        : `Dosis acumulada ${accum} mSv supera el umbral ${level === 'red' ? 'crítico' : 'de advertencia'} configurado.`,
      recommendation: level === 'red'
        ? 'Seguir protocolo de tormenta solar. Desplazarse a zona de mayor blindaje.'
        : 'Registrar y notificar. Monitorizar dosis acumulada.',
      countermeasureId: cm,
    },
  };
}

export function ruleCO2(state: TelemetryState): RuleResult {
  const v = state.co2.current;
  return checkSingle(
    'co2', v, 'CO₂ de Cabina', 'ppm', 'cm_co2', 'cm_co2_critical',
    (val, l) => l === 'red'
      ? `CO₂ ${val} ppm. Superado el umbral crítico configurado. Verificar sistema de eliminación.`
      : `CO₂ ${val} ppm. Superado el umbral de advertencia. Revisar sistema ambiental.`,
    (l) => l === 'red'
      ? 'Activar protocolo de emergencia ambiental. Notificar comandante y Control de Misión.'
      : 'Verificar sistema CDRA y seguir protocolo ambiental de la misión.',
  );
}

export function ruleFatigueStress(state: TelemetryState): RuleResult {
  const f = state.fatigue.current;
  const s = state.stress.current;
  const fT = DEFAULT_THRESHOLDS.fatigue;
  const sT = DEFAULT_THRESHOLDS.stress;

  const fWarn = fT.warnHigh !== undefined && f >= fT.warnHigh;
  const sWarn = sT.warnHigh !== undefined && s >= sT.warnHigh;

  if (!fWarn || !sWarn) return { triggered: false };

  return {
    triggered: true,
    alert: {
      vitalKey: ['fatigue', 'stress'],
      vitalName: 'Fatiga + Estrés Combinados',
      level: 'yellow',
      observedValue: `Fatiga: ${f}/10 | Estrés: ${s}/10`,
      threshold: `Advertencia: Fatiga ≥ ${fT.warnHigh} y Estrés ≥ ${sT.warnHigh}`,
      reason: 'Se detectan simultáneamente niveles elevados de fatiga y estrés percibido.',
      recommendation: 'Evaluar bienestar. Reducir carga de trabajo y programar recuperación.',
      countermeasureId: 'cm_fatigue_stress',
    },
  };
}

// ── Main evaluation function ────────────────────────────────

export interface EngineOutput {
  overallStatus: AlertLevel;
  newAlerts: Alert[];
  sensorStatuses: Partial<Record<VitalKey, AlertLevel>>;
}

/**
 * Evaluate all rules against current telemetry.
 * Deduplicates against existing alerts (same vital + same level in last 2 minutes).
 */
export function evaluateTelemetry(
  state: TelemetryState,
  existingAlerts: Alert[],
): EngineOutput {
  const ruleFns = [
    ruleHeartRate,
    ruleSpO2,
    ruleBodyTemp,
    ruleRespRate,
    ruleSleep,
    ruleFatigue,
    ruleStress,
    ruleRadiation,
    ruleCO2,
    ruleFatigueStress,
  ];

  const now = Date.now();
  const DEDUP_WINDOW_MS = 120_000; // 2 minutes

  const newAlerts: Alert[] = [];
  const sensorStatuses: Partial<Record<VitalKey, AlertLevel>> = {};

  for (const fn of ruleFns) {
    const result = fn(state);
    if (!result.triggered || !result.alert) continue;

    const a = result.alert;
    const keys = Array.isArray(a.vitalKey) ? a.vitalKey : [a.vitalKey];

    // Deduplication: skip if same vital key + same level active within window
    const isDuplicate = existingAlerts.some((existing) => {
      if (existing.status === 'resolved') return false;
      if (existing.level !== a.level) return false;
      if (now - existing.timestamp > DEDUP_WINDOW_MS) return false;
      const existingKeys = Array.isArray(existing.vitalKey)
        ? existing.vitalKey
        : [existing.vitalKey];
      return keys.some((k) => existingKeys.includes(k));
    });

    if (!isDuplicate) {
      newAlerts.push({
        ...a,
        id: makeId(),
        timestamp: now,
        status: 'active',
      });
    }

    // Track sensor status per key
    for (const k of keys) {
      const cur = sensorStatuses[k];
      const newLevel = a.level;
      if (!cur || (newLevel === 'red') || (newLevel === 'yellow' && cur === 'green')) {
        sensorStatuses[k] = newLevel;
      }
    }
  }

  // Update overall status from all sensors
  let overallStatus: AlertLevel = 'green';
  for (const key of Object.keys(state) as VitalKey[]) {
    const level = getLevel(state[key].current, key);
    if (level === 'red') { overallStatus = 'red'; break; }
    if (level === 'yellow') overallStatus = 'yellow';
  }

  return { overallStatus, newAlerts, sensorStatuses };
}

export { getLevel };
