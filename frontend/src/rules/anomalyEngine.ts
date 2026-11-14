/**
 * ASTRA HEALTH — Autonomous Anomaly Detection Engine
 *
 * Deterministic rule-based engine running entirely in the browser.
 * Evaluates telemetry and returns alerts. Does NOT diagnose medical conditions.
 */

import type { TelemetryState, Alert, AlertLevel, VitalKey } from '../types';
import { DEFAULT_THRESHOLDS } from '../data/thresholds';

/** Contador interno para que cada alerta generada tenga un identificador único. */
let _ruleIdCounter = 0;

/**
 * Genera un identificador único para una alerta.
 * Combina la marca de tiempo actual con un contador incremental.
 * @returns Identificador con el formato `alert_<timestamp>_<contador>`.
 */
function makeId(): string {
  return `alert_${Date.now()}_${++_ruleIdCounter}`;
}

/**
 * Determina el nivel de alerta de un valor comparándolo con los umbrales del indicador.
 * Los umbrales críticos tienen prioridad sobre los de advertencia, y cada límite
 * (alto o bajo) es opcional según el indicador.
 * @param value Valor actual del indicador.
 * @param key Indicador a evaluar; se usa para buscar sus umbrales en `DEFAULT_THRESHOLDS`.
 * @returns `'red'` si supera un umbral crítico, `'yellow'` si supera uno de advertencia
 * y `'green'` si está dentro del rango normal.
 */
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

/**
 * Resultado de evaluar una regla.
 * Si `triggered` es `false`, no hay alerta; si es `true`, `alert` trae los datos
 * de la alerta sin `id`, `timestamp` ni `status` (los añade `evaluateTelemetry`).
 */
export interface RuleResult {
  triggered: boolean;
  alert?: Omit<Alert, 'id' | 'timestamp' | 'status'>;
}

/**
 * Evalúa una regla simple de un solo indicador y construye su alerta si hace falta.
 * Es la base de casi todas las reglas individuales (frecuencia cardíaca, SpO₂, sueño, etc.).
 * @param key Indicador evaluado.
 * @param value Valor actual del indicador.
 * @param vitalName Nombre legible del indicador, para mostrar en la interfaz.
 * @param unit Unidad del valor (por ejemplo `bpm` o `%`).
 * @param cmYellow Identificador de la contramedida para el nivel de advertencia.
 * @param cmRed Identificador de la contramedida para el nivel crítico.
 * @param reasonFn Función que redacta el motivo de la alerta según el valor y el nivel.
 * @param recFn Función que redacta la recomendación según el nivel.
 * @returns Resultado sin alerta si el valor está en verde; en caso contrario, la alerta
 * con el valor observado, el umbral superado, el motivo, la recomendación y la contramedida.
 */
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

/**
 * Regla 1: frecuencia cardíaca.
 * Alerta si supera el umbral alto o cae bajo el umbral bajo, en advertencia o crítico.
 * Contramedidas: `cm_hr_high` (advertencia) y `cm_hr_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si el valor está fuera de rango.
 */
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

/**
 * Regla 2: saturación de oxígeno (SpO₂).
 * Alerta cuando el valor baja de los umbrales de advertencia o crítico.
 * Contramedidas: `cm_spo2` (advertencia) y `cm_spo2_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si la saturación es baja.
 */
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

/**
 * Regla 3: temperatura corporal.
 * Reutiliza las contramedidas de frecuencia cardíaca (`cm_hr_high` y `cm_hr_critical`).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si la temperatura está fuera de rango.
 */
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

/**
 * Regla 4: frecuencia respiratoria.
 * Reutiliza las contramedidas de frecuencia cardíaca (`cm_hr_high` y `cm_hr_critical`).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si la frecuencia respiratoria está fuera de rango.
 */
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

/**
 * Regla 5: horas de sueño.
 * Alerta cuando las horas dormidas caen bajo los umbrales de advertencia o crítico.
 * Contramedidas: `cm_sleep` (advertencia) y `cm_sleep_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si el sueño es insuficiente.
 */
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

/**
 * Regla 6: fatiga (escala de 0 a 10).
 * Contramedidas: `cm_fatigue` (advertencia) y `cm_fatigue_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si la fatiga es alta.
 */
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

/**
 * Regla 7: estrés percibido (escala de 0 a 10).
 * Reutiliza las contramedidas de fatiga (`cm_fatigue` y `cm_fatigue_critical`).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si el estrés es alto.
 */
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

/**
 * Regla 8 (combinada): radiación espacial.
 * Evalúa a la vez la tasa de dosis y la dosis acumulada. Si cualquiera de las dos
 * supera su umbral crítico, la alerta es roja; si solo supera uno de advertencia, es amarilla.
 * Contramedidas: `cm_radiation` (advertencia) y `cm_radiation_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla; la alerta cubre los indicadores `radiationRate` y `radiationAccum`.
 */
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

/**
 * Regla 9: CO₂ de cabina.
 * Alerta cuando la concentración supera los umbrales de advertencia o crítico.
 * Contramedidas: `cm_co2` (advertencia) y `cm_co2_critical` (crítico).
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla, con alerta si el CO₂ es elevado.
 */
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

/**
 * Regla 10 (combinada): fatiga y estrés simultáneos.
 * Se activa solo cuando AMBOS indicadores superan su umbral de advertencia a la vez.
 * Siempre genera una alerta de nivel `'yellow'` con la contramedida `cm_fatigue_stress`.
 * @param state Estado actual de la telemetría.
 * @returns Resultado de la regla; la alerta cubre los indicadores `fatigue` y `stress`.
 */
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

/**
 * Salida del motor tras evaluar la telemetría.
 * - `overallStatus`: estado general de la misión (el peor nivel entre todos los indicadores).
 * - `newAlerts`: alertas nuevas que se deben añadir al historial.
 * - `sensorStatuses`: nivel de alerta por indicador, solo para los que tienen alerta.
 */
export interface EngineOutput {
  overallStatus: AlertLevel;
  newAlerts: Alert[];
  sensorStatuses: Partial<Record<VitalKey, AlertLevel>>;
}

/**
 * Evaluate all rules against current telemetry.
 * Deduplicates against existing alerts (same vital + same level in last 2 minutes).
 *
 * Funcionamiento paso a paso:
 * 1. Ejecuta las 10 reglas sobre el estado de telemetría recibido.
 * 2. Por cada regla disparada, descarta la alerta si ya existe una activa del mismo
 *    indicador y nivel dentro de la ventana de 2 minutos (deduplicación).
 * 3. Registra el peor nivel de cada indicador afectado en `sensorStatuses`.
 * 4. Calcula el estado general (`overallStatus`) recorriendo todos los indicadores.
 *
 * Nota: esta función solo crea alertas nuevas. El marcado de alertas como resueltas
 * cuando el valor se normaliza no ocurre aquí, sino en otra parte de la aplicación.
 *
 * @param state Estado actual de la telemetría.
 * @param existingAlerts Alertas ya registradas, usadas para evitar duplicados.
 * @returns Estado general, alertas nuevas y estado por indicador.
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