"use strict";


class DAOInstalaciones {
    constructor(pool) {
        this.pool = pool;
    }

    getAllInstalaciones(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones', function (err, instalaciones) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, instalaciones);
                    }
                });
            }
        });
    }


    searchInstalaciones(busqueda, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_INS_Instalaciones WHERE nombre LIKE ?", [`%${busqueda}%`], function (err, instalaciones) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, instalaciones);
                    }
                });
            }
        });
    }

    getInstalacion(id, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_INS_Instalaciones WHERE id LIKE ?", [id], function (err, instalacion) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, instalacion);
                    }
                });
            }
        });
    }

    obtenerReservasPorInstalacion(instalacionId, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM ucm_aw_riu_res_reservas WHERE instId = ? ORDER BY dia DESC, hora DESC", [instalacionId], function (err, results) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
      }

}


module.exports = DAOInstalaciones;
