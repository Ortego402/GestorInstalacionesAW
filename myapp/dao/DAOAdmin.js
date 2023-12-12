"use strict";

class DAOAdmin {

    constructor(pool) {
        this.pool = pool;
    }

    mostrarUsuarios(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_USU_Usuarios ORDER BY nombre", function (err, users) {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    } else {
                        return callback(null, users);
                    }
                });
            }
        });
    }

    mostraUsuario(id, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query("SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE id = ?", [id], function (err, users) {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    } else {
                        return callback(null, users[0]);
                    }
                });
            }
        });
    }

    mostrarOrganizacion(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos", null);
            } else {
                connection.query('SELECT * FROM UCM_AW_RIU_ORG_organizacion', function (err, org) {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos", null);
                    } else {
                        return callback(null, org[0]);
                    }
                });
            }
        });
    }

    editarOrganizacion(nombre, direccion, imagenData, nombre_original, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback("Error de acceso a la base de datos");
            } else {
                let query = 'UPDATE UCM_AW_RIU_ORG_organizacion SET nombre = ?, direccion = ?, imagen = ? WHERE NOMBRE = ?';
                const params = [nombre, direccion, imagenData, nombre_original];
                connection.query(query, params, function (err) {
                    connection.release();
                    if (err) {
                        return callback("Error de acceso a la base de datos");
                    } else {
                        return callback(null);
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
        this.pool.query(query, (err, results) => {
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
                return callback('El usuario no existe.');
            } else {
                return callback(null);
            }
        });
    }

    eliminarValidacion(id, callback) {
        const query = 'DELETE FROM UCM_AW_RIU_Validaciones WHERE id = ?';
        this.pool.query(query, [id], (err, results) => {
            if (err) {
                return callback('Error al eliminar la validación.');
            } else {
                return callback(null);
            }
        });
    }

    enviarCorreoValidacion(correo_envia, correo_destino, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                return callback('Error de acceso a la base de datos');
            }
            connection.query('INSERT INTO ucm_aw_riu_emails (correo_envia, correo_destino, asunto, mensaje) VALUES (?, ?, ?, ?)', [correo_envia, correo_destino, "¡Bienvenido!", "¡Muy buenas!, tu cuenta de usuario ha sido verificada con éxito. ¡Disfruta de todas las instalaciones de la Universidad Complutense de Madrid!"], (err) => {
                connection.release();
                if (err) {
                    return callback('Error al insertar el email en la base de datos');
                }
                return callback(null);
            });
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

    buscarUsuarios(campo, valor, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                let sql;

                // Construir la consulta SQL según el campo de búsqueda
                if (Array.isArray(campo)) {
                    // Si el campo es un array (caso de 'apellido' que busca en ambos apellidos)
                    sql = "SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE ?? LIKE ? OR ?? LIKE ? ORDER BY nombre";
                } else {
                    // Para otros campos como 'nombre', 'email', 'facultad'
                    sql = "SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE ?? LIKE ? ORDER BY nombre";
                }

                // Consulta SQL dinámica
                const values = Array.isArray(campo) ? [campo[0], `%${valor}%`, campo[1], `%${valor}%`] : [campo, `%${valor}%`];

                connection.query(sql, values, function (err, usuarios) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, usuarios);
                    }
                });
            }
        });
    }

    buscarReservas(campo, valor, callback) {
        let sql = "SELECT r.*, i.nombre AS nombre_instalacion, u.facultad FROM ucm_aw_riu_res_reservas r " +
            "LEFT JOIN UCM_AW_RIU_INS_Instalaciones i ON r.instId = i.id " +
            "LEFT JOIN ucm_aw_riu_usu_usuarios u ON r.usuEmail = u.email ";

        const values = [];

        if (campo === 'instId') {
            sql += "WHERE i.nombre LIKE ?";
            values.push(`%${valor}%`);
        } else if (campo === 'fechaInicio') {
            sql += "WHERE r.dia >= ?";
            values.push(`%${valor}%`);
        } else if (campo === 'fechaFin') {
            sql += "WHERE r.dia <= ?";
            values.push(`%${valor}%`);
        } else if (campo === 'Id') {
            sql += "WHERE r.Id LIKE ?";
            values.push(`%${valor}%`);
        } else if (campo === 'usuEmail') {
            sql += "WHERE r.usuEmail LIKE ?";
            values.push(`%${valor}%`);
        } else if (campo === 'facultad') {
            sql += "WHERE u.facultad LIKE ?";
            values.push(`%${valor}%`);
        } else {
            // Si el campo seleccionado no es válido, llama al callback con un error
            return callback('Campo de búsqueda no válido', null);
        }

        sql += " ORDER BY r.dia DESC, r.hora DESC";

        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback("Error de acceso a la base de datos", null);
            } else {
                connection.query(sql, values, function (err, reservas) {
                    connection.release();
                    if (err) {
                        callback("Error de acceso a la base de datos", null);
                    } else {
                        callback(null, reservas);
                    }
                });
            }
        });
    }
}

module.exports = DAOAdmin;