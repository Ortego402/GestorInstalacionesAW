"use strict";

const DAOInstalaciones = require('../dao/DAOInstalaciones');

class InstalacionesSA {

    constructor(pool) {
        this.DAOInstalaciones = new DAOInstalaciones(pool);
    }

    mostrarInstalaciones(req, res, callback) {
        this.DAOInstalaciones.getAllInstalaciones((err, results) => {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    }

    buscarInstalaciones(req, res, callback) {
        const searchTerm = req.query.nombreBuscar;
        console.log("SA instalaciones----------------------------------------------------------------------------------------------------------");
        console.log(req.query.nombreBuscar);
        this.DAOInstalaciones.searchInstalaciones(searchTerm, (err, instalaciones) => {
            if (err) {
                callback(err, null);
            }
            callback(null, instalaciones);
        });
    }


}


module.exports = InstalacionesSA;