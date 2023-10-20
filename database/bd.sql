-- Crear tabla de usuarios
CREATE TABLE UCM_AW_RIU_USU_Usuarios (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    apellido1 VARCHAR(255) NOT NULL,
    apellido2 VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    facultad VARCHAR(255) NOT NULL,
    curso INT NOT NULL,
    grupo VARCHAR(10) NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    contraseña_visible BOOLEAN NOT NULL,
    imagen_perfil VARCHAR(255),
    rol VARCHAR(50) NOT NULL
);

-- Crear tabla de Instalaciones
CREATE TABLE UCM_AW_RIU_INS_Instalaciones (
    Id INT PRIMARY KEY,
    nombre VARCHAR(255),
    tipoReserva VARCHAR(255),
    imagen VARCHAR(255),
    aforo INT,
    horaInicio VARCHAR(255)
    horaFin VARCHAR(255)
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

-- Insertar un registro con tipo de reserva colectivo
INSERT INTO UCM_AW_RIU_INS_Instalaciones (Id, nombre, tipoReserva, imagen, aforo, horario)
VALUES (1, 'Piscina', 'colectivo', 'piscina.jpg', 100, '09:00 AM - 08:00 PM');

-- Insertar un registro con tipo de reserva individual
INSERT INTO UCM_AW_RIU_INS_Instalaciones (Id, nombre, tipoReserva, imagen, aforo, horario)
VALUES (2, 'Sala de Conferencias', 'individual', 'conferencias.jpg', 50, '09:00 AM - 05:00 PM');

-- Insertar un registro con tipo de reserva colectivo
INSERT INTO UCM_AW_RIU_INS_Instalaciones (Id, nombre, tipoReserva, imagen, aforo, horario)
VALUES (3, 'Gimnasio', 'individual', 'gimnasio.jpg', 100, '09:00 AM - 08:00 PM');

-- Insertar un registro con tipo de reserva individual
INSERT INTO UCM_AW_RIU_INS_Instalaciones (Id, nombre, tipoReserva, imagen, aforo, horario)
VALUES (4, 'Pista de Tenis', 'individual', 'tenis.jpg', 50, '09:00 AM - 05:00 PM');


