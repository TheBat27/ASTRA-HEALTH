# pages/

Pantallas completas de la aplicación. Cada archivo corresponde a una ruta de React Router definida en `App.tsx`.
Las páginas consumen el estado global de `store/AppContext.tsx` y componen componentes de `components/`.

---

## Archivos

### `Dashboard.tsx` → ruta `/`
**Pantalla principal** de la misión. Es la primera vista al abrir la aplicación.

Contiene:
- Fila 1: Tarjetas de los 6 astronautas (`CrewCard`) + panel de alerta activa a la derecha
- Fila 2: 10 tarjetas de telemetría en tiempo real del astronauta seleccionado (`VitalCard`)
- Fila 3: Gráfica de evolución (FC, SpO₂, temperatura) | Resumen del test cognitivo | 5 botones del simulador | Panel de contramedidas activas

---

### `Telemetry.tsx` → ruta `/telemetry`
Vista detallada de **todos los indicadores** del astronauta activo.

Contiene:
- Controles de simulación (pausar / reanudar / reiniciar)
- Selector de rango temporal (10 min / 30 min / todo)
- 7 tarjetas de salud + 3 tarjetas ambientales
- 10 gráficas `VitalChart` individuales, una por indicador

---

### `Alerts.tsx` → ruta `/alerts`
Historial completo de **alertas generadas por el motor de reglas** para el astronauta activo.

Contiene:
- 3 contadores: alertas activas, alta prioridad, advertencias
- Filtros por nivel (todas / rojo / amarillo / verde) y por estado (activo / revisado / resuelto)
- Lista expandible de alertas con: motivo, valor observado, umbral, recomendación
- Botón para marcar como revisada con campo de observación opcional
- Enlace a la contramedida correspondiente

---

### `Countermeasures.tsx` → ruta `/countermeasures`
Pantalla de **protocolos de respuesta** para las alertas activas del astronauta seleccionado.

Contiene:
- Aviso de apoyo a la decisión (no prescripción médica)
- Tarjeta expandible por cada alerta activa o reconocida
- Datos observados y umbral de referencia
- Lista numerada de pasos de respuesta específicos para cada tipo de alerta
- Campo para registrar la acción realizada y botón de marcar como atendida
- Estado vacío si no hay alertas que requieran seguimiento

---

### `CognitiveTest.tsx` → ruta `/cognitive`
**Prueba interactiva de tiempo de reacción** de 2 minutos + cuestionario de bienestar.

Flujo:
1. Pantalla de instrucciones → botón Comenzar
2. Espera aleatoria (1.5–4 s) → aparece estímulo verde → el usuario pulsa lo antes posible
3. Se registran: correctas, anticipaciones (pulsó antes del estímulo) y omisiones (no respondió en 2 s)
4. Al finalizar el tiempo: estadísticas calculadas (TR mediano, promedio, variabilidad)
5. **Exactamente 3 preguntas de bienestar**: estado de ánimo, estrés, fatiga (escala 1–5)
6. Guardado en LocalStorage y visualización del historial

---

### `Simulator.tsx` → ruta `/simulator`
Pantalla de gestión del **simulador de misión** con los 5 escenarios de demostración.

Contiene:
- Panel de estado: estado general, escenario activo, estado de simulación
- Controles globales: pausar / reanudar / reiniciar
- **5 botones grandes** de escenario: Tormenta Solar, Fatiga, Poco Sueño, Aire Cargado, Oxígeno Bajo
- Explicación del flujo de cada escenario (7 pasos)
- Panel de alertas generadas en tiempo real por el escenario activo

---

### `Settings.tsx` → ruta `/settings`
Pantalla de **configuración, umbrales y gestión de datos**.

Contiene:
- Aviso sobre naturaleza de los umbrales (no son límites oficiales)
- Tabla de todos los umbrales de advertencia y críticos (solo lectura)
- Gestión de datos: número de alertas y tests guardados
- Exportación de datos en **CSV** (alertas) y **JSON** (todo)
- Botón para eliminar todos los datos guardados en LocalStorage
- Bloque "Acerca de ASTRA HEALTH" con versión y tecnologías
