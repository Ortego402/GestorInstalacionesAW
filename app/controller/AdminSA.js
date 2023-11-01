"use strict";

const DAOAdmin = require('../dao/DAOAdmin');

class AdminsSA {

    constructor(pool) {
        this.DAOAdmin = new DAOAdmin(pool);
    }


    mostrarUsuarios(req, res, callback) {
        this.DAOAdmin.mostraTodos((err, result) => {
            return callback(err, result);
        });
    }

    organizacion(req, res, callback) {
        this.DAOAdmin.mostrarOrganizacion((err, result) => {
            return callback(err, result);
        });
    }


    organizacionEditar( req, res, callback) {
        const { nombre, direccion, imagen} = req.body;
        const nombre_original = req.session.orgNombre;
    
        this.DAOAdmin.editarOrganizacion(nombre, direccion, imagen, nombre_original, (err) => {
            if(err){
                return callback("¡Ups! Algo salió mal, vuelve a intentarlo más tarde.");
            }
            return callback("Sistema actualizado.");
        });
    }

    anyadirInstalacion(nombre, tipoReserva, imagen, aforo, horaInicio, horaFin, callback) {

        const imgData  = imagen.data;

        this.DAOAdmin.insertarInnstalacion(nombre, tipoReserva, imgData, aforo, horaInicio, horaFin, (err) => {
            if(err){
                return callback("¡Ups! Algo salió mal, vuelve a intentarlo más tarde.");
            }
            return callback(null);
        });
    }
}



module.exports = AdminsSA;
