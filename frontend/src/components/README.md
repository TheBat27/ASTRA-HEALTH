# components/

Componentes React reutilizables organizados por dominio.
Ninguno contiene lógica de negocio ni accede directamente al store global — solo reciben props y renderizan UI.

---

## Subcarpetas

### charts/
Componentes de visualización de datos basados en **Recharts**.

| Archivo | Qué hace |
|---------|----------|
| `Sparkline.tsx` | Mini gráfica de área (sparkline) que muestra la evolución reciente de un indicador. Se usa dentro de cada `VitalCard`. Cambia de color según el estado verde/amarillo/rojo del sensor. |
| `VitalChart.tsx` | Gráfica de línea detallada con eje X de tiempo, eje Y con unidades, líneas de referencia de umbrales (advertencia y crítico) y tooltip interactivo. Se usa en las páginas de Dashboard y Telemetría. |

---

### crew/
Componentes relacionados con la visualización de miembros de la tripulación.

| Archivo | Qué hace |
|---------|----------|
| `CrewCard.tsx` | Tarjeta clicable de un astronauta. Muestra avatar emoji, callsign, rol, estado general (verde/amarillo/rojo), frecuencia cardíaca y SpO₂ actuales. Se resalta cuando es el astronauta activo. Incluye badge de alertas pendientes. |

---

### layout/
Componentes que forman el esqueleto visual de la aplicación.

| Archivo | Qué hace |
|---------|----------|
| `Sidebar.tsx` | Barra de navegación lateral. Contiene el logo ASTRA HEALTH, los 7 enlaces de navegación con íconos, el contador de alertas activas y el bloque de información de misión (nombre, estado de conexión, UTC). |
| `TopBar.tsx` | Barra superior fija. Muestra el identificador de misión, el estado general de salud, el indicador de simulación activa, la hora UTC, el estado de conexión y el **selector de astronauta activo** (dropdown con los 6 miembros de la tripulación). |

---

### telemetry/
Componentes de presentación de indicadores biométricos y ambientales.

| Archivo | Qué hace |
|---------|----------|
| `VitalCard.tsx` | Tarjeta individual de un sensor (p.ej. frecuencia cardíaca, CO₂, radiación). Muestra el valor actual, unidad, tendencia, hora de última actualización, sparkline histórica y estado del sensor. Incluye un tooltip de información y el badge "SIMULADO". |

---

### ui/
Primitivos de UI genéricos usados en toda la aplicación.

| Archivo | Qué hace |
|---------|----------|
| `Panel.tsx` | Contenedor con fondo azul marino, borde sutil y efecto de blur. Acepta una prop `glow` que añade un resplandor de color verde, amarillo, rojo o azul según el contexto. |
| `StatusBadge.tsx` | Insignia de estado con punto de color animado. Tres variantes: `green` (NORMAL), `yellow` (ADVERTENCIA), `red` (ALERTA). Tres tamaños: `sm`, `md`, `lg`. |
| `TrendIcon.tsx` | Icono de tendencia (↑ ↓ →) basado en Lucide React. Acepta una prop `invertColor` para indicadores donde subir es negativo (CO₂, radiación, fatiga). |
