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

                    return callback(null, result);
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
            connection.query('INSERT INTO ucm_aw_riu_emails (correo_envia, correo_destino, asunto, mensaje) VALUES (?, ?, ?, ?)', [correo_envia, correo_destino, asunto, mensaje], (err) => {
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
        const query = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.query(query, [email], (err, results) => {
            if (err) {
                return callback('Error en la consulta de la base de datos.', null);
            }
    
            if (results.length === 0) {
                return callback('El correo no existe.', null);
            }
    
            return callback(null, results[0]);
        });
    }
    

    updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, email, callback) {
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
                    return callback('El nombre de usuario ya existe.');
                }
                // Actualizar datos en la base de datos
                connection.query('UPDATE UCM_AW_RIU_USU_Usuarios SET nombre = ?, apellido1 = ?, apellido2 = ?, facultad = ?, curso = ?, grupo = ? WHERE Id = ?', [nombre, apellido1, apellido2, facultad, curso, grupo, checkEmailResult[0].Id], (err, result) => {
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

}

module.exports = DAOUsuarios;
