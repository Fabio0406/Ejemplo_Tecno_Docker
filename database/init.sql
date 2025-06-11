-- =================================================================
-- SCRIPT DE INICIALIZACIÓN PARA MI APP DOCKER
-- =================================================================

-- Seleccionar base de datos
USE mi_app_db;

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT IGNORE INTO usuarios (nombre, email, telefono) VALUES
('Juan Pérez', 'juan.perez@email.com', '+591 7654321'),
('María García', 'maria.garcia@email.com', '+591 7654322'),
('Carlos López', 'carlos.lopez@email.com', '+591 7654323'),
('Ana Martínez', 'ana.martinez@email.com', '+591 7654324'),
('Pedro Rodríguez', 'pedro.rodriguez@email.com', '+591 7654325');

-- Crear vista para estadísticas
CREATE OR REPLACE VIEW vista_estadisticas AS
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as usuarios_ultima_semana,
    COUNT(CASE WHEN fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as usuarios_ultimo_mes,
    MIN(fecha_creacion) as primer_usuario,
    MAX(fecha_creacion) as ultimo_usuario
FROM usuarios;

-- Crear procedimiento para limpiar usuarios antiguos (opcional)
DELIMITER //
CREATE PROCEDURE LimpiarUsuariosAntiguos(IN dias INT)
BEGIN
    DECLARE usuarios_eliminados INT DEFAULT 0;
    
    SELECT COUNT(*) INTO usuarios_eliminados
    FROM usuarios 
    WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL dias DAY);
    
    DELETE FROM usuarios 
    WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL dias DAY);
    
    SELECT CONCAT('Usuarios eliminados: ', usuarios_eliminados) as resultado;
END //
DELIMITER ;

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' as mensaje;
SELECT COUNT(*) as usuarios_ejemplo FROM usuarios;