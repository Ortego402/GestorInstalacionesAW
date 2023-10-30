"use strict";

const DAOUsuarios = require('../dao/DAOUsuarios');
const bcrypt = require('bcrypt');

class UsuariosSA {

    constructor(pool) {
        this.DAOUsuarios = new DAOUsuarios(pool);
    }

    checkEmail(email, callback) {
        this.DAOUsuarios.checkEmail(email, (err, result) => {
            return callback(err, result);
        });
    }

    registerUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, contraseña, contraseña_visible, imagen_perfil) {
        bcrypt.hash(contraseña, 10, (err, hash) => {
            if (err) {
                return callback('Error al hashear la contraseña', null);
            }

            const imgData  = imagen_perfil.data;

            this.DAOUsuarios.insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, contraseña_visible, imgData, (err, result) => {
                return callback(err, result);
            });
        });
    }

    iniciarSesion(req, res, callback) {
        const { email, password } = req.body;

        this.DAOUsuarios.getUserByEmail(email, (err, user) => {
            if (err) {
                return callback(err);
            } else {
                bcrypt.compare(password, user.contraseña, (bcryptErr, result) => {
                    if (bcryptErr) {
                        return callback('Error al comparar contraseñas.');
                    } else if (result) {
                        req.session.email = email;
                        req.session.Id = user.Id;
                        req.session.rol = user.rol;
                        return callback(null); // Pasa null si no hay errores
                    } else {
                        return callback('Contraseña incorrecta.');
                    }
                });
            }
        });
    }
    
    mostrarPerfil(req, res, callback) {
        const email = req.session.email;
        this.DAOUsuarios.checkEmail(email, (err, result) => {
            return callback(err, result);
        });
    }

    actualizarPerfil(req, res, callback) {
        const { correo, nombre, apellido1, apellido2, facultad, curso, grupo } = req.body;

        this.DAOUsuarios.updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, (err) => {
            if (err) {
                return callback(err);
            }
            else{
                req.session.email = email;
                return callback("Perfil actualizado.");
            }
        });
    }

}


module.exports = UsuariosSA;