# 🚀 Blue-Green Deployment Demo

Demostración práctica de implementación de **Blue-Green Deployment** utilizando microservicios con Node.js, Docker, Nginx y PostgreSQL.

## 📋 Tabla de Contenidos

- [¿Qué es Blue-Green Deployment?](#qué-es-blue-green-deployment)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso](#uso)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Qué es Blue-Green Deployment?

Blue-Green Deployment es una estrategia de despliegue que reduce el tiempo de inactividad y el riesgo al ejecutar dos entornos de producción idénticos llamados **Blue** y **Green**.

### Ventajas:

- ✅ **Zero Downtime**: Cambio instantáneo entre versiones
- ✅ **Rollback Rápido**: Retorno inmediato a la versión anterior
- ✅ **Testing en Producción**: Pruebas en entorno real antes del switch
- ✅ **Reducción de Riesgos**: Entorno anterior siempre disponible

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│          Usuario (localhost:8080)           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Nginx (Load   │
         │  Balancer)    │
         └───────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    ┌────────┐      ┌─────────┐
    │  BLUE  │      │  GREEN  │
    │ v1.0   │      │  v2.0   │
    └───┬────┘      └────┬────┘
        │                │
        └────────┬───────┘
                 │
         ┌───────▼────────┐
         │   PostgreSQL   │
         │   (Database)   │
         └────────────────┘
```

---

## 🛠️ Tecnologías

- **Node.js 18**: Runtime de JavaScript
- **Express.js**: Framework web
- **PostgreSQL 15**: Base de datos
- **Docker & Docker Compose**: Containerización
- **Nginx**: Load balancer y proxy inverso
- **Alpine Linux**: Imágenes base ligeras

---

## 📁 Estructura del Proyecto

```
Blue-Grey/
├── app/
│   ├── Dockerfile           # Imagen de la aplicación
│   ├── package.json         # Dependencias Node.js
│   ├── server.js            # Servidor Express
│   └── healthcheck.js       # Health check script
├── nginx/
│   ├── nginx.conf           # Configuración Nginx
│   ├── switch.sh            # Script Bash para cambio
│   └── switch.ps1           # Script PowerShell para cambio
├── docker-compose.yml       # Orquestación de servicios
└── README.md               # Este archivo
```

---

## 📦 Requisitos Previos

- Docker Desktop instalado
- Docker Compose v2.0+
- Git Bash o PowerShell (Windows)
- 2GB RAM disponible
- Puertos disponibles: 8080, 3000, 5432

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd Blue-Grey
```

### 2. Levantar los servicios

```bash
docker-compose up -d --build
```

### 3. Verificar que todo está corriendo

```bash
docker-compose ps
```

Deberías ver 5 servicios corriendo:
- `load_balancer` (nginx)
- `blue_service` (app v1.0)
- `green_service` (app v2.0)
- `shared_database` (PostgreSQL)
- `deployment_monitor`

---

## 💻 Uso

### Acceder a la aplicación

```
http://localhost:8080
```

Por defecto, verás el **entorno BLUE** (v1.0) con fondo azul.

### Cambiar entre entornos

**Opción 1: Con Bash (Git Bash, WSL)**
```bash
# Cambiar a GREEN
bash nginx/switch.sh green

# Cambiar a BLUE
bash nginx/switch.sh blue
```

**Opción 2: Con PowerShell (Windows)**
```powershell
# Cambiar a GREEN
.\nginx\switch.ps1 green

# Cambiar a BLUE
.\nginx\switch.ps1 blue
```

### Acceso directo a cada entorno

```
Blue directo:  http://localhost:8080/blue
Green directo: http://localhost:8080/green
```

---

## 🌐 Endpoints Disponibles

| Endpoint | Descripción |
|----------|-------------|
| `/` | Página principal con info del entorno |
| `/health` | Health check del servicio |
| `/api/info` | Información detallada del sistema |
| `/api/db-test` | Prueba de conexión a base de datos |
| `/api/new-feature` | Feature exclusiva de v2.0 (GREEN) |
| `/blue` | Acceso directo al entorno Blue |
| `/green` | Acceso directo al entorno Green |
| `/status` | Estado del load balancer |

---

## 📝 Comandos Útiles

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f blue-app

# Detener servicios
docker-compose stop

# Eliminar todo (incluye volúmenes)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache
```

### Verificación de estado

**Bash:**
```bash
# Ver entorno activo
docker exec load_balancer sh -c "grep 'ACTIVE ENVIRONMENT' /etc/nginx/nginx.conf"

# Ver estado de contenedores
docker-compose ps

# Ver health status
docker inspect blue_service --format='{{.State.Health.Status}}'
docker inspect green_service --format='{{.State.Health.Status}}'
```

**PowerShell:**
```powershell
# Ver entorno activo
docker exec load_balancer cat /etc/nginx/nginx.conf | Select-String "ACTIVE ENVIRONMENT"

# Ver estado de contenedores
docker-compose ps

# Health status
docker inspect blue_service --format='{{.State.Health.Status}}'
docker inspect green_service --format='{{.State.Health.Status}}'
```

### Testing

```bash
# Probar health check
curl http://localhost:8080/health

# Probar API info
curl http://localhost:8080/api/info

# Probar nueva feature (solo en GREEN v2.0)
curl http://localhost:8080/api/new-feature

# Probar conexión a base de datos
curl http://localhost:8080/api/db-test
```

---

## 🔧 Troubleshooting

### Problema: Puerto 8080 ocupado

```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

Solución: Cambiar el puerto en `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "9090:80"  # Cambiar 8080 por otro puerto
```

### Problema: Contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Verificar recursos
docker system df

# Limpiar sistema
docker system prune -a
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps database

# Ver logs de la base de datos
docker-compose logs database

# Reiniciar solo la base de datos
docker-compose restart database
```

### Problema: Switch no funciona

```bash
# Verificar permisos del script
chmod +x nginx/switch.sh

# Ejecutar desde la raíz del proyecto
bash nginx/switch.sh green
```

---

## 🎓 Conceptos Clave

### ¿Cuándo usar Blue-Green?

✅ **Ideal para:**
- Aplicaciones web con alta disponibilidad
- Releases frecuentes
- Necesidad de rollback inmediato
- Testing en producción

❌ **No ideal para:**
- Cambios incompatibles en base de datos
- Aplicaciones con estado complejo
- Recursos limitados (necesitas 2x infraestructura)

### Diferencias con otras estrategias

| Estrategia | Downtime | Rollback | Complejidad |
|------------|----------|----------|-------------|
| **Blue-Green** | Zero | Inmediato | Media |
| **Rolling** | Zero | Lento | Baja |
| **Canary** | Zero | Gradual | Alta |
| **Recreate** | Sí | Lento | Muy Baja |

---

## 👤 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

---

## 🙏 Agradecimientos

- Documentación de Docker
- Comunidad de DevOps
- Nginx documentation

---

## 📚 Referencias

- [Blue-Green Deployment - Martin Fowler](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Express.js](https://expressjs.com/)