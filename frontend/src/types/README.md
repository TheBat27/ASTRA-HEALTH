# types/

Definiciones de tipos TypeScript compartidos en toda la aplicación.
No contiene lógica de ejecución — solo contratos de datos.

---

## Archivos

### `index.ts`

Único archivo de tipos. Todos los tipos se importan desde aquí:
```typescript
import type { Alert, TelemetryState, CrewMember } from '../types';
```

#### Grupos de tipos definidos

---

**Primitivos de estado**
```typescript
type AlertLevel       = 'green' | 'yellow' | 'red'
type TrendDirection   = 'up' | 'down' | 'stable'
type AlertStatus      = 'active' | 'acknowledged' | 'resolved'
```

---

**Telemetría**

| Tipo | Descripción |
|------|-------------|
| `DataPoint` | Un punto de dato: `{ timestamp: number, value: number }` |
| `VitalSensor` | Un sensor completo: id, nombre, unidad, valor actual, historial, tendencia, estado, timestamps, disponibilidad, flag `simulated: true`, descripción |
| `TelemetryState` | Los 10 sensores: `heartRate`, `spO2`, `bodyTemp`, `respRate`, `sleepHours`, `fatigue`, `stress`, `radiationRate`, `radiationAccum`, `co2` |
| `VitalKey` | Union type de las 10 claves de `TelemetryState` |

---

**Umbrales**

| Tipo | Descripción |
|------|-------------|
| `Threshold` | `{ warnLow?, warnHigh?, critLow?, critHigh? }` |
| `ThresholdConfig` | `Record<VitalKey, Threshold>` — umbrales para los 10 indicadores |

---

**Alertas**

| Tipo | Descripción |
|------|-------------|
| `Alert` | Alerta completa: id, timestamp, vitalKey(s), vitalName, level, observedValue, threshold, reason, recommendation, countermeasureId, status, timestamps de acknowledge/resolve, nota, scenarioSource |

---

**Contramedidas**

| Tipo | Descripción |
|------|-------------|
| `CountermeasureStep` | `{ order: number, action: string }` |
| `Countermeasure` | id, título, prioridad, motivo, steps[], disclaimer |

---

**Simulador**

| Tipo | Descripción |
|------|-------------|
| `ScenarioId` | `'stable' \| 'solar_storm' \| 'fatigue' \| 'sleep_deprivation' \| 'co2_high' \| 'low_oxygen'` |
| `ScenarioConfig` | Configuración completa de un escenario: id, nombre, descripción, icono, color, affectedVitals, durationMs, steps[] |
| `SimulatorState` | `{ activeScenario, running, elapsedMs, startedAt }` |

---

**Test cognitivo**

| Tipo | Descripción |
|------|-------------|
| `CognitiveTestPhase` | `'idle' \| 'instructions' \| 'waiting' \| 'stimulus' \| 'completed'` |
| `ReactionTrial` | Un intento: trialIndex, estimulusShownAt, respondedAt, reactionTime, outcome (correct/anticipation/omission) |
| `WellnessAnswers` | `{ mood: 1-5, stress: 1-5, fatigue: 1-5 }` |
| `CognitiveTestResult` | Resultado completo: id, completedAt, durationMs, trials[], estadísticas calculadas, wellness |

---

**Tripulación**

| Tipo | Descripción |
|------|-------------|
| `CrewMemberId` | `'alpha1' \| 'beta1' \| 'gamma1' \| 'delta1' \| 'epsilon1' \| 'zeta1'` |
| `CrewMember` | id, callsign, nombre ficticio, rol, avatarEmoji, avatarColor, telemetry, overallStatus |

---

**Persistencia**

| Tipo | Descripción |
|------|-------------|
| `AppPersistedState` | Forma del objeto guardado en LocalStorage: alertas, resultados cognitivos, overrides de umbrales, último escenario |
