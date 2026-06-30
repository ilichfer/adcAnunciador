# Anunciadores de Cristo — Frontend

Aplicación web para la gestión eclesiástica digital de la iglesia **Anunciadores de Cristo (ADC)**. Proporciona una landing page pública, panel de administración con control de acceso por roles (ADMIN/SERVIDOR), notificaciones en tiempo real, subida de imágenes TCD, dashboard con estadísticas y más.

## Stack

| Tecnología | Versión |
|---|---|
| React | 19 |
| Vite | 6 |
| Tailwind CSS | 4 |
| Zustand | 5 |
| Font Awesome | 6 |
| TypeScript (config) | 5 |

## Estructura

```
/
├── App.jsx                    → Componente principal (tabs, auth, routing)
├── index.jsx                  → Entry point (AuthProvider → App)
├── index.html / index.css     → HTML shell + Tailwind
│
├── components/
│   ├── LandingPage.jsx        → Página pública (carrusel, TCD, videos, contacto)
│   ├── Login.jsx              → Inicio de sesión + cambio de contraseña
│   ├── Navbar.jsx             → Barra de navegación por tabs (rol-based)
│   ├── Header.jsx             → Encabezado (logo, campana notificaciones, usuario)
│   ├── Dashboard.jsx          → Dashboard con estadísticas del usuario
│   ├── Schedule.jsx           → Programación de servicios
│   ├── TCDManager.jsx         → Subida de imagen TCD diaria
│   ├── Reports.jsx            → Reportes TCD (admin)
│   ├── MinistryManager.jsx    → Gestión de ministerios (admin)
│   ├── UsersManager.jsx       → Gestión de usuarios (admin)
│   ├── MonthlyImageManager.jsx → Subida imagen del mes (admin)
│   ├── ContactAdmin.jsx       → Bandeja de mensajes de contacto (admin)
│   ├── Contact.jsx            → Formulario de contacto (in-app)
│   ├── BirthdayManager.jsx    → Gestión de cumpleaños
│   ├── CoordinatorReport.jsx  → Reporte diario del coordinador
│   ├── Profile.jsx            → Perfil del usuario
│   ├── ErrorBoundary.jsx      → Captura de errores React
│   ├── MetaTags.jsx           → Meta tags SEO
│   ├── useApi.js              → Configuración URL base de la API
│   │
│   └── notifications/
│       ├── NotificationBell.jsx    → Campana con badge
│       ├── NotificationPanel.jsx   → Panel desplegable
│       ├── NotificationItem.jsx    → Item individual
│       └── NotificationToast.jsx   → Toast de notificación
│
├── hooks/
│   └── useNotifications.js   → Hook de notificaciones (fetch, mark read)
│
├── store/
│   ├── UseAppStore.jsx       → Store principal (usuarios, eventos, TCD, ministerios)
│   └── UseNotificationStore.jsx → Store de notificaciones (persist)
│
└── context/
    └── AuthContext.jsx        → Contexto de autenticación (login, token, sesión)
```

## Requisitos

- Node.js 18+
- npm

## Ejecutar

```bash
cd anunciaIA-main
npm install
npm run dev
```

El servidor de desarrollo inicia en `http://localhost:3000`.

## Variables de entorno

Copiar `.env.example` a `.env.local`:

```
VITE_API_URL=https://anunciaig.com/
```

**Nota:** La API base se define en `components/useApi.js`. Por defecto apunta a `http://localhost:5000/api` en desarrollo. Cambiar a `https://anunciaig.com/api` para producción.

## Roles y acceso

| Tab | ADMIN | SERVIDOR |
|---|---|---|
| Dashboard (Inicio) | ✓ | ✓ |
| Programación | ✓ | ✓ |
| Mi TCD | ✓ | ✓ |
| Cumpleaños | ✓ | ✓ |
| Mi Perfil | ✓ | ✓ |
| Reportes TCD | ✓ | ✗ |
| Coordinador (dinámico) | ✓ | Solo si es coordinador hoy |
| Consultar Servicios | ✓ | ✗ |
| Ministerios | ✓ | ✗ |
| Usuarios | ✓ | ✗ |
| Imagen del Mes | ✓ | ✗ |
| Contactos | ✓ | ✗ |

## Funcionalidades principales

### Landing Page (público)
- Carrusel de imágenes con transiciones automáticas
- Galería TCD del mes con zoom y arrastre
- Videos destacados (YouTube embebido)
- Próximos eventos
- Formulario de contacto funcional (envía a API)
- Mapa de ubicación

### Dashboard
- Servicios próximos y del mes
- Porcentaje de cumplimiento
- Notificaciones pendientes
- Estado TCD del día
- Próximos cumpleaños
- Servicios por ministerio

### TCD (Tiempo Con Dios)
- Subida diaria de imagen con verificación (solo 1 por día)
- Almacenamiento en Cloudflare R2
- Reportes históricos con filtros por fecha

### Notificaciones
- Auto-creación al asignar servicios
- Badge de no leídas en la campana
- Panel desplegable con lista
- Toast al cargar la app
- Marcar individual/todas como leídas
- Limpieza automática de antiguas

### Contacto (admin)
- Bandeja de mensajes recibidos desde la landing page
- Filtro todos/no leídos
- Marcar como leído
- Contador de no leídos

## API

Comunicación con backend REST en `http://localhost:5000/api`. Endpoints principales:

- `POST /api/auth/loginReact` — Login
- `GET /api/dashboard/stats/{id}` — Estadísticas dashboard
- `POST /api/saveService` — Guardar servicios + notificaciones
- `POST /api/upload` — Subir imagen TCD
- `POST /api/imagen-mensual/upload` — Subir imagen del mes
- `POST /api/contacto` — Enviar mensaje de contacto
- `GET /api/notificaciones/{id}/no-leidas` — Notificaciones no leídas

Ver README del backend para la lista completa.

## Despliegue

```bash
npm run build
```

El directorio `dist/` contiene los archivos estáticos para servir (Netlify, VPS, etc.).
