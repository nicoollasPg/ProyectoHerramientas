--  BASE DE DATOS BARBERÍA 
DROP DATABASE IF EXISTS barberia_db;
CREATE DATABASE barberia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barberia_db;

-- 1. USUARIOS 
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    hash_contrasena VARCHAR(255) NOT NULL,  
    correo VARCHAR(100) NOT NULL UNIQUE,    
    dni VARCHAR(15) NOT NULL UNIQUE,      
    rol ENUM('admin', 'recepcionista', 'barbero', 'cliente') NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    -- ÍNDICES para rendimiento
    INDEX idx_rol (rol),
    INDEX idx_dni (dni),
    INDEX idx_correo (correo)
) ENGINE=InnoDB;

-- 2. SERVICIOS
CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_minutos INT DEFAULT 30,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB;

-- 3. PROMOCIONES
CREATE TABLE promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    porcentaje_descuento DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    activa BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE,
    fecha_fin DATE,
    usos_maximos INT DEFAULT NULL,
    usos_actuales INT DEFAULT 0
) ENGINE=InnoDB;

-- 4. CONTENIDO
CREATE TABLE contenido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    tipo ENUM('home', 'acerca', 'servicios', 'contacto') NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 5. HORARIOS BARBEROS
CREATE TABLE horarios_barberos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_barbero INT NOT NULL,
    dia_semana TINYINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Domingo, 7=Sábado
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (id_barbero) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_horario (id_barbero, dia_semana),
    INDEX idx_barbero_dia (id_barbero, dia_semana)
) ENGINE=InnoDB;

-- 6. RESERVAS 
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,               
    id_barbero INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    notas TEXT,
    codigo_promocion VARCHAR(50) NULL,
    precio_final DECIMAL(10, 2),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_barbero) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id) ON DELETE RESTRICT,
    
    --  ÍNDICES críticos
    INDEX idx_fecha_hora (fecha_hora),
    INDEX idx_estado (estado),
    INDEX idx_barbero (id_barbero),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB;


