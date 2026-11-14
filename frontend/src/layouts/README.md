# layouts/

Componentes de estructura de página. Definen cómo se organiza visualmente la aplicación completa.

---

## Archivos

### `MainLayout.tsx`

Layout principal que envuelve todas las páginas de la aplicación.

**Estructura visual:**
```
┌─────────────────────────────────────────────┐
│  Sidebar (w-56, fijo izquierda)             │
│  ┌───────────────────────────────────────┐  │
│  │  TopBar (h-14, sticky top)            │  │
│  ├───────────────────────────────────────┤  │
│  │  <Outlet /> — contenido de la página  │  │
│  │  (scroll vertical independiente)      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

- Aplica el fondo global `bg-space-950` con la textura de cuadrícula `bg-grid`
- El área de contenido tiene `overflow-y-auto` con padding `p-6`
- Usado como `element` del Route padre en `App.tsx`; las páginas hijas renderizan en `<Outlet />`
