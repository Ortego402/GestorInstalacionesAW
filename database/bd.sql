-- Crear tabla de usuarios
CREATE TABLE UCM_AW_RIU_USU_Usuarios (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    apellido1 VARCHAR(255) NOT NULL,
    apellido2 VARCHAR(255) NOT NULL,
    facultad VARCHAR(255) NOT NULL,
    curso INT NOT NULL,
    grupo VARCHAR(10) NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    contraseña_visible BOOLEAN NOT NULL,
    imagen_perfil VARCHAR(255)
    rol VARCHAR(50) NOT NULL,
);

-- Crear tabla de Instalaciones
CREATE TABLE UCM_AW_RIU_INS_Instalaciones (
    Id INT PRIMARY KEY,
    nombre VARCHAR(255),
    tipoReserva VARCHAR(255)
);

-- Crear tabla de Reservas
CREATE TABLE UCM_AW_RIU_RES_Reservas (
    Id INT PRIMARY KEY,
    fecha DATE,
    usuId INT,
    instId INT,
    FOREIGN KEY (usuId) REFERENCES UCM_AW_RIU_USU_Usuarios(Id),
    FOREIGN KEY (instId) REFERENCES UCM_AW_RIU_INS_Instalaciones(Id)
);


