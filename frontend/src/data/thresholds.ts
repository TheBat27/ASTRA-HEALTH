/**
 * ASTRA HEALTH — Threshold Configuration
 *
 * DISCLAIMER: These values are demonstration thresholds for simulation purposes only.
 * They are NOT official NASA limits, clinical medical criteria, or validated operational
 * thresholds. Any real mission would require validation by flight surgeons and mission
 * specialists. Units are documented per sensor.
 */

import type { ThresholdConfig } from '../types';

/**
 * Umbrales de alerta por indicador, usados por el motor de reglas (`rules/anomalyEngine.ts`)
 * y por el store para calcular el color de cada tarjeta (verde, amarillo o rojo).
 *
 * Convención de los campos (todos opcionales, según el indicador):
 * - `warnLow` / `warnHigh`: límites de advertencia (nivel amarillo), por debajo o por encima.
 * - `critLow` / `critHigh`: límites críticos (nivel rojo), por debajo o por encima.
 *
 * El motor compara con `>=` para los límites altos y con `<=` para los bajos,
 * es decir, un valor igual al umbral ya dispara la alerta.
 * Los valores son de demostración; no están validados por especialistas en medicina espacial.
 */
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  /**
   * Frecuencia cardíaca. Unidad: lpm (bpm).
   * Advertencia: ≤ 50 o ≥ 100. Crítico: ≤ 40 o ≥ 120.
   * Sensor real equivalente: wearable o sensor biométrico (por ejemplo, fotopletismografía en la muñeca).
   */
  // Heart rate — bpm
  heartRate: { warnLow: 50, warnHigh: 100, critLow: 40, critHigh: 120 },

  /**
   * Saturación de oxígeno (SpO₂). Unidad: %.
   * Advertencia: ≤ 94. Crítico: ≤ 90. Solo tiene límites bajos.
   * Sensor real equivalente: pulsioxímetro.
   */
  // Oxygen saturation — % SpO₂
  spO2: { warnLow: 94, critLow: 90 },

  /**
   * Temperatura corporal. Unidad: °C.
   * Advertencia: ≤ 36.0 o ≥ 37.8. Crítico: ≤ 35.0 o ≥ 38.5.
   * Sensor real equivalente: sensor de temperatura de contacto.
   */
  // Body temperature — °C
  bodyTemp: { warnLow: 36.0, warnHigh: 37.8, critLow: 35.0, critHigh: 38.5 },

  /**
   * Frecuencia respiratoria. Unidad: respiraciones por minuto (rpm).
   * Advertencia: ≤ 10 o ≥ 24. Crítico: ≤ 8 o ≥ 30.
   * Sensor real equivalente: banda torácica.
   */
  // Respiratory rate — breaths/min
  respRate: { warnLow: 10, warnHigh: 24, critLow: 8, critHigh: 30 },

  /**
   * Horas de sueño en las últimas 24 horas. Unidad: h.
   * Advertencia: ≤ 6.0. Crítico: ≤ 4.5. Solo tiene límites bajos.
   * Sensor real equivalente: acelerómetro (actigrafía del sueño).
   */
  // Sleep — hours in last 24h
  sleepHours: { warnLow: 6.0, critLow: 4.5 },

  /**
   * Fatiga percibida. Escala de 0 a 10.
   * Advertencia: ≥ 6. Crítico: ≥ 8. Solo tiene límites altos.
   * Sin sensor directo: se reporta con un cuestionario o se estima a partir de otros indicadores.
   */
  // Fatigue — scale 0–10
  fatigue: { warnHigh: 6, critHigh: 8 },

  /**
   * Estrés percibido. Escala de 0 a 10.
   * Advertencia: ≥ 6. Crítico: ≥ 8. Solo tiene límites altos.
   * Sin sensor directo: se reporta con un cuestionario o se estima a partir de otros indicadores.
   */
  // Stress — scale 0–10
  stress: { warnHigh: 6, critHigh: 8 },

  /**
   * Tasa de dosis de radiación. Unidad: mSv/h.
   * Advertencia: ≥ 0.5. Crítico: ≥ 1.0. Solo tiene límites altos.
   * Valores de demostración (NO son límites oficiales de la NASA): están elevados a propósito
   * para que el escenario de tormenta solar se note en la demo.
   * Sensor real equivalente: dosímetro personal.
   */
  // Radiation dose rate — mSv/h  (demo values, NOT official NASA limits)
  radiationRate: { warnHigh: 0.5, critHigh: 1.0 },

  /**
   * Dosis de radiación acumulada. Unidad: mSv.
   * Advertencia: ≥ 50. Crítico: ≥ 150. Solo tiene límites altos.
   * Valores de demostración, no son límites oficiales.
   * Sensor real equivalente: dosímetro personal.
   */
  // Radiation accumulated — mSv  (demo values)
  radiationAccum: { warnHigh: 50, critHigh: 150 },

  /**
   * CO₂ de la cabina. Unidad: ppm.
   * Advertencia: ≥ 2000. Crítico: ≥ 5000. Solo tiene límites altos.
   * Valores de demostración: los límites operativos reales deben salir de los protocolos de la misión.
   * Sensor real equivalente: sensor ambiental de CO₂.
   */
  // Cabin CO₂ — ppm  (demo values, operational limits must come from mission protocols)
  co2: { warnHigh: 2000, critHigh: 5000 },
};