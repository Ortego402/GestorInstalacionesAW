"use strict";

class DAOAdmin {

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

    mostraUsuario(id, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE id = ?", [id], function (err, users) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, users[0]);
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

    editarOrganizacion(nombre, direccion, imagenData, nombre_original, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos");
            } else {
                let query = 'UPDATE UCM_AW_RIU_ORG_organizacion SET nombre = ?, direccion = ?';
                const params = [nombre, direccion];

                // Si hay imagenData, agrega imagen a la consulta y parámetros
                if (imagenData) {
                    const imagenBinaria = Buffer.from(imagenData, 'base64');
                    query += ', imagen = ?';
                    params.push(imagenBinaria);
                }

                query += ' WHERE NOMBRE = ?';
                params.push(nombre_original);

                connection.query(query, params, function (err) {
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


    insertarInnstalacion(nombre, tipoReserva, imagen, aforo, horaInicio, horaFin, callback) {

        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos', null);
            }

            connection.query('INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horaInicio, horaFin) VALUES (?, ?, ?, ?, ?, ?)', [nombre, tipoReserva, imagen, aforo, horaInicio, horaFin], (err, result) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar instalacion en la base de datos', null);
                }
                return callback(null, result);
            });
        });

    }

    obtenerValidaciones(callback) {
        const query = "SELECT * FROM UCM_AW_RIU_Validaciones ORDER BY fecha_creacion desc;";
        console.log("hola")
        this.pool.query(query, (err, results) => {
            console.log(results)

            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }

    validarUsuario(email, callback) {
        const query = 'UPDATE UCM_AW_RIU_USU_Usuarios SET validado = ? WHERE email = ?';
        this.pool.query(query, ['1', email], (err, results) => {
            if (err || results.length === 0) {
                return callback('El usuario no existe.', null);
            } else {
                return callback(null, results[0]);
            }
        });
    }

    eliminarValidacion(id, callback) {
        const query = 'DELETE FROM UCM_AW_RIU_Validaciones WHERE id = ?';
        this.pool.query(query, [id], (err, results) => {
            if (err) {
                return callback('Error al eliminar la validación.', null);
            } else {
                return callback(null, 'Validación eliminada correctamente.');
            }
        });
    }

    eliminarUsuario(email, callback) {
        const query = 'DELETE FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
        this.pool.query(query, [email], (err, results) => {
            if (err) {
                return callback('Error al eliminar la validación.', null);
            } else {
                return callback(null, 'Validación eliminada correctamente.');
            }
        });
    }

    cambiarRolUsuario(id, nuevoRol, callback) {
        // Realiza la actualización del rol en tu base de datos.
        const query = 'UPDATE UCM_AW_RIU_USU_Usuarios SET rol = ? WHERE Id = ?';
        this.pool.query(query, [nuevoRol, id], (err, result) => {
            if (err) {
                return callback(err);
            }
            // Devuelve el resultado al servicio.
            callback(null, result);
        });
    }
    
}


module.exports = DAOAdmin;