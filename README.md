# 🚛 FleetOS — Sistema de Gestión de Transporte

Sistema completo de gestión logística y transporte de cargas.

## Módulos incluidos

| Módulo | Descripción |
|---|---|
| 🖥️ Dashboard | KPIs en tiempo real, alertas, viajes del día |
| 📡 Torre de Control | GPS en tiempo real, alertas, mensajería interna |
| 🚚 Gestión de Viajes | CRUD completo, estados, eventos, gastos por viaje |
| 🚛 Flota | Camiones, semirremolques, equipos de frío, vencimientos |
| 👤 Choferes | Legajos digitales, licencias, psicofísicos, sanciones |
| 🏢 Clientes | CRM, tarifarios, cuenta corriente, portal |
| 💰 Finanzas | Facturación, cobranzas, cuentas corrientes |
| ⛽ Combustible | Cargas, rendimiento km/l, costos |
| 🔧 Mantenimiento | Órdenes de trabajo, taller propio/externo |
| 📄 Documentos | Carta de porte, remitos, POD, firma digital |
| 📊 Reportes y BI | KPIs logísticos, rentabilidad, OTIF |
| ⚙️ Administración | Usuarios, roles, auditoría, configuración |

## Stack tecnológico

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.io** (GPS en tiempo real)
- **JWT** (autenticación)
- **Multer** (carga de archivos)

### Frontend
- **React 18** + **React Router v6**
- **Redux Toolkit** (estado global)
- **Axios** (llamadas API)
- **Recharts** (gráficos)
- **Socket.io-client** (tiempo real)

## Instalación rápida

### Prerrequisitos
- Node.js >= 18
- MongoDB (local o Atlas)

### 1. Clonar y configurar backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu MONGODB_URI y JWT_SECRET
npm install
npm run seed    # Carga datos de prueba
npm run dev     # Inicia en puerto 5000
```

### 2. Iniciar frontend

```bash
cd frontend
npm install
npm start       # Inicia en puerto 3000
```

### 3. Acceder al sistema

- URL: http://localhost:3000
- **Admin**: admin@fleetos.com / admin123
- **Logística**: logistica@fleetos.com / admin123
- **Finanzas**: finanzas@fleetos.com / admin123

## Estructura del proyecto

```
fleetos/
├── backend/
│   ├── src/
│   │   ├── config/        # Base de datos + seed
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── middleware/    # Auth + Auditoría
│   │   ├── models/        # Schemas MongoDB
│   │   ├── routes/        # Endpoints API
│   │   └── services/      # Socket.io GPS
│   └── uploads/           # Archivos subidos
└── frontend/
    └── src/
        ├── components/    # UI reutilizable
        ├── hooks/         # useToast, useSocket
        ├── pages/         # Vistas completas
        ├── services/      # Llamadas API
        ├── store/         # Redux slices
        └── utils/         # Helpers y formatters
```

## API Reference

| Método | Endpoint | Descripción |
|---|---|---|
| POST | /api/auth/login | Login |
| GET | /api/dashboard | KPIs generales |
| GET/POST | /api/viajes | Listar / crear viajes |
| PATCH | /api/viajes/:id/estado | Cambiar estado |
| GET/POST | /api/flota | Listar / crear unidades |
| GET | /api/flota/vencimientos | Próximos vencimientos |
| GET/POST | /api/choferes | Listar / crear choferes |
| GET/POST | /api/clientes | Listar / crear clientes |
| GET | /api/finanzas/resumen | Resumen financiero |
| GET/POST | /api/finanzas/facturas | Facturas |
| GET/POST | /api/combustible | Cargas de combustible |
| GET/POST | /api/mantenimiento | Órdenes de trabajo |
| GET | /api/reportes/kpi | KPIs logísticos |
| GET | /api/alertas | Alertas activas |
| GET | /api/users/auditoria | Log de auditoría |

## Socket.io Events

| Evento (cliente → server) | Descripción |
|---|---|
| `auth` | Autenticarse y unirse a sala torre |
| `gps_update` | Enviar posición GPS desde app chofer |
| `panico` | Activar botón de pánico |
| `mensaje` | Enviar mensaje interno |

| Evento (server → cliente) | Descripción |
|---|---|
| `posicion_update` | Actualización de posición individual |
| `flota_snapshot` | Snapshot de toda la flota (cada 10s) |
| `alerta_nueva` | Nueva alerta detectada |
| `panico` | Botón de pánico activado |
| `mensaje_recibido` | Mensaje entrante |

## Roles del sistema

| Rol | Permisos |
|---|---|
| administrador | Acceso total |
| logistica | Viajes, flota, choferes |
| finanzas | Facturas, cobranzas, reportes |
| trafico | Torre de control, alertas |
| rrhh | Legajos, sanciones, psicofísicos |
| chofer | App móvil, viajes asignados |
| cliente | Portal de seguimiento |

## Producción

Para desplegar en producción:

```bash
# Build del frontend
cd frontend && npm run build

# El backend sirve el build estático
# Agregar en backend/src/index.js:
# app.use(express.static('../frontend/build'))

# Variables de entorno producción:
# NODE_ENV=production
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=clave_muy_segura_256_bits
# FRONTEND_URL=https://tu-dominio.com
```

---
FleetOS v1.0.0 — Desarrollado con Node.js + React + MongoDB
