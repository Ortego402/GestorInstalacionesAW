"use strict";


class DAOInstalaciones {
    constructor(pool) {
        this.pool = pool;
    }

    getAllInstalaciones(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            }

            connection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones', (err, instalaciones) => {
                connection.release();

                if (err) {
                    return callback("Error al ejecutar la consulta en la base de datos", null);
                }
                callback(null, instalaciones);
            });
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
                        callback(null, instalacion[0]);
                    }
                });
            }
        });
    }

    obtenerReservasConNombreInstalacion(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query(
                    "SELECT r.*, i.nombre AS nombre_instalacion, u.facultad AS facultad " +
                    "FROM ucm_aw_riu_res_reservas r " +
                    "LEFT JOIN UCM_AW_RIU_INS_Instalaciones i ON r.instId = i.id " +
                    "LEFT JOIN ucm_aw_riu_usu_usuarios u ON r.usuEmail = u.email " +
                    "ORDER BY r.dia DESC, r.hora DESC",
                    function (err, results) {
                        connection.release();
                        if (err) {
                            return callback("Error de acceso a la base de datos", null);
                        } else {
                            return callback(null, results);
                        }
                    }
                );
            }
        });
    }

    obtenerReservasPorInstalacion(id, callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                console.log("holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                connection.query(
                    "SELECT * FROM ucm_aw_riu_res_reservas r " +
                    "LEFT JOIN UCM_AW_RIU_INS_Instalaciones i ON r.instId = i.id " +
                    "WHERE instId = ?",
                    [id], function (err, results) {
                        connection.release();
                        if (err) {
                            callback("Error de acceso a la base de datos", null);
                        } else {
                            console.log(results);
                            callback(null, results);
                        }
                    }
                );
            }
        });
    }
    
    reservaInstalacion(id, dia, hora, email, callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("INSERT INTO `ucm_aw_riu_res_reservas` (`dia`, `hora`, `usuEmail`, `instId`)VALUES ( ?, ?, ?, ?);", [dia, hora, email, id], function (err) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos");
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }

}


module.exports = DAOInstalaciones;
