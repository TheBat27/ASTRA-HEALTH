# store/

Estado global de la aplicación. Implementado con React Context + `useReducer`.
Es la única fuente de verdad para telemetría, tripulación, alertas, simulador y test cognitivo.

---

## Archivos

### `AppContext.tsx`

#### Qué contiene

**`AppState`** — forma del estado global:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `crew` | `CrewMember[]` | Los 6 astronautas con su telemetría individual |
| `activeCrewId` | `CrewMemberId` | ID del astronauta seleccionado actualmente |
| `alerts` | `Alert[]` | Alertas del astronauta activo (acceso rápido) |
| `allAlerts` | `Record<CrewMemberId, Alert[]>` | Historial de alertas por cada astronauta |
| `simulator` | `SimulatorState` | Escenario activo, running, startedAt, elapsedMs |
| `overallStatus` | `AlertLevel` | Estado general del astronauta activo (green/yellow/red) |
| `isOnline` | `boolean` | Detectado con `navigator.onLine` y eventos online/offline |
| `isSimRunning` | `boolean` | Si el tick de telemetría está activo |
| `cognitiveResults` | `CognitiveTestResult[]` | Historial de pruebas cognitivas guardadas |

---

#### Acciones del reducer (11)

| Action | Efecto |
|--------|--------|
| `TICK` | Actualiza la telemetría de los 6 astronautas, ejecuta el motor de reglas en el activo, actualiza alertas |
| `SELECT_CREW` | Cambia el astronauta activo, carga sus alertas, resetea el escenario |
| `START_SCENARIO` | Activa un escenario en el simulador, marca `running: true` |
| `STOP_SCENARIO` | Detiene el escenario y restaura la telemetría al baseline |
| `RESET_SCENARIO` | Igual que STOP — restaura el estado estable |
| `PAUSE_SCENARIO` | Detiene el tick sin resetear datos |
| `RESUME_SCENARIO` | Reanuda el tick |
| `ACKNOWLEDGE_ALERT` | Marca una alerta como revisada con nota opcional |
| `SET_ONLINE` | Actualiza el estado de conexión |
| `ADD_COGNITIVE_RESULT` | Añade un resultado de prueba cognitiva al historial |
| `LOAD_PERSISTED` | Restaura alertas y resultados cognitivos desde LocalStorage al arrancar |

---

#### Tick de telemetría

Cada **3 segundos** se dispara la acción `TICK` mediante `setInterval`.
En cada tick:
1. Se actualiza la telemetría de **todos** los astronautas con ruido gaussiano suave
2. Si hay un escenario activo, se aplican los deltas progresivos **solo al astronauta activo**
3. Se ejecuta `evaluateTelemetry()` del motor de reglas sobre el astronauta activo
4. Se actualizan las alertas (nuevas, resueltas automáticamente)

---

#### Persistencia

Al arrancar, carga desde `localStorage` la clave `astra_health_state_v2`.
Cada vez que cambian alertas o resultados cognitivos, los guarda automáticamente.
La telemetría NO se persiste (se regenera al arrancar para garantizar un estado coherente).

---

#### Hook de consumo

```typescript
import { useApp } from '../store/AppContext';

const { state, activeCrew, startScenario, acknowledgeAlert, selectCrew } = useApp();
```

Exportaciones disponibles desde el contexto:

| Exportación | Descripción |
|-------------|-------------|
| `state` | Estado completo de la aplicación |
| `activeCrew` | El `CrewMember` actualmente seleccionado |
| `dispatch` | Acceso directo al reducer (uso avanzado) |
| `startScenario(id)` | Inicia un escenario del simulador |
| `stopScenario()` | Detiene y resetea el escenario |
| `pauseScenario()` | Pausa el tick |
| `resumeScenario()` | Reanuda el tick |
| `resetScenario()` | Vuelve al estado estable inicial |
| `acknowledgeAlert(id, note?)` | Marca alerta como revisada |
| `addCognitiveResult(r)` | Guarda un resultado cognitivo |
| `selectCrew(id)` | Cambia el astronauta activo |
