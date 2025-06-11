# 🐳 Proyecto Docker - Aplicación Web Multi-Contenedor

Una aplicación web completa desarrollada con Docker que demuestra los conceptos fundamentales de contenedorización y orquestación de servicios.

## 📋 Descripción

Este proyecto implementa una aplicación de gestión de usuarios utilizando una arquitectura de microservicios con Docker. La aplicación incluye frontend, backend API, base de datos y herramientas de administración, todo containerizado para garantizar portabilidad y escalabilidad.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Backend      │    │     MySQL       │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│  (Base de datos)│
│   Puerto: 80    │    │   Puerto: 3000  │    │   Puerto: 3306  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │                                              ▼
         │                                    ┌─────────────────┐
         │                                    │   phpMyAdmin    │
         │                                    │ (Administración)│
         │                                    │   Puerto: 8080  │
         └────────────────────────────────────┴─────────────────┘
```

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Nginx
- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL 8.0
- **Administración**: phpMyAdmin
- **Contenedorización**: Docker, Docker Compose
- **OS Base**: Alpine Linux (imágenes optimizadas)

## 📁 Estructura del Proyecto

```
mi-app-docker/
├── README.md
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── database/
    └── init.sql
```

## ⚡ Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado
- Docker Compose disponible
- Puerto 80, 3000, 3306 y 8080 libres

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Fabio0406/Ejemplo_Tecno_Docker.git
cd Ejemplo_Tecno_Docker

# 2. Ejecutar la aplicación
docker-compose up --build

# 3. Acceder a los servicios
# Frontend: http://localhost
# API: http://localhost:3000/api/health
# phpMyAdmin: http://localhost:8080
```

### Ejecución en Segundo Plano

```bash
# Ejecutar en modo daemon
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Reiniciar un servicio específico
docker-compose restart backend

# Escalar servicios
docker-compose up --scale backend=3

# Ver logs de un servicio
docker-compose logs -f mysql

# Ejecutar comandos en contenedor
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p
```

### Desarrollo

```bash
# Reconstruir después de cambios en código
docker-compose up --build

# Reconstruir solo un servicio
docker-compose build frontend
docker-compose up -d frontend

# Ver estadísticas de recursos
docker stats
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (¡cuidado: borra datos!)
docker-compose down -v

# Limpiar sistema Docker
docker system prune -f
```

## 📊 Características

### ✅ Funcionalidades

- **CRUD de Usuarios**: Crear, leer, actualizar y eliminar usuarios
- **Interfaz Responsive**: Diseño adaptable a dispositivos móviles
- **API REST**: Endpoints completos para gestión de datos
- **Administración BD**: Interfaz web para gestión de MySQL
- **Health Checks**: Monitoreo automático de servicios
- **Persistencia**: Datos permanentes con volúmenes Docker

### 🔒 Características Técnicas

- **Aislamiento**: Cada servicio en su propio contenedor
- **Service Discovery**: Comunicación por nombres de servicio
- **Auto-recuperación**: Restart automático en caso de fallos
- **Escalabilidad**: Replicación fácil de servicios
- **Seguridad**: Usuarios no-root y redes privadas

## 🌐 Acceso a Servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Aplicación Web** | http://localhost | - |
| **API Backend** | http://localhost:3000/api | - |
| **phpMyAdmin** | http://localhost:8080 | usuario: `root`, contraseña: `rootpassword` |
| **MySQL** | localhost:3306 | usuario: `root`, contraseña: `rootpassword` |

## 📈 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/db-status` | Estado de la base de datos |
| GET | `/api/users` | Listar todos los usuarios |
| POST | `/api/users` | Crear nuevo usuario |
| GET | `/api/users/:id` | Obtener usuario por ID |
| DELETE | `/api/users/:id` | Eliminar usuario |

## 🛠️ Solución de Problemas

### Error: package-lock.json no encontrado

```bash
cd backend
npm install
cd ..
docker-compose up --build
```

### Error: Puerto en uso

```bash
# Verificar puertos ocupados
netstat -tulpn | grep :80

# Cambiar puertos en docker-compose.yml si es necesario
```

### Contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Reconstruir desde cero
docker-compose down
docker system prune -f
docker-compose up --build --force-recreate
```

## 📝 Variables de Entorno

Las siguientes variables pueden ser configuradas en `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DB_HOST=mysql
  - DB_USER=root
  - DB_PASSWORD=rootpassword
  - DB_NAME=mi_app_db
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 🔗 Enlaces Útiles

- [Documentación Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [MySQL Reference](https://dev.mysql.com/doc/)