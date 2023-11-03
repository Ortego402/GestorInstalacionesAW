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

    mostrarEmails(req, res, callback) {
        const email = req.session.email;

        this.DAOUsuarios.getEmailsUser(email, (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }

    mostrarFacultades(req, res, callback) {

        this.DAOUsuarios.getFacultades((err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }

    mostrarEmail(id, req, res, callback) {
        this.DAOUsuarios.getEmail(id, (err, results) => {

            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }

    mandarEmail(req, res, callback) {
        const { destinatario, asunto, mensaje } = req.body;
        const email_envio = req.session.email;

        this.DAOUsuarios.insertEmail(email_envio, destinatario, asunto, mensaje, (err) => {
            console.log(err)
            if (err) {
                callback(err); // Pasa el mensaje de error del DAO y SA al callback principal
            } else {
                callback(null, "Email enviado correctamente."); // Pasa un mensaje de éxito al callback principal
            }
        });
    }
    

    registerUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, contraseña, imagen_perfil, callback) {
        console.log(facultad)
        bcrypt.hash(contraseña, 10, (err, hash) => {
            if (err) {
                return callback('Error al hashear la contraseña');
            } else {
                const imgData = imagen_perfil.data;
        
                this.DAOUsuarios.insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, imgData, (err) => {
                    if(err){
                        return callback(err);
                    }
                    else{
                        return callback(null);
                    }
                });
            }
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