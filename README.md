# Asynchronous Report Generator - Monorepo

Este es un monorepo de Node.js/TypeScript que implementa un sistema generador de reportes asincrónico usando npm workspaces.

## Estructura del Monorepo

```
report-generator/
├── backend/              # API Express (puerto 3000)
├── worker/              # Procesador de trabajos en background
├── frontend/            # Angular 20+ (puerto 4200)
├── shared/              # Tipos e interfaces compartidas
├── tsconfig.base.json   # Configuración base de TypeScript
├── package.json         # Configuración de workspaces
└── README.md
```

## Workspaces

### 1. **Shared** (`@report-generator/shared`)
Contiene tipos, interfaces y utilidades compartidas entre backend, worker y frontend.

**Archivos clave:**
- `src/index.ts` - Definiciones de tipos

### 2. **Backend** (`@report-generator/backend`)
API REST Express que expone endpoints para crear y consultar reportes, y Server-Sent Events (SSE) para notificaciones en tiempo real.

**Dependencias:**
- Express
- Sequelize + PostgreSQL
- Redis
- CORS

**Scripts:**
- `npm run dev` - Inicia el servidor en modo desarrollo (ts-node)
- `npm run build` - Compila TypeScript
- `npm start` - Ejecuta la versión compilada

### 3. **Worker** (`@report-generator/worker`)
Proceso background que consume trabajos de la cola Redis y procesa reportes.

**Dependencias:**
- Sequelize + PostgreSQL
- Redis

**Scripts:**
- `npm run dev` - Inicia el worker en modo desarrollo
- `npm run build` - Compila TypeScript
- `npm start` - Ejecuta la versión compilada

### 4. **Frontend** (`@report-generator/frontend`)
Aplicación Angular 20+ con tabla ag-Grid para mostrar reportes y formulario para crear nuevos.

**Dependencias:**
- Angular 20+
- ag-Grid
- RxJS

**Scripts:**
- `npm run dev` - Inicia el servidor de desarrollo de Angular
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta tests

## Instalación

```bash
# Instalar todas las dependencias de todos los workspaces
npm install

# O usar npm workspaces explícitamente
npm install --workspaces
```

## Comandos

### Desarrollo
```bash
# Ejecutar todos los workspaces en modo desarrollo
npm run dev

# Ejecutar un workspace específico
npm run dev --workspace=backend
npm run dev --workspace=worker
npm run dev --workspace=frontend
npm run dev --workspace=shared
```

### Build
```bash
# Compilar todos los workspaces
npm run build

# Compilar un workspace específico
npm run build --workspace=backend
```

### Limpieza
```bash
# Eliminar node_modules y dist de todos los workspaces
npm run clean
```

## Configuración

### Requisitos previos
- Node.js v18+
- npm v9+
- PostgreSQL
- Redis

### Variables de entorno

Crear archivos `.env` en cada workspace según sea necesario.

## Flujo de Datos

1. **Cliente** → POST `/api/reports` (Backend)
2. **Backend** → Valida, crea en DB, encola en Redis
3. **Backend** → Retorna reporte (status: PENDING)
4. **Worker** → Consume job de Redis, actualiza status a PROCESSING
5. **Worker** → Publica update via Redis Pub/Sub
6. **Backend** → Recibe update, publica via SSE
7. **Frontend** → Recibe update via EventSource, actualiza UI
8. **Worker** → Completa procesamiento, actualiza status a COMPLETED

## Próximos pasos

1. Implementar **shared** - Tipos e interfaces
2. Implementar **backend** - API REST y SSE
3. Implementar **worker** - Procesador de trabajos
4. Implementar **frontend** - Interfaz Angular

---

**Nota:** Este proyecto está estructurado como un monorepo moderno. Cada workspace es independiente pero comparte tipos a través de `shared`.

