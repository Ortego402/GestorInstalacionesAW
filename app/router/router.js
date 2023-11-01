const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const config = require("../../config/dbConfig");
const UsuariosSA = require("../controller/UsuariosSA");
const InstalacionesSA = require("../controller/InstalacionesSA");
const AdminsSA = require("../controller/AdminSA");
const session = require('express-session');

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);
const usuariosSA = new UsuariosSA(pool);
const instalacionesSA = new InstalacionesSA(pool);
const adminsSA = new AdminsSA(pool)

router.get('/', (req, res) => {
    let mensaje = "";
    return res.render("login", { session: req.session, mensaje : mensaje});
});

router.get('/home', (req, res) => {
    instalacionesSA.mostrarInstalaciones(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('home', { results: results, session: req.session });
    });
});

router.post('/InicioSesion', (req, res) => {
    usuariosSA.iniciarSesion(req, res, (err) => {
        if (err) {
            return res.render('login', { mensaje: err }); // Muestra el mensaje de error
        }

        adminsSA.organizacion(req, res, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error de la base de datos' });
            }
    
            req.session.orgNombre = results.nombre;
            req.session.orgDir= results.direccion;
            req.session.orgIcono = results.imagen;

            res.redirect('/home'); // Redirige a la página principal si no hay errores

        });
    });
});

router.get('/email', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    console.log(mensaje)

    usuariosSA.mostrarEmails(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('email', { results: results, session: req.session, mensaje : mensaje });
    });
});

router.get('/email/:id', (req, res) => {
    const id = req.params.id;
    usuariosSA.mostrarEmail(id, req, res, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('email_individual', { result: result[0], session: req.session });
    });
});

router.post('/email', (req, res) => {
    usuariosSA.mandarEmail(req, res, (err, mensaje) => {
        console.log(err)
        console.log(mensaje)

        res.redirect('/email?mensaje=' + encodeURIComponent(mensaje)); // Utiliza el mensaje del callback
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        return res.redirect('/');
    });
});

router.get('/registro', (req, res) => {
    let mensaje = "";
    usuariosSA.mostrarFacultades(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render("registro", { session: req.session, mensaje: mensaje, results : results });
    });
});

router.post('/registrar', (req, res) => {
    const { nombre, apellido1, apellido2, email, facultad, curso, grupo, password, confirmPassword} = req.body;
    const img = req.files.img;  // Se coge del req por que las files estan aqui

    usuariosSA.checkEmail(email, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.length > 0) {
            return res.render('registro', { mensaje: 'El correo ya existe.', nombre, apellido1, apellido2, email, facultad, curso, grupo,  facultades: req.body.facultades });
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\W/.test(password) || password !== confirmPassword) {
            return res.render('registro', { mensaje: 'Las credenciales no cumplen con los requisitos.', nombre, apellido1, apellido2, email, facultad, curso, grupo,  facultades: req.body.facultades });
        }

        usuariosSA.registerUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, password, password, img, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            req.session.nombre = nombre;
            req.session.apellido1 = apellido1;
            req.session.apellido2 = apellido2;
            req.session.email = email;
            req.session.facultad = facultad;
            req.session.curso = curso;
            req.session.grupo = grupo;
            req.session.rol = "0";
            adminsSA.organizacion(req, res, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Error de la base de datos' });
                }
                req.session.orgNombre = results.nombre;
                req.session.orgDir= results.direccion;
                req.session.orgIcono = results.imagen;
                return res.redirect('/home');
            });
        });
    });
});

router.get('/perfil', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    usuariosSA.mostrarPerfil(req, res, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
            
        }

        req.session.nombre = result[0].nombre;
        req.session.apellido1 = result[0].apellido1;
        req.session.apellido2 = result[0].apellido2;
        req.session.email = result[0].email;
        req.session.facultad = result[0].facultad;
        req.session.curso = result[0].curso;
        req.session.grupo = result[0].grupo;
        req.session.rol = result[0].rol;
        req.session.imagen = result[0].imagen;

        res.render('perfil', { result: result[0], session: req.session, mensaje: mensaje });
    });
});

router.post('/actualizar_perfil', (req, res) => {
    usuariosSA.actualizarPerfil(req, res, (err) => {
        res.redirect('/perfil?mensaje=' + encodeURIComponent(err));
    });
});

router.get('/buscar', (req, res) => {
    instalacionesSA.buscarInstalaciones(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('home', { results: results, session: req.session });
    });
});

router.get('/organizacion', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    adminsSA.organizacion(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('organizacion', { results: results, session: req.session, mensaje: mensaje  });
    });
});

router.post('/organizacion_editar', (req, res) => {
    adminsSA.organizacionEditar(req, res, (err) => {
        return res.redirect('/organizacion?mensaje=' + encodeURIComponent(err));
    });
});

//sin hacer
router.get('/servicios', (req, res) => {
    res.render('servicios', { session: req.session });
});

router.get('/usuarios', (req, res) => {
    // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
    adminsSA.mostrarUsuarios(req, res, (err, results) => {
    if (err) {
    return res.status(500).json({ error: 'Error de la base de datos' });
    }
    
    res.render('listarUsuarios', { results: results, session: req.session});
  
    });
});

//sin hacer
router.get('/validacion', (req, res) => { 
    return res.render('validacion', { session: req.session });
});

//no se como se hace lo que habia en app.js antes no lo entiendo
router.get('/reserva/:id', (req, res) => {

    const id = req.params.id;

    instalacionesSA.reservar(id, (err, results) =>{
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('reserva', { results: results[0], session: req.session });
    }); 

});

router.get('/instalacion', (req, res) => {
    return res.render('instalacion', {session: req.session});
});

router.post('/nueva_instalacion', (req, res) => {
    const { nombre, tipoReserva, aforo, horaInicio, horaFin} = req.body;
    const imagen = req.files.imagen; 

    adminsSA.anyadirInstalacion(nombre, tipoReserva, imagen, aforo, horaInicio, horaFin, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.redirect('/home');
    });
});
  
module.exports = router;