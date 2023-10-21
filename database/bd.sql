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
    Id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    tipoReserva VARCHAR(255),
    imagen VARCHAR(255),
    aforo INT,
    horaInicio VARCHAR(255),
    horaFin VARCHAR(255)
);

-- Crear tabla de Reservas
CREATE TABLE UCM_AW_RIU_RES_Reservas (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    dia VARCHAR(255),
    hora VARCHAR(255),
    usuId INT,
    instId INT,
    FOREIGN KEY (usuId) REFERENCES UCM_AW_RIU_USU_Usuarios(Id),
    FOREIGN KEY (instId) REFERENCES UCM_AW_RIU_INS_Instalaciones(Id)
);


INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Piscina', 'Colectivo', 'piscina.jpg', 100, '09:00 AM', '06:00 PM');
INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Cancha de Tenis', 'Individual', 'tenis.jpg', 2, '08:00 AM', '10:00 PM');
INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Gimnasio', 'Colectivo', 'gimnasio.jpg', 50, '07:00 AM', '09:00 PM');
INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Campo de Fútbol', 'Colectivo', 'futbol.jpg', 200, '10:00 AM', '08:00 PM');
INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Sala de Conferencias', 'Colectivo', 'conferencias.jpg', 150, '09:00 AM', '05:00 PM');
INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES ('Pista de Atletismo', 'Colectivo', 'atletismo.jpg', 300, '06:00 AM', '10:00 PM');
