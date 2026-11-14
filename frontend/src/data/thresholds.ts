/**
 * ASTRA HEALTH — Threshold Configuration
 *
 * DISCLAIMER: These values are demonstration thresholds for simulation purposes only.
 * They are NOT official NASA limits, clinical medical criteria, or validated operational
 * thresholds. Any real mission would require validation by flight surgeons and mission
 * specialists. Units are documented per sensor.
 */

import type { ThresholdConfig } from '../types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  // Heart rate — bpm
  heartRate: { warnLow: 50, warnHigh: 100, critLow: 40, critHigh: 120 },

  // Oxygen saturation — % SpO₂
  spO2: { warnLow: 94, critLow: 90 },

  // Body temperature — °C
  bodyTemp: { warnLow: 36.0, warnHigh: 37.8, critLow: 35.0, critHigh: 38.5 },

  // Respiratory rate — breaths/min
  respRate: { warnLow: 10, warnHigh: 24, critLow: 8, critHigh: 30 },

  // Sleep — hours in last 24h
  sleepHours: { warnLow: 6.0, critLow: 4.5 },

  // Fatigue — scale 0–10
  fatigue: { warnHigh: 6, critHigh: 8 },

  // Stress — scale 0–10
  stress: { warnHigh: 6, critHigh: 8 },

  // Radiation dose rate — mSv/h  (demo values, NOT official NASA limits)
  radiationRate: { warnHigh: 0.5, critHigh: 1.0 },

  // Radiation accumulated — mSv  (demo values)
  radiationAccum: { warnHigh: 50, critHigh: 150 },

  // Cabin CO₂ — ppm  (demo values, operational limits must come from mission protocols)
  co2: { warnHigh: 2000, critHigh: 5000 },
};
