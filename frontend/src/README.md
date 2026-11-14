# src/ — Código fuente de ASTRA HEALTH

Aplicación web PWA desarrollada con React 18 + TypeScript + Vite.
Toda la lógica (telemetría, motor de reglas, simulador, test cognitivo) se ejecuta en el navegador.
No hay servidor externo ni dependencias de red durante la demostración.

---

## Mapa de la carpeta

```
src/
│
├── App.tsx           → Define las 7 rutas de la aplicación (React Router)
├── main.tsx          → Punto de entrada: monta React, importa estilos, registra PWA
├── index.css         → Estilos globales con Tailwind, scrollbar personalizado, bg-grid
│
├── components/       → Componentes reutilizables sin lógica de negocio
│   ├── charts/           Sparkline · VitalChart
│   ├── crew/             CrewCard
│   ├── layout/           Sidebar · TopBar
│   ├── telemetry/        VitalCard
│   └── ui/               Panel · StatusBadge · TrendIcon
│
├── data/             → Datos estáticos y configuración (TODO simulado)
│   ├── thresholds.ts     Umbrales de advertencia y críticos por indicador
│   ├── initialTelemetry.ts  Estado base de un astronauta en misión estable
│   ├── crew.ts           Los 6 astronautas ficticios con sus datos iniciales
│   ├── scenarios.ts      Los 6 escenarios del simulador con steps progresivos
│   └── countermeasures.ts   13 protocolos de respuesta vinculados al motor
│
├── layouts/          → Estructura visual de página
│   └── MainLayout.tsx    Sidebar + TopBar + área de contenido
│
├── pages/            → Pantallas completas (una por ruta)
│   ├── Dashboard.tsx     Pantalla principal: tripulación, telemetría, simulador
│   ├── Telemetry.tsx     Telemetría detallada con 10 gráficas
│   ├── Alerts.tsx        Historial de alertas con filtros y gestión
│   ├── Countermeasures.tsx  Protocolos de respuesta por alerta activa
│   ├── CognitiveTest.tsx    Prueba de reacción 2 min + 3 preguntas bienestar
│   ├── Simulator.tsx     5 botones de escenarios de demostración
│   └── Settings.tsx      Umbrales, exportación CSV/JSON, gestión de datos
│
├── rules/            → Motor de detección de anomalías (determinista, local)
│   └── anomalyEngine.ts  10 reglas + deduplicación + resolución automática
│
├── store/            → Estado global de la aplicación
│   └── AppContext.tsx    React Context + useReducer: tripulación, telemetría, alertas
│
└── types/            → Contratos de datos TypeScript
    └── index.ts          Todos los tipos: sensores, alertas, tripulación, test cognitivo
```

---

## Flujo de datos

```
data/initialTelemetry.ts
        │
        ▼
store/AppContext.tsx  ◄──── setInterval (3 s) ──── TICK
        │                        │
        │              rules/anomalyEngine.ts
        │                        │
        │              ┌─────────┴──────────┐
        │          newAlerts          overallStatus
        │
        ├──► pages/Dashboard.tsx       (vista principal)
        ├──► pages/Telemetry.tsx        (gráficas detalladas)
        ├──► pages/Alerts.tsx           (historial)
        ├──► pages/Countermeasures.tsx  (protocolos)
        ├──► pages/CognitiveTest.tsx    (prueba cognitiva)
        ├──► pages/Simulator.tsx        (escenarios)
        └──► pages/Settings.tsx         (configuración)
```

---

## Archivos raíz

### `App.tsx`
Define el árbol de rutas con `<Routes>` de React Router.
Todas las páginas renderizan dentro de `MainLayout` como rutas hijas.
La ruta `*` redirige al Dashboard.

### `main.tsx`
Punto de entrada de Vite. Monta `<App>` dentro de `<React.StrictMode>` y `<BrowserRouter>`.
Importa `index.css` para activar Tailwind.

### `index.css`
- Directivas `@tailwind base/components/utilities`
- Estilo de scrollbar personalizado (tono azul oscuro)
- Clase utilitaria `bg-grid` para la cuadrícula de fondo del layout
- Selección de texto con color electric blue
