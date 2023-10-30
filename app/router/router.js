const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload'); //para usar file correctamente es necesario instalarse =>npm install express express-fileupload
const session = require('express-session'); //para manejar los incios de seseion es necesario instalarse =>npm install express express-session
const config = require("../../config/dbConfig");
const UsuariosSA = require("../controller/UsuariosSA");
const InstalacionesSA = require("../controller/InstalacionesSA");
const AdminsSA = require("../controller/AdminsSA");

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);
const UsuariosSA = new UsuariosSA(pool);
const InstalacionesSA = new InstalacionesSA(pool);
const AdminsSA = new AdminsSA(pool)

// Configura Express para usar bodyParser y EJS como motor de plantillas
router.use(express.urlencoded({ extended: true }));
router.set('view engine', 'ejs');
//para coger las imagenes
router.use('/public', express.static('public'));

router.use(fileUpload());

router.get('/', (req, res) => {
    return res.render("login", { session: req.session});
});

router.get('/home', (req, res) => {
    InstalacionesSA.mostrarInstalaciones(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('home', { results: results, session: req.session });
    });
});

router.post('/InicioSesion', (req, res) => {
    UsuariosSA.iniciarSesion(req, res, (err) => {
        if (err) {
            return res.render('login', { mensaje: err }); // Muestra el mensaje de error
        }
        return res.redirect('/home'); // Redirige a la página principal si no hay errores
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        return res.redirect('/login');
    });
});

router.get('/registro', (req, res) => {
    let mensaje = "";
    return res.render("registro", { session: req.session, mensaje: mensaje });
});

router.post('/registrar', (req, res) => {
    const { nombre, apellido1, apellido2, email, facultad, curso, grupo, password, confirmPassword} = req.body;
    const img = req.files.img;  // Se coge del req por que las files estan aqui

    UsuariosSA.checkEmail(email, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.length > 0) {
            return res.render('registro', { mensaje: 'El correo ya existe.', nombre, apellido1, apellido2, email, facultad, curso, grupo });
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\W/.test(password) || password !== confirmPassword) {
            return res.render('registro', { mensaje: 'Las credenciales no cumplen con los requisitos.', nombre, apellido1, apellido2, email, facultad, curso, grupo });
        }

        UsuariosSA.registerUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, img, (err, result) => {
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

            return res.redirect('/home');
        });
    });
});

router.get('/perfil', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    UsuariosSA.mostrarPerfil(req, res, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('perfil', { result: result[0], session: req.session, mensaje: mensaje });
    });
});

router.post('/actualizar_perfil', (req, res) => {
    UsuariosSA.actualizarPerfil(req, res, (err) => {
        res.redirect('/perfil?mensaje=' + encodeURIComponent(err));
    });
});

router.get('/buscar', (req, res) => {
    InstalacionesSA.buscarInstalaciones(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('home', { results: results, session: req.session });
    });
});

router.get('/organizacion', (req, res) => {
    AdminsSA.organizacion(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }

        req.session.organizacionNombre = result.nombre;

        return res.render('organnizacion', { results: results, session: req.session });
    });
});

router.post('/organizacion/editar', (req, res) => {
    AdminsSA.organizacionEditar(req, res, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('organnizacion', { results: results, session: req.session });
    });
});

//sin hacer
router.get('/servicios', (req, res) => {
    res.render('servicios', { session: req.session });
});

router.get('/usuarios', (req, res) => {
    // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
    AdminsSA.mostrarUsuarios(req, res, (err, results) => {
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

    InstalacionesSA.reservar(req, res, (err, result) =>{
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('reserva', { results: results[0], session: req.session });
    }); 

});

router.get('/instalacion', (req, res) => {
    return res.render('instalacion', {session: req.session});
});
  
  