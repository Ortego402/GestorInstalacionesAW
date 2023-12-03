const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/dbConfig");
const DAOAdmin = require("../dao/DAOAdmin");
const DAOInstalaciones = require('../dao/DAOInstalaciones');
const DAOUsuarios = require('../dao/DAOUsuarios');

const multer = require('multer');
const multerFactory = multer({ storage: multer.memoryStorage() });

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);

daoAdmin = new DAOAdmin(pool);
daoinstalaciones = new DAOInstalaciones(pool);
daoUsuarios = new DAOUsuarios(pool);



router.get('/validaciones', (req, res) => {

    daoAdmin.obtenerValidaciones((err, results) => {
        if (err) {
            // Manejar el error aquí, por ejemplo, renderizando una página de error
            return res.status(500).send('Error interno del servidor');
        }
        return res.render('validacion', { validaciones: results, session: req.session });
    });
});


router.get('/cambiarRol/:id', (req, res) => {
    const id = req.params.id;
    // Primero, obtén el rol actual del usuario.
    daoAdmin.mostraUsuario(id, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en la bbdd' });
        }
        // Calcula el nuevo rol alternando entre 0 y 1.
        const nuevoRol = user.rol === '1' ? '0' : '1';
        // Llama a la función DAO para cambiar el rol.
        daoAdmin.cambiarRolUsuario(id, nuevoRol, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cambiar el rol del usuario' });
            }
            // Devuelve el nuevo rol al controlador.
            res.redirect('/home/usuarios');
        });
    });
});

router.get('/validar/:id', (req, res) => {
    const emailId = req.params.id;
    const userEmail = req.query.email;
    daoAdmin.validarUsuario(userEmail, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al validar el usuario.' });
        }
        // Luego, elimina la fila de validación en la tabla
        daoAdmin.eliminarValidacion(emailId, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la bbdd' });
            }
            daoAdmin.enviarCorreoValidacion(req.session.email, userEmail, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en la bbdd' });
                }
                return res.redirect('/home/validaciones');
            });
        });
    });
});

// Ruta para no validar un correo electrónico y eliminar la solicitud de validación
router.get('/novalidar/:id', (req, res) => {
    const emailId = req.params.id;
    const userEmail = req.query.email;

    daoAdmin.eliminarUsuario(userEmail, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al validar el correo electrónico' });
        }

        // Luego, elimina la fila de validación en la tabla
        daoAdmin.eliminarValidacion(emailId, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la bbdd' });
            }
            return res.redirect('/home/validaciones');
        });
    });
});

router.get('/buscarUsuarios', (req, res) => {
    const { campoBuscar, nombreBuscar } = req.query;

    let campoBD;

    // Mapea el campo de búsqueda a los campos correspondientes en la base de datos
    switch (campoBuscar) {
        case 'nombre':
            campoBD = 'nombre';
            break;
        case 'apellido':
            // Si el campo seleccionado es "apellido", busca por ambos apellidos
            campoBD = ['apellido1', 'apellido2'];
            break;
        case 'email':
            campoBD = 'email';
            break;
        case 'facultad':
            campoBD = 'facultad';
            break;
        default:
            // Si el campo seleccionado no es válido, llama al callback con un error
            return es.status(500).json({ error: 'Campo de búsqueda no válido' });
    }

    // Realiza la búsqueda en la base de datos según el campo seleccionado
    daoAdmin.buscarUsuarios(campoBD, nombreBuscar, (err, results) => {

        if (err != null) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        res.render('listarUsuarios', { results: results, session: req.session });
    });
});


router.get('/buscarReservas', (req, res) => {
    const { campoBuscar, nombreBuscar } = req.query;

    let campoBD;

    // Mapea el campo de búsqueda a los campos correspondientes en la base de datos
    switch (campoBuscar) {
        case 'instalacion':
            campoBD = 'instId';
            break;
        case 'fecha_inicio':
            campoBD = 'fechaInicio';
            break;
        case 'fecha_fin':
            campoBD = 'fechaFin';
            break;
        case 'id':
            campoBD = 'Id';
            break;
        case 'facultad':
            campoBD = 'facultad';
            break;
        case 'email':
            campoBD = 'usuEmail';
            break;
        default:
            // Si el campo seleccionado no es válido, llama al callback con un error
            return es.status(500).json({ error: 'Campo de búsqueda no válido' });
    }
    // Realiza la búsqueda en la base de datos según el campo seleccionado
    daoAdmin.buscarReservas(campoBD, nombreBuscar, (err, results) => {
        if (err != null) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        res.render('listarReservas', { results: results, session: req.session });

    });
});


router.get('/organizacion', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente

    daoAdmin.mostrarOrganizacion((err, results) => {
        if (err != null) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('organizacion', { results: results, session: req.session, mensaje: mensaje });
    });
});


router.post('/organizacion_editar', multerFactory.single('imagen'), (req, res) => {
    const { nombre, direccion } = req.body;
    let imagen;
    // Verifica si se ha subido una nueva imagen
    if (req.file && req.file.buffer) {
        // Si hay una nueva imagen, utiliza su buffer directamente
        imagen = req.file.buffer;
    } else if (req.session.orgIcono) {
        // Decodifica los datos binarios de Base64 a buffer
        imagen = Buffer.from(req.session.orgIcono, 'base64');
    }
    const nombre_original = req.session.orgNombre;
    daoAdmin.editarOrganizacion(nombre, direccion, imagen, nombre_original, (err) => {
        if (err != null) {
            console.log(err);
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        daoAdmin.mostrarOrganizacion((error, result) => {
            if (error != null) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            req.session.orgNombre = result.nombre;
            req.session.orgDir = result.direccion;
            req.session.orgIcono = result.imagen;
            return res.redirect('/home/organizacion?mensaje=' + encodeURIComponent(err));
        });
    });
});


router.get('/usuarios', (req, res) => {
    // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
    daoAdmin.mostrarUsuarios((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }

        res.render('listarUsuarios', { results: results, session: req.session });

    });
});


router.get('/reservas', (req, res) => {
    daoinstalaciones.obtenerReservasConNombreInstalacion((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        console.log(results)
        res.render('listarReservas', { results: results, session: req.session });
    });
});


router.get('/instalacion', (req, res) => {
    return res.render('instalacion', { session: req.session });
});


router.post('/nueva_instalacion', multerFactory.single('imagen'), (req, res) => {
    // Desestructura los datos del cuerpo de la solicitud y el archivo cargado
    const { nombre, tipoReserva, aforo, horaInicio, horaFin } = req.body;
    let imagen = req.file.buffer; // Ajusta para usar null en lugar de una cadena vacía

    daoAdmin.insertarInnstalacion(nombre, tipoReserva, imagen, aforo, horaInicio, horaFin, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.redirect('/home');
    });
});

module.exports = router;