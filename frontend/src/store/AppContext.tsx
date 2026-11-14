/**
 * ASTRA HEALTH — Global Application State
 * Single source of truth for telemetry, alerts, simulator, cognitive test, and crew.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type {
  TelemetryState,
  Alert,
  SimulatorState,
  ScenarioId,
  CognitiveTestResult,
  VitalKey,
  AlertLevel,
  CrewMember,
  CrewMemberId,
} from '../types';
import { buildInitialTelemetry } from '../data/initialTelemetry';
import { INITIAL_CREW } from '../data/crew';
import { SCENARIOS } from '../data/scenarios';
import { evaluateTelemetry, getLevel } from '../rules/anomalyEngine';

// ── State shape ─────────────────────────────────────────────
interface AppState {
  crew: CrewMember[];
  activeCrewId: CrewMemberId;
  // Active crew member's telemetry is crew.find(c=>c.id===activeCrewId).telemetry
  alerts: Alert[];                        // alerts for active crew member
  allAlerts: Record<CrewMemberId, Alert[]>; // per-member alert history
  simulator: SimulatorState;
  overallStatus: AlertLevel;              // active crew member status
  isOnline: boolean;
  isSimRunning: boolean;
  cognitiveResults: CognitiveTestResult[];
}

// ── Computed helpers ────────────────────────────────────────
function getActiveTelemetry(state: AppState): TelemetryState {
  return state.crew.find(c => c.id === state.activeCrewId)!.telemetry;
}

// ── Actions ─────────────────────────────────────────────────
type Action =
  | { type: 'TICK' }
  | { type: 'START_SCENARIO'; scenarioId: ScenarioId }
  | { type: 'STOP_SCENARIO' }
  | { type: 'PAUSE_SCENARIO' }
  | { type: 'RESUME_SCENARIO' }
  | { type: 'RESET_SCENARIO' }
  | { type: 'ACKNOWLEDGE_ALERT'; alertId: string; note?: string }
  | { type: 'SET_ONLINE'; value: boolean }
  | { type: 'ADD_COGNITIVE_RESULT'; result: CognitiveTestResult }
  | { type: 'SELECT_CREW'; crewId: CrewMemberId }
  | { type: 'LOAD_PERSISTED'; alerts: Record<CrewMemberId, Alert[]>; cognitiveResults: CognitiveTestResult[] };

// ── Helpers ─────────────────────────────────────────────────
const HISTORY_MAX = 60;
const TICK_INTERVAL_MS = 3000;

function addNoise(value: number, noise: number, min?: number, max?: number): number {
  const v = value + (Math.random() - 0.5) * 2 * noise;
  if (min !== undefined && v < min) return min;
  if (max !== undefined && v > max) return max;
  return parseFloat(v.toFixed(2));
}

const NOISE_MAP: Partial<Record<VitalKey, number>> = {
  heartRate: 1.5,
  spO2: 0.2,
  bodyTemp: 0.05,
  respRate: 0.5,
  fatigue: 0.1,
  stress: 0.1,
  radiationRate: 0.005,
  radiationAccum: 0,
  co2: 20,
};

const BOUNDS: Partial<Record<VitalKey, [number, number]>> = {
  heartRate: [30, 200],
  spO2: [70, 100],
  bodyTemp: [34, 42],
  respRate: [4, 60],
  sleepHours: [0, 12],
  fatigue: [0, 10],
  stress: [0, 10],
  radiationRate: [0, 50],
  radiationAccum: [0, 10000],
  co2: [300, 50000],
};

function tickTelemetry(
  telemetry: TelemetryState,
  targets: Partial<Record<VitalKey, number>>,
): TelemetryState {
  const now = Date.now();
  const newTelemetry = { ...telemetry } as TelemetryState;

  for (const key of Object.keys(newTelemetry) as VitalKey[]) {
    const vital = { ...newTelemetry[key] };
    const targetVal = targets[key];
    const noise = NOISE_MAP[key] ?? 0.1;
    const bounds = BOUNDS[key];

    let newVal: number;
    if (targetVal !== undefined) {
      const delta = (targetVal - vital.current) * 0.3;
      newVal = addNoise(vital.current + delta, noise * 0.5, bounds?.[0], bounds?.[1]);
    } else {
      newVal = addNoise(vital.current, noise, bounds?.[0], bounds?.[1]);
    }

    if (key === 'radiationAccum') {
      const rate = newTelemetry.radiationRate.current;
      newVal = parseFloat((vital.current + (rate * TICK_INTERVAL_MS) / 3_600_000).toFixed(4));
    }

    const newHistory = [
      ...vital.history.slice(-HISTORY_MAX + 1),
      { timestamp: now, value: newVal },
    ];

    const prevVal = vital.current;
    const trend =
      newVal > prevVal + 0.5 ? 'up' :
      newVal < prevVal - 0.5 ? 'down' : 'stable';

    vital.current = newVal;
    vital.history = newHistory;
    vital.trend = trend;
    vital.lastUpdated = now;
    vital.status = getLevel(newVal, key);

    (newTelemetry as unknown as Record<string, typeof vital>)[key] = vital;
  }

  return newTelemetry;
}

function computeOverallStatus(telemetry: TelemetryState): AlertLevel {
  let status: AlertLevel = 'green';
  for (const key of Object.keys(telemetry) as VitalKey[]) {
    const level = getLevel(telemetry[key].current, key);
    if (level === 'red') return 'red';
    if (level === 'yellow') status = 'yellow';
  }
  return status;
}

// ── Reducer ─────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'TICK': {
      if (!state.isSimRunning) return state;

      const now = Date.now();
      const sim = state.simulator;
      const scenario = sim.activeScenario
        ? SCENARIOS.find((s) => s.id === sim.activeScenario)
        : null;

      // Scenario targets only apply to the active crew member
      const targets: Partial<Record<VitalKey, number>> = {};
      if (scenario) {
        const elapsed = now - (sim.startedAt ?? now);
        let latestStep = scenario.steps?.[0] ?? null;
        for (const step of scenario.steps ?? []) {
          if (elapsed >= step.atMs) latestStep = step;
        }
        if (latestStep) Object.assign(targets, latestStep.deltas);
      }

      // Tick telemetry for ALL crew members (non-active get light noise only)
      const updatedCrew = state.crew.map(member => {
        const isActive = member.id === state.activeCrewId;
        const memberTargets = isActive ? targets : {};
        const newTelemetry = tickTelemetry(member.telemetry, memberTargets);
        const newStatus = computeOverallStatus(newTelemetry);
        return { ...member, telemetry: newTelemetry, overallStatus: newStatus };
      });

      const activeMember = updatedCrew.find(c => c.id === state.activeCrewId)!;
      const activeTelemetry = activeMember.telemetry;
      const activeAlerts = state.allAlerts[state.activeCrewId] ?? [];

      // Run anomaly engine on active member
      const { overallStatus, newAlerts } = evaluateTelemetry(activeTelemetry, activeAlerts);

      const updatedActiveAlerts = [...activeAlerts];
      for (let i = 0; i < updatedActiveAlerts.length; i++) {
        const a = updatedActiveAlerts[i];
        if (a.status !== 'active') continue;
        const keys = Array.isArray(a.vitalKey) ? a.vitalKey : [a.vitalKey];
        const stillTriggered = keys.some(k => getLevel(activeTelemetry[k].current, k) !== 'green');
        if (!stillTriggered) {
          updatedActiveAlerts[i] = { ...a, status: 'resolved', resolvedAt: now };
        }
      }

      const newAllAlerts = {
        ...state.allAlerts,
        [state.activeCrewId]: [...updatedActiveAlerts, ...newAlerts],
      };

      return {
        ...state,
        crew: updatedCrew,
        alerts: newAllAlerts[state.activeCrewId],
        allAlerts: newAllAlerts,
        overallStatus,
        simulator: {
          ...sim,
          elapsedMs: sim.startedAt ? now - sim.startedAt : 0,
        },
      };
    }

    case 'SELECT_CREW': {
      const memberAlerts = state.allAlerts[action.crewId] ?? [];
      const member = state.crew.find(c => c.id === action.crewId)!;
      return {
        ...state,
        activeCrewId: action.crewId,
        alerts: memberAlerts,
        overallStatus: member.overallStatus,
        // Reset scenario when switching crew
        simulator: { activeScenario: null, running: true, elapsedMs: 0, startedAt: null },
      };
    }

    case 'START_SCENARIO': {
      const scenario = SCENARIOS.find((s) => s.id === action.scenarioId);
      if (!scenario) return state;
      return {
        ...state,
        isSimRunning: true,
        simulator: {
          activeScenario: action.scenarioId,
          running: true,
          elapsedMs: 0,
          startedAt: Date.now(),
        },
      };
    }

    case 'STOP_SCENARIO':
    case 'RESET_SCENARIO': {
      // Reset active crew member to baseline
      const updatedCrew = state.crew.map(member => {
        if (member.id !== state.activeCrewId) return member;
        const baseline = buildInitialTelemetry();
        return { ...member, telemetry: baseline, overallStatus: 'green' as const };
      });
      return {
        ...state,
        crew: updatedCrew,
        isSimRunning: true,
        simulator: { activeScenario: null, running: true, elapsedMs: 0, startedAt: null },
        overallStatus: 'green',
      };
    }

    case 'PAUSE_SCENARIO': {
      return {
        ...state,
        isSimRunning: false,
        simulator: { ...state.simulator, running: false },
      };
    }

    case 'RESUME_SCENARIO': {
      return {
        ...state,
        isSimRunning: true,
        simulator: { ...state.simulator, running: true },
      };
    }

    case 'ACKNOWLEDGE_ALERT': {
      const updatedAlerts = state.alerts.map(a =>
        a.id === action.alertId
          ? { ...a, status: 'acknowledged' as const, acknowledgedAt: Date.now(), acknowledgedNote: action.note }
          : a
      );
      return {
        ...state,
        alerts: updatedAlerts,
        allAlerts: { ...state.allAlerts, [state.activeCrewId]: updatedAlerts },
      };
    }

    case 'SET_ONLINE': {
      return { ...state, isOnline: action.value };
    }

    case 'ADD_COGNITIVE_RESULT': {
      const results = [action.result, ...state.cognitiveResults].slice(0, 50);
      return { ...state, cognitiveResults: results };
    }

    case 'LOAD_PERSISTED': {
      const activeAlerts = action.alerts[state.activeCrewId] ?? [];
      return {
        ...state,
        alerts: activeAlerts,
        allAlerts: action.alerts,
        cognitiveResults: action.cognitiveResults,
      };
    }

    default:
      return state;
  }
}

// ── Initial state ────────────────────────────────────────────
const emptyAllAlerts = Object.fromEntries(
  INITIAL_CREW.map(c => [c.id, [] as Alert[]])
) as unknown as Record<CrewMemberId, Alert[]>;

const initialState: AppState = {
  crew: INITIAL_CREW,
  activeCrewId: 'alpha1',
  alerts: [],
  allAlerts: emptyAllAlerts,
  simulator: { activeScenario: null, running: true, elapsedMs: 0, startedAt: null },
  overallStatus: 'green',
  isOnline: navigator.onLine,
  isSimRunning: true,
  cognitiveResults: [],
};

// ── Context ──────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeCrew: CrewMember;
  startScenario: (id: ScenarioId) => void;
  stopScenario: () => void;
  pauseScenario: () => void;
  resumeScenario: () => void;
  resetScenario: () => void;
  acknowledgeAlert: (id: string, note?: string) => void;
  addCognitiveResult: (r: CognitiveTestResult) => void;
  selectCrew: (id: CrewMemberId) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCrew = state.crew.find(c => c.id === state.activeCrewId)!;

  // Persistence: load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('astra_health_state_v2');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          allAlerts?: Record<CrewMemberId, Alert[]>;
          cognitiveResults?: CognitiveTestResult[];
        };
        dispatch({
          type: 'LOAD_PERSISTED',
          alerts: parsed.allAlerts ?? emptyAllAlerts,
          cognitiveResults: parsed.cognitiveResults ?? [],
        });
      }
    } catch { /* ignore */ }
  }, []);

  // Persistence: save on changes
  useEffect(() => {
    try {
      localStorage.setItem('astra_health_state_v2', JSON.stringify({
        allAlerts: state.allAlerts,
        cognitiveResults: state.cognitiveResults,
      }));
    } catch { /* storage full */ }
  }, [state.allAlerts, state.cognitiveResults]);

  // Telemetry tick
  useEffect(() => {
    if (state.isSimRunning) {
      tickRef.current = setInterval(() => dispatch({ type: 'TICK' }), TICK_INTERVAL_MS);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.isSimRunning]);

  // Online/offline
  useEffect(() => {
    const onOnline = () => dispatch({ type: 'SET_ONLINE', value: true });
    const onOffline = () => dispatch({ type: 'SET_ONLINE', value: false });
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const startScenario = useCallback((id: ScenarioId) => dispatch({ type: 'START_SCENARIO', scenarioId: id }), []);
  const stopScenario = useCallback(() => dispatch({ type: 'STOP_SCENARIO' }), []);
  const pauseScenario = useCallback(() => dispatch({ type: 'PAUSE_SCENARIO' }), []);
  const resumeScenario = useCallback(() => dispatch({ type: 'RESUME_SCENARIO' }), []);
  const resetScenario = useCallback(() => dispatch({ type: 'RESET_SCENARIO' }), []);
  const acknowledgeAlert = useCallback((id: string, note?: string) => dispatch({ type: 'ACKNOWLEDGE_ALERT', alertId: id, note }), []);
  const addCognitiveResult = useCallback((r: CognitiveTestResult) => dispatch({ type: 'ADD_COGNITIVE_RESULT', result: r }), []);
  const selectCrew = useCallback((id: CrewMemberId) => dispatch({ type: 'SELECT_CREW', crewId: id }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch, activeCrew,
      startScenario, stopScenario, pauseScenario, resumeScenario, resetScenario,
      acknowledgeAlert, addCognitiveResult, selectCrew,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
