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
    

}


module.exports = UsuariosSA;