"use strict";
const bcrypt = require('bcrypt');

class DAOUsuarios {
    constructor(pool) {
        this.pool = pool;
    }

    // Verifica si un correo electrónico ya está registrado en la base de datos
    checkEmail(email, callback) {
        const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.query(checkEmailQuery, [email], (err, result) => {
            return callback(err, result);
        });
    }

    // Obtiene los correos electrónicos enviados a un usuario, ordenados por fecha descendente
    getEmailsUser(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM ucm_aw_riu_emails WHERE correo_destino = ? ORDER BY fecha desc', [email], (err, result) => {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    }

                    return callback(null, result);
                });
            }
        });
    }

    // Obtiene todas las facultades desde la base de datos
    getFacultades(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM ucm_aw_riu_facultades', (err, results) => {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    }

                    return callback(null, results);
                });
            }
        });
    }

    // Obtiene un correo electrónico por su ID
    getEmail(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM ucm_aw_riu_emails WHERE id = ?', [id], (err, result) => {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    }

                    return callback(null, result[0]);
                });
            }
        });
    }

    // Marca un correo electrónico como leído
    leerEmail(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                // Realiza el UPDATE para marcar el correo como leído
                connection.query('UPDATE ucm_aw_riu_emails SET leido = ? WHERE id = ?', ['1', id], (err) => {
                    connection.release();
                    if (err) {
                        return callback("Error al actualizar el estado de lectura");
                    }

                    return callback(null);
                });
            }
        });
    }

    // Inserta un nuevo correo electrónico en la base de datos
    insertEmail(correo_envia, correo_destino, asunto, mensaje, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }
            connection.query('INSERT INTO ucm_aw_riu_emails (correo_envia, correo_destino, asunto, mensaje, leido) VALUES (?, ?, ?, ?, ?)', [correo_envia, correo_destino, asunto, mensaje, '0'], (err) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar el email en la base de datos');
                }
                return callback(null);
            });
        });
    }

    // Inserta un nuevo usuario en la base de datos
    insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, imgData, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback('Error de acceso a la base de datos', null);
            }

            connection.query('INSERT INTO UCM_AW_RIU_USU_Usuarios (nombre, apellido1, apellido2, email, facultad, curso, grupo, contraseña, imagen_perfil, rol, validado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, imgData, '0', '0'], (err, result) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar usuario en la base de datos', null);
                }
                return callback(null, result);
            });
        });
    }

    // Obtiene un usuario por su correo electrónico
    getUserByEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }
            connection.query('SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?', [email], (err, results) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar el email en la base de datos', null);
                }
                if (results.length === 0) {
                    return callback('El correo no existe.', null);
                }
                return callback(null, results[0]);
            });
        });
    }

    // Actualiza la información de un usuario en la base de datos
    updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, email, imagen, callback) {
        const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }

            connection.query(checkEmailQuery, [email], (checkEmailErr, checkEmailResult) => {
                connection.release();
                if (checkEmailErr) {
                    return callback('Error de acceso a la base de datos');
                }
                // Comprobar el correo electrónico según sus requisitos
                if (checkEmailResult.length > 0 && email !== req.session.email) {
                    return callback('El correo ya existe.');
                }
                // Actualizar datos en la base de datos
                connection.query('UPDATE UCM_AW_RIU_USU_Usuarios SET nombre = ?, apellido1 = ?, apellido2 = ?, facultad = ?, curso = ?, grupo = ?, imagen_perfil = ? WHERE Id = ?', [nombre, apellido1, apellido2, facultad, curso, grupo, imagen, checkEmailResult[0].Id], (err, result) => {
                    if (err) {
                        return callback('Error al actualizar usuario en la base de datos');
                    }
                    else {
                        return callback(null);
                    }
                });
            });
        });
    }

    // Inserta una nueva validación en la base de datos
    insertValidacion(email, callback) {
        const sql = "INSERT INTO UCM_AW_RIU_Validaciones (email) VALUES (?)";
        this.pool.query(sql, [email], (err) => {
            if (err) {
                return callback('Error al insertar mensaje de validación en la base de datos.');
            } else {
                return callback(null);
            }
        });
    }

    // Obtiene las reservas asociadas a un usuario
    reservasUser(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM ucm_aw_riu_res_reservas WHERE usuEmail = ? ORDER BY dia asc", [email], (err, results) => {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    } else {
                        return callback(null, results);
                    }
                });
            }
        });
    }

    // Obtiene los nombres de las instalaciones asociadas a un array de IDs
    getNombresInstalaciones(id_instalaciones, callback) {
        // Verificar si id_instalaciones es null o undefined, y asignar un array vacío si es así
        id_instalaciones = id_instalaciones || [];

        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback("Error al conectarse a la base de datos", null);
            } else {
                // Verificar si id_instalaciones es un array no vacío
                if (id_instalaciones.length > 0) {
                    connection.query("SELECT id, nombre FROM ucm_aw_riu_ins_instalaciones WHERE id IN (?)", [id_instalaciones], (err, results) => {
                        connection.release();
                        if (err) {
                            return callback("Error de acceso a la base de datos dao", null);
                        } else {
                            return callback(null, results);
                        }
                    });
                } else {
                    // Si id_instalaciones es un array vacío, retorna un array vacío sin realizar la consulta
                    connection.release();
                    return callback(null, []);
                }
            }
        });
    }

    // Elimina una reserva por su ID
    eliminarReserva(idReserva, callback) {
        const query = 'DELETE FROM ucm_aw_riu_res_reservas WHERE id = ?';
        this.pool.query(query, [idReserva], (err, result) => {
            if (err) {
                return callback('Error al eliminar la reserva', null);
            }
            return callback(null);
        });
    }

    // Obtiene una reserva por su ID
    obtenerReserva(idReserva, callback) {
        const query = 'SELECT * FROM ucm_aw_riu_res_reservas WHERE Id = ?';
        this.pool.query(query, [idReserva], (err, result) => {
            if (err) {
                return callback('Error al eliminar la reserva', null);
            }
            return callback(null, result);
        });
    }

    // Obtiene las horas reservadas para una instalación en un día específico
    gethoras(idInstalacion, fecha, callback) {
        const query = 'SELECT hora FROM ucm_aw_riu_res_reservas WHERE instId = ? and dia = ?';
        this.pool.query(query, [idInstalacion, fecha], (err, result) => {
            if (err) {
                return callback('Error al obtener las horas para ese día', null);
            }
            return callback(null, result);
        });
    }

    // Registra a un usuario en la lista de espera para una instalación y fecha específicas
    apuntarListaEspera(idInstalacion, fecha, usuario, callback) {
        const query = 'INSERT INTO ucm_aw_riu_list_listaespera (instId, fecha, usuEmail) VALUES (?, ?, ?)';
        this.pool.query(query, [idInstalacion, fecha, usuario], (err) => {
            if (err) {
                return callback('Error al insertar en la lista de espera');
            }
            return callback(null);
        });
    }

    // Obtiene información de la lista de espera para una instalación y fecha específicas
    obtenerListaEsperaInfo(idInstalacion, fecha, callback) {
        const query = 'SELECT l.id, l.usuEmail, l.instId, l.fecha, i.nombre AS instalacion_nombre FROM ucm_aw_riu_list_listaespera l JOIN ucm_aw_riu_ins_instalaciones i ON l.instId = i.Id WHERE l.instId = ? AND l.fecha = ? ORDER BY id DESC';
    
        this.pool.query(query, [idInstalacion, fecha], (err, results) => {
            if (err) {
                return callback('Error al obtener información de la lista de espera', null);
            }
            return callback(null, results);
        });
    }    

    // Elimina una entrada de la lista de espera por su ID
    eliminarListaEspera(idLista, callback) {
        const query = 'DELETE FROM ucm_aw_riu_list_listaespera WHERE id = ?';

        this.pool.query(query, [idLista], (err) => {
            if (err) {
                return callback('Error al eliminar de la lista de espera');
            }
            return callback(null);
        });
    }

    // Obtiene el número de reservas para una instalación, día y hora específicos
    getNumReservas(idInstalacion, dia, hora, callback) {
        const query = 'SELECT COUNT(*) AS numReservas FROM ucm_aw_riu_res_reservas WHERE instId = ? AND dia = ? AND hora = ?';

        this.pool.query(query, [idInstalacion, dia, hora], (err, result) => {
            if (err) {
                return callback('Error al obtener el número de reservas para ese día y hora', null);
            }
            const numReservas = result[0] ? result[0].numReservas : 0;
            return callback(null, numReservas);
        });
    }
}

module.exports = DAOUsuarios;
