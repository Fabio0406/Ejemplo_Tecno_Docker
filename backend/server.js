const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'mi_app_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexiones
let pool;

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        console.log('🔄 Conectando a MySQL...');
        
        // Crear pool de conexiones
        pool = mysql.createPool(dbConfig);
        
        // Verificar conexión
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL exitosamente');
        
        // Crear tabla si no existe
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Tabla usuarios verificada/creada');
        connection.release();
        
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        // Reintentar conexión después de 5 segundos
        setTimeout(initializeDatabase, 5000);
    }
}

// Middleware para verificar conexión a DB
const checkDbConnection = async (req, res, next) => {
    if (!pool) {
        return res.status(503).json({ 
            error: 'Base de datos no disponible',
            message: 'El servidor está iniciando, por favor intente nuevamente'
        });
    }
    next();
};

// =================================================================
// RUTAS DE LA API
// =================================================================

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Verificar estado de la base de datos
app.get('/api/db-status', async (req, res) => {
    try {
        if (!pool) {
            throw new Error('Pool de conexiones no disponible');
        }
        
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        
        res.json({ 
            status: 'OK', 
            message: 'Base de datos conectada',
            database: dbConfig.database 
        });
    } catch (error) {
        console.error('Error verificando DB:', error);
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Error de conexión a la base de datos',
            error: error.message 
        });
    }
});

// Obtener todos los usuarios
app.get('/api/users', checkDbConnection, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, nombre, email, telefono, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios'
        });
    }
});

// Obtener usuario por ID
app.get('/api/users/:id', checkDbConnection, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT id, nombre, email, telefono, fecha_creacion FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${id}`
            });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el usuario'
        });
    }
});

// Crear nuevo usuario
app.post('/api/users', checkDbConnection, async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        
        // Validaciones
        if (!nombre || !email || !telefono) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                message: 'Nombre, email y teléfono son requeridos'
            });
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Email inválido',
                message: 'Por favor, ingrese un email válido'
            });
        }
        
        // Insertar usuario
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nombre, email, telefono) VALUES (?, ?, ?)',
            [nombre.trim(), email.trim(), telefono.trim()]
        );
        
        // Obtener el usuario creado
        const [newUser] = await pool.execute(
            'SELECT id, nombre, email, telefono, fecha_creacion FROM usuarios WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser[0]
        });
        
    } catch (error) {
        console.error('Error creando usuario:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                error: 'Email duplicado',
                message: 'Ya existe un usuario con ese email'
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo crear el usuario'
        });
    }
});

// ELIMINAR usuario
app.delete('/api/users/:id', checkDbConnection, async (req, res) => {
    try {
        const { id } = req.params;
                
        // Verificar si el usuario existe
        const [existingUser] = await pool.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (existingUser.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${id}`
            });
        }
        
        // Eliminar usuario
        await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        
        res.json({
            message: 'Usuario eliminado exitosamente',
            deletedUser: existingUser[0]
        });
        
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar el usuario'
        });
    }
});

// Ruta para estadísticas
app.get('/api/stats', checkDbConnection, async (req, res) => {
    try {
        const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        const [recentResult] = await pool.execute(
            'SELECT COUNT(*) as recent FROM usuarios WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        
        res.json({
            totalUsers: countResult[0].total,
            recentUsers: recentResult[0].recent,
            serverUptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las estadísticas'
        });
    }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: 'Ocurrió un error inesperado'
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Inicializar base de datos
        await initializeDatabase();
        
        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 ===================================');
            console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
            console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 Base de datos: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
            console.log('🚀 ===================================');
        });
        
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de señales del sistema
process.on('SIGTERM', async () => {
    console.log('📤 Recibida señal SIGTERM, cerrando servidor...');
    if (pool) {
        await pool.end();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📤 Recibida señal SIGINT, cerrando servidor...');
    if (pool) {
        await pool.end();
    }
    process.exit(0);
});

// Iniciar aplicación
startServer();