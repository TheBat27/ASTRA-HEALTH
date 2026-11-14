// ============================================================
// ASTRA HEALTH — Core Types
// ============================================================

export type AlertLevel = 'green' | 'yellow' | 'red';
export type TrendDirection = 'up' | 'down' | 'stable';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

// ── Telemetry ──────────────────────────────────────────────
export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface VitalSensor {
  id: string;
  name: string;
  unit: string;
  current: number;
  history: DataPoint[];
  trend: TrendDirection;
  status: AlertLevel;
  lastUpdated: number;
  available: boolean;
  simulated: true;
  description: string;
}

export interface TelemetryState {
  heartRate: VitalSensor;
  spO2: VitalSensor;
  bodyTemp: VitalSensor;
  respRate: VitalSensor;
  sleepHours: VitalSensor;
  fatigue: VitalSensor;
  stress: VitalSensor;
  radiationRate: VitalSensor;
  radiationAccum: VitalSensor;
  co2: VitalSensor;
}

export type VitalKey = keyof TelemetryState;

// ── Thresholds ─────────────────────────────────────────────
export interface Threshold {
  warnLow?: number;
  warnHigh?: number;
  critLow?: number;
  critHigh?: number;
}

export type ThresholdConfig = Record<VitalKey, Threshold>;

// ── Alerts ─────────────────────────────────────────────────
export interface Alert {
  id: string;
  timestamp: number;
  vitalKey: VitalKey | VitalKey[];
  vitalName: string;
  level: AlertLevel;
  observedValue: number | string;
  threshold: string;
  reason: string;
  recommendation: string;
  countermeasureId: string;
  status: AlertStatus;
  acknowledgedAt?: number;
  acknowledgedNote?: string;
  scenarioSource?: string;
  resolvedAt?: number;
}

// ── Countermeasures ────────────────────────────────────────
export interface CountermeasureStep {
  order: number;
  action: string;
}

export interface Countermeasure {
  id: string;
  title: string;
  priority: AlertLevel;
  reason: string;
  steps: CountermeasureStep[];
  disclaimer: string;
}

// ── Simulator ──────────────────────────────────────────────
export type ScenarioId =
  | 'stable'
  | 'solar_storm'
  | 'fatigue'
  | 'sleep_deprivation'
  | 'co2_high'
  | 'low_oxygen';

export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  description: string;
  icon: string;
  buttonColor: string;
  affectedVitals: Partial<Record<VitalKey, number>>;
  durationMs: number;
  steps?: Array<{ atMs: number; deltas: Partial<Record<VitalKey, number>> }>;
}

export interface SimulatorState {
  activeScenario: ScenarioId | null;
  running: boolean;
  elapsedMs: number;
  startedAt: number | null;
}

// ── Cognitive Test ─────────────────────────────────────────
export type CognitiveTestPhase =
  | 'idle'
  | 'instructions'
  | 'waiting'
  | 'stimulus'
  | 'completed';

export interface ReactionTrial {
  trialIndex: number;
  stimulusShownAt: number;
  respondedAt: number | null;
  reactionTime: number | null;
  outcome: 'correct' | 'anticipation' | 'omission';
}

export interface WellnessAnswers {
  mood: number;      // 1-5
  stress: number;    // 1-5
  fatigue: number;   // 1-5
}

export interface CognitiveTestResult {
  id: string;
  completedAt: number;
  durationMs: number;
  trials: ReactionTrial[];
  medianRT: number | null;
  meanRT: number | null;
  correct: number;
  anticipations: number;
  omissions: number;
  variabilityRT: number | null;
  wellness: WellnessAnswers | null;
}

// ── Crew Members ───────────────────────────────────────────
export type CrewMemberId = 'alpha1' | 'beta1' | 'gamma1' | 'delta1' | 'epsilon1' | 'zeta1';

export interface CrewMember {
  id: CrewMemberId;
  callsign: string;       // "Alpha-1"
  name: string;           // "Cmdr. A. Reyes"
  role: string;           // "Comandante"
  avatarEmoji: string;    // astronaut emoji placeholder
  avatarColor: string;    // tailwind bg color class
  telemetry: TelemetryState;
  overallStatus: AlertLevel;
}

// ── Persistence ────────────────────────────────────────────
export interface AppPersistedState {
  alerts: Alert[];
  cognitiveResults: CognitiveTestResult[];
  thresholdOverrides: Partial<ThresholdConfig>;
  lastScenario: ScenarioId | null;
}
