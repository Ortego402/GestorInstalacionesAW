const DAOAdmin = require('../dao/DAOAdmin');

class AdminsSA {

    constructor(pool) {
        this.DAOUsuarios = new DAOUsuarios(pool);
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
        this.DAOAdmin.editarOrganizacion(nombre, direccion, imagen, (err) => {
            if(err){
                return callback("¡Ups! Algo salió mal, vuelve a intentarlo más tarde.");
            }
            return callback("Organizacion Editada");
        });
    }



}