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


    organizacionEditar(req, res, callback) {
        const { nombre, direccion, imagen } = req.body;
        const nombre_original = req.session.orgNombre;

        this.DAOAdmin.editarOrganizacion(nombre, direccion, imagen, nombre_original, (err) => {
            if (err) {
                return callback("¡Ups! Algo salió mal, vuelve a intentarlo más tarde.");
            }
            return callback("Sistema actualizado.");
        });
    }

    anyadirInstalacion(nombre, tipoReserva, imagen, aforo, horaInicio, horaFin, callback) {

        const imgData = imagen.data;

        this.DAOAdmin.insertarInnstalacion(nombre, tipoReserva, imgData, aforo, horaInicio, horaFin, (err) => {
            if (err) {
                return callback("¡Ups! Algo salió mal, vuelve a intentarlo más tarde.");
            }
            return callback(null);
        });
    }

    obtenerValidaciones(callback) {
        this.DAOAdmin.obtenerValidaciones((err, results) => {
            console.log(results)
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }

    validarYEliminarUsuario(id, email, callback) {
        this.DAOAdmin.validarUsuario(email, (err) => {
            if (err) {
                return callback(err);
            }

            // Luego, elimina la fila de validación en la tabla
            this.DAOAdmin.eliminarValidacion(id, (err) => {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    }

    denegarYEliminarUsuario(id, email, callback) {
        console.log(id)
        this.DAOAdmin.eliminarUsuario(email, (err) => {
            if (err) {
                return callback(err);
            }

            // Luego, elimina la fila de validación en la tabla
            this.DAOAdmin.eliminarValidacion(id, (err) => {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    }

    cambiarRolUsuario(id, callback) {
        // Primero, obtén el rol actual del usuario.
        this.DAOAdmin.mostraUsuario(id, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            // Calcula el nuevo rol alternando entre 0 y 1.
            const nuevoRol = user.rol === '1' ? '0' : '1';
            console.log(nuevoRol)
            console.log(user.rol)
            // Llama a la función DAO para cambiar el rol.
            this.DAOAdmin.cambiarRolUsuario(id, nuevoRol, (err, result) => {
                if (err) {
                    return callback(err);
                }
                // Devuelve el nuevo rol al controlador.
                callback(null, nuevoRol);
            });
        });
    }
    
}



module.exports = AdminsSA;
