"use strict";

class DAOAdmin{

    constructor(pool) {
        this.pool = pool;
    }

    mostraTodos(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_USU_Usuarios", function (err, users) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, users);
                    }
                });
            }
        });
    }

    mostrarOrganizacion(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM UCM_AW_RIU_ORG_organizacion', function (err, org) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, org[0]);
                    }
                });
            }
        });
    }

    editarOrganizacion(nombre, direccion, imagen, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('UPDATE UCM_AW_RIU_ORG_organizacion SET NOMBRE = ?, DIRECCION = ? AND IMAGEN ? WHERE NOMBRE = ?',[nombre, direccion, imagen, req.session.organizacionNombre], function (err, org) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, org[0]);
                    }
                });
            }
        });
    }

}


module.exports = DAOAdmin;