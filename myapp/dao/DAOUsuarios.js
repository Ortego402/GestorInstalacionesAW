"use strict";
const bcrypt = require('bcrypt');


class DAOUsuarios {
    constructor(pool) {
        this.pool = pool;
    }

    checkEmail(email, callback) {
        const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.query(checkEmailQuery, [email], (err, result) => {
            return callback(err, result);
        });
    }

    getEmailsUser(email, callback) {
        this.pool.getConnection(function (err, connection) {
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
            };
        });
    }


    getFacultades(callback) {
        this.pool.getConnection(function (err, connection) {
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
            };
        });
    }

    getEmail(id, callback) {
        this.pool.getConnection(function (err, connection) {
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
            };
        });
    }

    leerEmail(id, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                // Realizar el UPDATE para marcar el correo como leído
                connection.query('UPDATE ucm_aw_riu_emails SET leido = ? WHERE id = ?', ['1', id], (err) => {
                    connection.release();
                    if (err) {
                        return callback("Error al actualizar el estado de lectura");
                    }

                    return callback(null);
                });
            };
        });
    }

    insertEmail(correo_envia, correo_destino, asunto, mensaje, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }
            console.log(mensaje)
            connection.query('INSERT INTO ucm_aw_riu_emails (correo_envia, correo_destino, asunto, mensaje, leido) VALUES (?, ?, ?, ?, ?)', [correo_envia, correo_destino, asunto, mensaje, '0'], (err) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar el email en la base de datos');
                }
                return callback(null);
            });
        });
    }


    insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, imgData, callback) {

        this.pool.getConnection(function (err, connection) {
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

    getUserByEmail(email, callback) {
        this.pool.getConnection(function (err, connection) {
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


    updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, email, imagen, callback) {
        const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }

            connection.query(checkEmailQuery, [email], (checkEmailErr, checkEmailResult) => {
                connection.release();
                if (checkEmailErr) {
                    return callback('Error de acceso a la base de datos');
                }
                // Comprobar el user name según sus requisitos
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

    reservasUser(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM ucm_aw_riu_res_reservas WHERE usuEmail = ? ORDER BY dia asc", [email], function (err, results) {
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

    // Método para obtener los nombres de los destinos asociados a un array de IDs
    getNombresInstalaciones(id_instalaciones, callback) {
        // Verificar si id_instalaciones es null o undefined, y asignar un array vacío si es así
        id_instalaciones = id_instalaciones || [];

        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error al conectarse a la base de datos", null);
            } else {
                // Verificar si id_instalaciones es un array no vacío
                if (id_instalaciones.length > 0) {
                    console.log(id_instalaciones[0]);
                    connection.query("SELECT id, nombre FROM ucm_aw_riu_ins_instalaciones WHERE id IN (?)", [id_instalaciones], function (err, results) {
                        connection.release();
                        if (err) {
                            return callback("Error de acceso a la base de datos dao", null);
                        } else {
                            console.log(results);
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


    // Método para eliminar una reserva por su ID
    eliminarReserva(idReserva, callback) {
        const query = 'DELETE FROM 	ucm_aw_riu_res_reservas WHERE id = ?';
        this.pool.query(query, [idReserva], (err, result) => {
            if (err) {
                return callback('Error al eliminar la reserva', null);
            }
            return callback(null);
        });
    }

    gethoras(idInstalacion, fecha, callback) {
        const query = 'SELECT hora FROM ucm_aw_riu_res_reservas WHERE instId = ? and dia = ?';
        this.pool.query(query, [idInstalacion, fecha], (err, result) => {
            if (err) {
                return callback('Error coger las horas para ese dia', null);
            }
            return callback(null, result);
        });
    }

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
