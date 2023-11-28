const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/dbConfig");
const DAOUser = require("../dao/DAOUsuarios");
const DAOAdmin = require("../dao/DAOAdmin");
const bcrypt = require('bcrypt'); // Agrega esta línea para requerir bcrypt
const DAOInstalaciones = require('../dao/DAOInstalaciones');

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);

daoUser = new DAOUser(pool);
daoAdmin = new DAOAdmin(pool);
daoinstalaciones = new DAOInstalaciones(pool);

router.get('/', (req, res) => {
    let mensaje = "";
    return res.render("login.ejs", { session: req.session, mensaje: mensaje });
});

router.get('/validado', (req, res) => {
    return res.render('validado.ejs', { session: req.session });
});

router.post('/InicioSesion', async (req, res) => {

    let mensaje = "";

    const { email, password } = req.body;
    daoUser.getUserByEmail(email, (err, user) => {
        if (err) {
            return res.render('login.ejs', { mensaje: 'Usuario no encontrado.' });
        } else {
            bcrypt.compare(password, user.contraseña, (bcryptErr, result) => {
                if (bcryptErr) {
                    return res.render('login.ejs', { mensaje: 'Error al comparar contraseñas.' });
                } else if (result) {
                    req.session.email = email;
                    req.session.Id = user.Id;
                    req.session.rol = user.rol;
                } else {
                    return res.render('login.ejs', { mensaje: 'Contraseña incorrecta.' });
                }
            });
        }

        if (user.validado === '0') {
            return res.redirect('/validado');
        }

        if(user.rol === 1){
            
            daoAdmin.mostrarOrganizacion((err, result) => {
                if(err){
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }
            });
            
            req.session.orgNombre = results.nombre;
            req.session.orgDir = results.direccion;
            req.session.orgIcono = results.imagen;     
        }
    });

    return res.redirect('/home');
});


router.get('/registro', (req, res) => {
    daoUser.getFacultades((err, facultades) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        let mensaje = "";
        return res.render("registro", { session: req.session, mensaje: mensaje, facultades: facultades, facultad: req.query.facultad });
    });
});

router.post('/registrar', (req, res) => {
    console.log(req.body);
    const { nombre, apellido1, apellido2, email, facultad, curso, grupo, password, confirmPassword } = req.body;
    let imagen = req.file ? req.file.buffer : null; // Se coge del req por que las files estan aqui
    const facultades = JSON.parse(req.body.facultades);
    daoUser.checkEmail(email, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.length > 0) {
            return res.render('registro.ejs', { mensaje: 'El correo ya existe.', nombre, apellido1, apellido2, email, facultad, curso, grupo, facultades: facultades });
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\W/.test(password) || password !== confirmPassword) {
            return res.render('registro.ejs', { mensaje: 'Las credenciales no cumplen con los requisitos.', nombre, apellido1, apellido2, email, facultad, curso, grupo, facultades: facultades });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Error al hashear la contraseña' });
            } else {

                daoUser.insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, img, (err) => {
                    if(err){
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }
                    else{
                        daoUser.insertValidacion(email, (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Error interno del servidor' });
                            } else {
                                return res.redirect('/validado')
                            }
                        });
                    }
                });
            }
        });
    });
});


router.get('/perfil', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    daoUser.checkEmail(req, res, (err, result) => {
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
    const { correo, nombre, apellido1, apellido2, facultad, curso, grupo } = req.body;

    daoUser.updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        else{
            req.session.email = email;
            res.redirect('/perfil?mensaje=' + encodeURIComponent(err));
        }
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


router.post('/realizar_reserva', (req, res) => {

    const {instalacionId, dia, hora} = req.body;
    const email = req.session.email;
    
    daoinstalaciones.reservaInstalacion(instalacionId, dia, hora, email, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        req.session.mensaje = 'Reserva realizada';
        return res.redirect('/reserva/'+ instalacionId);
    });
});


router.get('/email', (req, res) => {
    const mensaje = req.query.mensaje || ""; // Recupera el mensaje de la consulta, si está presente
    
    daoUser.getEmailsUser(email, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        } 
        return res.render('email', { results: results, session: req.session, mensaje: mensaje });
    });
});


router.get('/email/:id', (req, res) => {
    const id = req.params.id;

    daoUser.getEmail(id, (err, results) => {

        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('email_individual', { result: result[0], session: req.session });
    });
});


router.post('/email', (req, res) => {
    const { destinatario, asunto, mensaje } = req.body;
    const email_envio = req.session.email;

    daoUser.insertEmail(email_envio, destinatario, asunto, mensaje, (err) => {
        console.log(err)
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        } 
        res.redirect('/email?mensaje=' + encodeURIComponent("Email enviado correctamente."));
    });
});


router.get('/home', (req, res) => {
    daoinstalaciones.getAllInstalaciones((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        return res.render('home.ejs', { results: results, session: req.session});
    });
});


router.get('/servicios', (req, res) => {
    res.render('servicios', { session: req.session });
});


//no se como se hace lo que habia en app.js antes no lo entiendo
router.get('/reserva/:id', (req, res) => {

    const id = req.params.id;

    daoinstalaciones.getInstalacion(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        daoinstalaciones.obtenerReservasPorInstalacion(id, (err, reservas) => {
            if (err) {
                return res.status(500).json({ error: 'Error de la base de datos' });
            }
            const mensaje = req.session.mensaje || '';
            req.session.mensaje = '';
            return res.render('reserva', { results: results, session: req.session, reservas, mensaje});
        });
    });

});


router.get('/instalacion', (req, res) => {
    return res.render('instalacion', { session: req.session });
});


router.get('/buscar', (req, res) => {
    const searchTerm = req.query.nombreBuscar;
    daoinstalaciones.searchInstalaciones(searchTerm, (err, instalaciones) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }

        return res.render('home.ejs', { results: results, session: req.session });  
    });
});

module.exports = router;
