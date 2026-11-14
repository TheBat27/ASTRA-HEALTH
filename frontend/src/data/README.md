# data/

Datos estáticos, configuraciones iniciales y definiciones de contenido.
Todos los valores biométricos y ambientales son **SIMULADOS** — no proceden de sensores reales.
Los umbrales son valores de demostración, no criterios médicos o ambientales oficiales.

---

## Archivos

### `thresholds.ts`
Define el objeto `DEFAULT_THRESHOLDS` con los umbrales de advertencia y críticos para cada indicador.

| Indicador | Advertencia | Crítico |
|-----------|-------------|---------|
| Frecuencia cardíaca | < 50 o > 100 bpm | < 40 o > 120 bpm |
| SpO₂ | < 94 % | < 90 % |
| Temperatura | < 36 °C o > 37.8 °C | < 35 °C o > 38.5 °C |
| Frecuencia respiratoria | < 10 o > 24 rpm | < 8 o > 30 rpm |
| Horas de sueño | < 6 h | < 4.5 h |
| Fatiga | > 6 /10 | > 8 /10 |
| Estrés | > 6 /10 | > 8 /10 |
| Tasa de dosis radiación | > 0.5 mSv/h | > 1.0 mSv/h |
| Dosis acumulada | > 50 mSv | > 150 mSv |
| CO₂ de cabina | > 2000 ppm | > 5000 ppm |

> Estos valores son de demostración. Una misión real requeriría validación por especialistas en medicina espacial y conformidad con los protocolos de la misión.

---

### `initialTelemetry.ts`
Genera el estado inicial de telemetría para un astronauta en condiciones normales (misión estable).
Exporta la función `buildInitialTelemetry()` que devuelve un `TelemetryState` completo con:
- 10 sensores con valores base realistas
- Historial de 30 puntos con ruido aleatorio suave
- Estado `green` en todos los indicadores

Usada tanto para el estado inicial de la aplicación como para restaurar el estado tras reiniciar un escenario.

---

### `crew.ts`
Define los 6 astronautas ficticios de la misión ARTEMIS-VII.

| Callsign | Nombre ficticio | Rol | Estado inicial |
|----------|----------------|-----|----------------|
| Alpha-1 | Cmdr. A. Reyes | Comandante | 🟢 Normal |
| Beta-1 | Dr. M. Okafor | Médico de Misión | 🟡 Precaución |
| Gamma-1 | Ing. P. Novak | Ingeniero de Sistemas | 🟢 Normal |
| Delta-1 | Dra. S. Lin | Científica Principal | 🟢 Normal |
| Epsilon-1 | Cap. T. Volkov | Piloto | 🔴 Alerta (FC elevada, poco sueño) |
| Zeta-1 | K. Müller | Especialista EVA | 🟢 Normal |

Cada miembro tiene su propia telemetría independiente generada a partir de `buildInitialTelemetry()` con offsets individuales.
Exporta `INITIAL_CREW` (array) y `CREW_BY_ID` (mapa por ID).

---

### `scenarios.ts`
Define los 6 escenarios del simulador de misión.

| ID | Nombre | Indicadores afectados |
|----|--------|----------------------|
| `stable` | Misión Estable | Todos en baseline |
| `solar_storm` | Tormenta Solar | Tasa de dosis, dosis acumulada |
| `fatigue` | Fatiga | Fatiga, estrés, FC |
| `sleep_deprivation` | Poco Sueño | Horas de sueño, fatiga, estrés |
| `co2_high` | Aire Cargado | CO₂ de cabina |
| `low_oxygen` | Oxígeno Bajo | SpO₂, FC, FR |

Cada escenario incluye `steps[]` con deltas progresivos por tiempo transcurrido (ms), lo que produce transiciones suaves en las gráficas en lugar de saltos instantáneos.

---

### `countermeasures.ts`
Matriz de 13 contramedidas específicas vinculadas al motor de reglas.

| ID | Título | Prioridad |
|----|--------|-----------|
| `cm_fatigue` | Protocolo de Gestión de Fatiga | 🟡 |
| `cm_fatigue_critical` | Alerta de Fatiga Crítica | 🔴 |
| `cm_sleep` | Sueño Insuficiente — Seguimiento | 🟡 |
| `cm_sleep_critical` | Privación de Sueño Crítica | 🔴 |
| `cm_hr_high` | Frecuencia Cardíaca Elevada | 🟡 |
| `cm_hr_critical` | Frecuencia Cardíaca Crítica | 🔴 |
| `cm_hr_low` | Frecuencia Cardíaca Baja | 🟡 |
| `cm_spo2` | SpO₂ Reducida | 🟡 |
| `cm_spo2_critical` | SpO₂ Crítica — Protocolo de Emergencia | 🔴 |
| `cm_radiation` | Protección Radiológica — Advertencia | 🟡 |
| `cm_radiation_critical` | Tormenta Solar — Protocolo de Protección | 🔴 |
| `cm_co2` | CO₂ Elevado — Verificación Ambiental | 🟡 |
| `cm_co2_critical` | CO₂ Crítico — Emergencia Ambiental | 🔴 |
| `cm_fatigue_stress` | Combinación Fatiga + Estrés | 🟡 |

Cada contramedida incluye: título, prioridad, motivo, lista de pasos numerados y disclaimer de apoyo a la decisión.
