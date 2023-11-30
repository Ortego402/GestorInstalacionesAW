const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/dbConfig");
const DAOUser = require("../dao/DAOUsuarios");
const DAOAdmin = require("../dao/DAOAdmin");
const bcrypt = require('bcrypt'); // Agrega esta línea para requerir bcrypt
const DAOInstalaciones = require('../dao/DAOInstalaciones');
const session = require('express-session');

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

                    if (user.validado === '0') {
                        return res.redirect('/validado');
                    }

                    if (user.rol === '1') {
                        daoAdmin.mostrarOrganizacion((err, result) => {
                            if (err) {
                                return res.status(500).json({ error: 'Error interno del servidor' });
                            }
                            req.session.orgNombre = result.nombre;
                            req.session.orgDir = result.direccion;
                            req.session.orgIcono = result.imagen;
                            console.log(session.orgNombre);
                            return res.redirect('/home');
                        });
                    } else {
                        return res.redirect('/home');
                    }
                } else {
                    return res.render('login.ejs', { mensaje: 'Contraseña incorrecta.' });
                }
            });
        }
    });
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

                daoUser.insertUser(nombre, apellido1, apellido2, email, facultad, curso, grupo, hash, imagen, (err) => {
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
    daoUser.checkEmail(req.session.email, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        res.render('perfil.ejs', { result: result[0], session: req.session, mensaje: mensaje });
    });
});


router.post('/editar/:id', (req, res) => {
    const { email, nombre, apellido1, apellido2, facultad, curso, grupo } = req.body;

    daoUser.updateUser(req, nombre, apellido1, apellido2, facultad, curso, grupo, email, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }
        else{
            req.session.email = email;
            res.redirect('/perfil?mensaje=' + encodeURIComponent('El usuario se ha modificado con exito.'));
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
    daoUser.getEmailsUser(req.session.email, (err, results) => {
        console.log(err);
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
        return res.render('email_individual', { result: results[0], session: req.session });
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


router.get('/buscar', (req, res) => {
    const searchTerm = req.query.nombreBuscar;
    daoinstalaciones.searchInstalaciones(searchTerm, (err, instalaciones) => {
        if (err) {
            return res.status(500).json({ error: 'Error de la base de datos' });
        }

        return res.render('home.ejs', { results: instalaciones, session: req.session });  
    });
});


router.get('/reservas_usuario',(req, res) => {
    const email = req.session.email;
    daoUser.reservasUser(email, (err, reservas) => {
        if (err) {
            return res.status(500).send('Error en la base de datos 123');
        }
        // Verificar si reservas es null o undefined, y asignar un array vacío si es así
        reservas = reservas || [];
        const instalacionesIds = reservas.map(reserva => {
            return reserva.instId;
        });        // Obtener nombres de destinos correspondientes a los IDs de reservas
        daoUser.getNombresInstalaciones(instalacionesIds, (err, nombresInstalaciones) => {
            if (err) {
                return res.status(500).send(err);
            }            let reservasConNombresInst = [];            
            reservas.forEach(reserva => {
                const nombreInstalacion = nombresInstalaciones.find(instalacion => {
                    return instalacion.id == reserva.instId;
                });
                const fechaReserva = new Date(reserva.dia);
                const horaReserva = reserva.hora;
                const fechaFormateada = fechaReserva.toLocaleDateString('en-US'); // 'en-US' representa el formato YYYY/MM/DD, ajusta según tu necesidad
                reservasConNombresInst.push({
                    id: reserva.Id,
                    instalacion_nombre: nombreInstalacion ? nombreInstalacion.nombre : 'Nombre de instalacion no encontrado',
                    fecha_reserva: fechaFormateada,
                    hora_reserva: horaReserva
                });

            });
            return res.render('mostrarReservas.ejs', { session: req.session, results: reservasConNombresInst });
        });
    });
});


// Eliminar reserva del usuario
router.post('/reservas_usuario', (req, res) => {
    const idReserva = req.body.reservaId;
    console.log("holaaaaaaaaaaaaaaaaa")
    console.log(req.body.reservaId);
    daoUser.eliminarReserva(idReserva, (err) => {
        if (err) {
            return res.status(500).send('Error al eliminar la reserva');
        }
        return res.redirect('/reservas_usuario');
    });
});

module.exports = router;
