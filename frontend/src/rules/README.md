# rules/

Motor de detección de anomalías. Lógica determinista ejecutada completamente en el navegador.
No depende de modelos de IA externos ni de conexión a Internet.

---

## Archivos

### `anomalyEngine.ts`

Motor principal de reglas. Exporta la función `evaluateTelemetry()` que analiza el estado actual
de telemetría y devuelve las nuevas alertas a generar.

#### Reglas implementadas (10)

| Función | Indicador evaluado | Contramedida asignada |
|---------|-------------------|----------------------|
| `ruleHeartRate` | Frecuencia cardíaca | `cm_hr_high` / `cm_hr_critical` |
| `ruleSpO2` | Saturación de oxígeno | `cm_spo2` / `cm_spo2_critical` |
| `ruleBodyTemp` | Temperatura corporal | `cm_hr_high` / `cm_hr_critical` |
| `ruleRespRate` | Frecuencia respiratoria | `cm_hr_high` / `cm_hr_critical` |
| `ruleSleep` | Horas de sueño | `cm_sleep` / `cm_sleep_critical` |
| `ruleFatigue` | Fatiga | `cm_fatigue` / `cm_fatigue_critical` |
| `ruleStress` | Estrés percibido | `cm_fatigue` / `cm_fatigue_critical` |
| `ruleRadiation` | Tasa de dosis + dosis acumulada | `cm_radiation` / `cm_radiation_critical` |
| `ruleCO2` | CO₂ de cabina | `cm_co2` / `cm_co2_critical` |
| `ruleFatigueStress` | Combinación fatiga + estrés simultáneos | `cm_fatigue_stress` |

#### Lógica de deduplicación

Para evitar generar la misma alerta en cada tick (cada 3 segundos), el motor compara
los nuevos resultados con las alertas existentes y omite las que ya existen para el
mismo indicador y nivel dentro de una ventana de **2 minutos**.

#### Resolución automática

`evaluateTelemetry()` solo genera alertas nuevas; no modifica ni resuelve las
existentes. El marcado de alertas como `resolved` cuando el valor de un indicador
vuelve al rango verde se realiza en la capa de estado (`store/`), sin borrar su
registro histórico.

#### Función auxiliar `getLevel()`

Determina el nivel de alerta (`green` / `yellow` / `red`) para un valor y un indicador
consultando los umbrales de `data/thresholds.ts`. También se usa en el store para
calcular el estado visual de cada tarjeta de sensor.

#### Contrato de entrada / salida

```typescript
// Entrada
evaluateTelemetry(state: TelemetryState, existingAlerts: Alert[]): EngineOutput

// Salida
interface EngineOutput {
  overallStatus: AlertLevel;         // estado general de la misión
  newAlerts: Alert[];                // alertas nuevas a añadir al historial
  sensorStatuses: Partial<Record<VitalKey, AlertLevel>>; // estado por sensor
}
```
