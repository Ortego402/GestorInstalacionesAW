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

    insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, contraseña_visible, imgData, callback) {

        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos', null);
            }

            connection.query('INSERT INTO UCM_AW_RIU_USU_Usuarios (nombre, apellido1, apellido2, email, facultad, curso, grupo, contraseña, contraseña_visible, imagen_perfil, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, contraseña_visible, imgData, '0'], (err, result) => {
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
            if (err || results.length === 0) {
                return callback('El correo no existe.', null);
            } else {
                return callback(null, results[0]);
            }
        });
    }

    updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, callback) {
        const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }

            connection.query(checkEmailQuery, [correo], (checkEmailErr, checkEmailResult) => {
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
                    else{
                        return callback(null);
                    }
                });
            });
        });
    }

}

module.exports = DAOUsuarios;
