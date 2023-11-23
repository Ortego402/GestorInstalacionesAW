const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/dbConfig");
const DAOUser = require("../dao/DAOUsuario");
const DAOAdmin = require("../dao/DAOAdmin");
const bcrypt = require('bcrypt'); // Agrega esta línea para requerir bcrypt

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);

daoUser = new DAOUser(pool);
daoAdmin = new DAOAdmin(pool);

router.get('/validado', (req, res) => {
    return res.render('validado', { session: req.session });
});

router.post('/InicioSesion', async (req, res) => {

    let mensaje = "";

    const user = await new Promise((resolve, reject) => {

        const { email, password } = req.body;
        daoUser.DAOUsuarios.getUserByEmail(email, (err, user) => {
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
        });
    });

    if (user.validado === '0') {
        return res.redirect('/validado');
    }

    if(user.rol === 1){
        const results = await new Promise((resolve, reject) => {
            DAOAdmin.mostrarOrganizacion((err, result) => {
                if(err){
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }
            });
        });   
        req.session.orgNombre = results.nombre;
        req.session.orgDir = results.direccion;
        req.session.orgIcono = results.imagen;     
    }

    return res.redirect('/home');
});


router.get('/registro', (req, res) => {
    DAOUsuarios.getFacultades((err, facultades) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        let mensaje = "";
        return res.render("registro", { session: req.session, mensaje: mensaje, facultades: facultades, facultad: req.query.facultad });
    });
});

router.post('/registrar', (req, res) => {
    const { nombre, apellido1, apellido2, email, facultad, curso, grupo, password, confirmPassword } = req.body;
    const img = req.files.buffer;  // Se coge del req por que las files estan aqui
    const facultades = JSON.parse(req.body.facultades);
    DAOUsuarios.checkEmail(email, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.length > 0) {
            return res.render('registro', { mensaje: 'El correo ya existe.', nombre, apellido1, apellido2, email, facultad, curso, grupo, facultades: facultades });
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\W/.test(password) || password !== confirmPassword) {
            return res.render('registro', { mensaje: 'Las credenciales no cumplen con los requisitos.', nombre, apellido1, apellido2, email, facultad, curso, grupo, facultades: facultades });
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return callback('Error al hashear la contraseña');
            } else {

                this.DAOUsuarios.insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, img, (err) => {
                    if(err){
                        return res.status(500).json({ error: 'Error interno del servidor' });
                    }
                    else{
                        this.DAOUsuarios.insertValidacion(email, (err) => {
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
    DAOUsuarios.checkEmail(req, res, (err, result) => {
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

    this.DAOUsuarios.updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        else{
            req.session.email = email;
            res.redirect('/perfil?mensaje=' + encodeURIComponent(err));
        }
    });
});










module.exports = router;
