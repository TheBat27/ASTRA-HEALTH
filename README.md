# ASTRA HEALTH
## Sistema Autónomo de Monitorización de Salud para Astronautas
### NASA International Space Apps Challenge 2026

---

## ¿Qué problema resuelve?

Durante misiones espaciales de larga duración (como una misión a Marte), la comunicación con la Tierra puede presentar retrasos de hasta 20 minutos o interrupciones prolongadas. Los astronautas necesitan un sistema que:

- Monitorice sus indicadores de salud de forma continua
- Detecte anomalías sin depender de médicos en tiempo real
- Proporcione orientaciones de respuesta claras
- Evalúe el rendimiento cognitivo periódicamente
- Funcione de forma completamente autónoma

ASTRA HEALTH es una aplicación web PWA que resuelve este problema ejecutando todo el procesamiento en el navegador, sin servidor externo.

---

## Funcionalidades implementadas

### Módulo 1 — Telemetría en Vivo
- 10 indicadores: FC, SpO₂, temperatura, FR, sueño, fatiga, estrés, tasa de dosis, dosis acumulada, CO₂
- Actualización automática cada 3 segundos
- Sparklines por indicador
- Gráficas históricas interactivas (Recharts)
- Controles de pausa/reanudar/reiniciar
- Estados verde/amarillo/rojo por indicador

### Módulo 2 — Motor Autónomo de Reglas
- 10 reglas deterministas ejecutadas en TypeScript
- Detección de valores fuera de umbral (warning y crítico)
- Regla combinada fatiga + estrés
- Regla combinada para radiación (tasa + acumulada)
- Deduplicación de alertas (ventana de 2 minutos)
- Marcado automático de alertas como resueltas cuando el valor se normaliza

### Módulo 3 — Contramedidas
- Matriz de 13 protocolos de respuesta
- Pasos específicos por tipo de alerta y nivel de prioridad
- Registro de acciones realizadas
- Disclaimer de apoyo a la decisión (no prescripción médica)

### Módulo 4 — Test Cognitivo
- Prueba de tiempo de reacción de 2 minutos
- Registro de correctas, anticipaciones y omisiones
- Estadísticas: TR mediano, promedio, variabilidad
- Comparación con línea base individual (desde 3 pruebas)
- Exactamente 3 preguntas de bienestar (estado de ánimo, estrés, fatiga)
- Historial persistente en LocalStorage

### Simulador de Misión — 5 botones
1. **TORMENTA SOLAR** — Incremento progresivo de radiación
2. **FATIGA** — Aumento progresivo de fatiga y estrés
3. **POCO SUEÑO** — Privación de sueño simulada
4. **AIRE CARGADO** — Aumento de CO₂ de cabina
5. **OXÍGENO BAJO** — Descenso de SpO₂

Cada botón activa el flujo completo: telemetría → motor de reglas → alerta → contramedida → historial.

### PWA y funcionamiento sin conexión
- Service Worker con Workbox
- Assets en caché tras la primera carga
- Indicador de estado de conexión
- Persistencia de alertas y resultados cognitivos en LocalStorage

---

## Estructura del proyecto

```
ASTRA-HEALTH/
│
├── README.md          → Este archivo: descripción completa del proyecto
├── start.bat          → Script de inicio con un doble clic (Windows)
│
└── frontend/          → Aplicación web PWA (único componente del sistema)
    ├── index.html         Plantilla HTML base
    ├── package.json       Dependencias npm
    ├── vite.config.ts     Configuración Vite + plugin PWA (Workbox)
    ├── tailwind.config.js Paleta de colores espacial personalizada
    ├── tsconfig.json      Configuración TypeScript estricta
    │
    ├── public/
    │   └── favicon.svg    Logotipo ASTRA HEALTH (SVG)
    │
    └── src/               ← Ver src/README.md para detalle completo
        ├── App.tsx                  7 rutas React Router
        ├── main.tsx                 Punto de entrada
        ├── index.css                Estilos globales Tailwind
        │
        ├── components/              Componentes reutilizables
        │   ├── charts/              → Sparkline, VitalChart
        │   ├── crew/                → CrewCard (tarjeta de astronauta)
        │   ├── layout/              → Sidebar, TopBar
        │   ├── telemetry/           → VitalCard (tarjeta de sensor)
        │   └── ui/                  → Panel, StatusBadge, TrendIcon
        │
        ├── data/                    Datos estáticos y configuración
        │   ├── thresholds.ts        Umbrales por indicador (documentados)
        │   ├── initialTelemetry.ts  Estado base simulado
        │   ├── crew.ts              6 astronautas ficticios
        │   ├── scenarios.ts         6 escenarios del simulador
        │   └── countermeasures.ts   13 protocolos de respuesta
        │
        ├── layouts/
        │   └── MainLayout.tsx       Estructura: Sidebar + TopBar + Outlet
        │
        ├── pages/                   Pantallas de la aplicación
        │   ├── Dashboard.tsx        Pantalla principal
        │   ├── Telemetry.tsx        10 gráficas detalladas
        │   ├── Alerts.tsx           Historial con filtros
        │   ├── Countermeasures.tsx  Protocolos de respuesta
        │   ├── CognitiveTest.tsx    Prueba reacción + bienestar
        │   ├── Simulator.tsx        5 botones de escenarios
        │   └── Settings.tsx         Configuración y exportación
        │
        ├── rules/
        │   └── anomalyEngine.ts     Motor de reglas (10 reglas, local)
        │
        ├── store/
        │   └── AppContext.tsx       Estado global (Context + useReducer)
        │
        └── types/
            └── index.ts             Todos los tipos TypeScript
```

> Cada subcarpeta de `src/` tiene su propio `README.md` con la descripción
> detallada de cada archivo, sus entradas, salidas y responsabilidad.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS 3 |
| Gráficas | Recharts 2 |
| Iconos | Lucide React |
| Enrutamiento | React Router v6 |
| PWA | vite-plugin-pwa + Workbox |
| Persistencia | LocalStorage |
| Backend | **Ninguno** — todo en el navegador |

---

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Navegador moderno (Chrome, Edge, Firefox)

---

## Instalación y ejecución

### Opción 1: Script de inicio (Windows)
```
Doble clic en start.bat
```

### Opción 2: Manual
```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

### Build de producción
```bash
cd frontend
npm run build
npm run preview
```

---

## Recorrido de demostración

1. Abrir **http://localhost:5173** → Dashboard con datos en estado normal
2. Ir a **Simulador** → Pulsar **TORMENTA SOLAR**
3. Volver al **Dashboard** → Observar radiación en rojo
4. Ir a **Alertas** → Ver alerta generada automáticamente
5. Ir a **Contramedidas** → Leer protocolo de protección radiológica
6. Marcar la alerta como atendida
7. En **Simulador** → Pulsar **Reiniciar**
8. Pulsar **AIRE CARGADO** → Observar CO₂ en ascenso
9. Ir a **Test Cognitivo** → Realizar la prueba de 2 minutos
10. Contestar las 3 preguntas de bienestar
11. Ver resultados y comparar con historial
12. **Configuración** → Exportar alertas como CSV

---

## Limitaciones actuales

- Un solo astronauta ficticio (Commander Reyes)
- Los umbrales son de demostración, no criterios médicos validados
- No hay sincronización multi-dispositivo
- No hay autenticación (prototipo de demostración)
- El modo offline funciona tras la primera carga, no desde la primera visita

## Funcionalidades que requerirían sensores reales

- Frecuencia cardíaca mediante wearable o sensor biométrico
- SpO₂ mediante pulsioxímetro
- Temperatura mediante sensor de contacto
- Frecuencia respiratoria mediante banda torácica
- Calidad de sueño mediante acelerómetro
- Radiación mediante dosímetro personal
- CO₂ mediante sensor ambiental

## Consideraciones médicas y de privacidad

- Ningún dato del sistema corresponde a personas reales
- El motor de reglas no constituye un diagnóstico médico
- Los umbrales requieren validación por especialistas en medicina espacial
- Las contramedidas son orientaciones de apoyo a la decisión
- Los resultados cognitivos no deben usarse para diagnóstico neurológico
- En un despliegue real se requeriría cifrado y control de acceso

---

## Nota sobre ASTRA HEALTH

ASTRA HEALTH es un prototipo de demostración desarrollado para el NASA Space Apps Challenge 2026.
No es un producto médico certificado. No es un producto oficial de NASA.
El nombre, logotipo e identidad visual son originales del equipo de desarrollo.
