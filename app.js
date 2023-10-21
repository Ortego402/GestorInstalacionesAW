// Importa las bibliotecas y módulos necesarios
const express = require('express'); // Importa Express
const dbConnection = require('./js/dbConfig'); // Importa la configuración de la base de datos

// Crea una instancia de Express
const app = express();
const bcrypt = require('bcrypt'); //guarda la contraseña en forma de hash instalar => npm install bcrypt
const session = require('express-session'); //para manejar los incios de seseion es necesario instalarse =>npm install express express-session
app.use(session({
  secret: 'Epicscape',
  resave: false,
  saveUninitialized: true
}));
const port = 3000; // Puerto en el que se ejecutará el servidor

// Configura Express para usar bodyParser y EJS como motor de plantillas
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express.static('public'));

// Ruta para mostrar todos los destinos
app.get('/', (req, res) => {
     res.render('login');
});

// Rutas para otras páginas
app.get('/servicios', (req, res) => {
  res.render('servicios');
});

app.get('/nosotros', (req, res) => {
  res.render('nosotros');
});

app.get('/populares', (req, res) => {
  res.render('populares');
});

app.get('/reserva/:id', (req, res) => {
  const id = req.params.id;
  const reservaConfirmada = req.query.reserva === 'confirmada';

  // Mensaje que se mostrará en función de la confirmación de reserva o comentario
  let mensaje = '';
  if (reservaConfirmada) {
    mensaje = '¡Reserva completada! Gracias por realizar la reserva.';
  } else {
    mensaje = '¡Ups! Ha ocurrido un error al realizar la acción.';
  }

  // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
  dbConnection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error de la base de datos' });
    }

    if (result.length === 0) {
      return res.status(404).send('Destino no encontrado');
    }
    
    res.render('reserva', { result: result[0], session: req.session});

  });});

app.get('/instalacion', (req, res) => {
  res.render('instalacion', {session: req.session});
});

app.get('/login', (req, res) => {
  let mensaje = "";
  res.render('login', { session: req.session, mensaje: mensaje });
});

app.get('/registro', (req, res) => {
  let mensaje = "";
  res.render('registro', { session: req.session, mensaje: mensaje });
});

app.post('/registro', (req, res) => {
  const { nombre, apellido1, apellido2, correo, username, password } = req.body;

  const checkUsernameQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
  db.query(checkUsernameQuery, [username], (checkUsernameErr, checkUsernameResult) => {
    if (checkUsernameErr) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (checkUsernameResult.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso, elije' });
    }
  });

  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){
    return res.status(400).json({ error: 'El correo no es valido' });
  }

  // Comprobar la contraseña según tus requisitos
  if (/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'La contraseña no es valida' });
  }
  if (/\d/.test(password)) {
    return res.status(400).json({ error: 'La contraseña debete tener almenos un numero' });
  }
  if (password.length >= 10) {
    return res.status(400).json({ error: 'La contraseña debe tener almenos 10 caracteres' });
  }

  // Insertar datos en la base de datos
  const query = 'INSERT INTO UCM_AW_RIU_USU_Usuarios (nombre, apellidos, correo, username, password) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [username, bcrypt.hash(password, 10)], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    return res.status(200).json({ message: 'Registro exitoso.' });
  });

});

app.post('/InicioSesion', (req, res) => {
  const { email, password } = req.body;

  const checkUsernameQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
  dbConnection.query(checkUsernameQuery, [email], (checkUsernameErr, checkUsernameResult) => {
    if (checkUsernameErr) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    let mensaje = null;
    if (checkUsernameResult.length === 0) {
      // Nombre de usuario no existe, asignar un mensaje de error
      mensaje = 'El email no existe';
      return res.render('login', { mensaje: mensaje });
    } else {
      // Verificar la contraseña utilizando bcrypt
      // const storedPasswordHash = checkUsernameResult[0].password;
      // bcrypt.compare(password, storedPasswordHash, (compareErr, compareResult) => {
      //   if (compareErr) {
      //     return res.status(500).json({ error: 'Error interno del servidor' });
      //   }

      //   if (!compareResult) {
      //     // Contraseña incorrecta, asignar un mensaje de error
      //     mensaje = 'Contraseña incorrecta';
      //     return res.render('login', { mensaje: mensaje });
      //   }

        // Las credenciales son válidas, almacenar información del usuario en la sesión
        req.session.email = email;
        req.session.Id = checkUsernameResult[0].Id;
        req.session.rol = checkUsernameResult[0].rol;
        return res.redirect('/home');
      }
  });
});

app.get('/home', (req, res) => {
  //console.log('Username almacenado en la sesión:', req.session.username);
  // Realiza una consulta a la base de datos para obtener todos los destinos
  dbConnection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error de la base de datos' });
      return;
    }
    // Renderiza la vista "home.ejs" con los resultados obtenidos de la base de datos
    console.log(results);
    res.render('home', { results: results, session: req.session });
  });
});

// Ruta para manejar la reserva de un destino específico
app.post('/nueva_instalacion', /*upload.single('imagen'), */(req, res) => {
  const { nombre, tipoReserva, aforo, horaInicio, horaFin } = req.body;
  const imagen = req.file.filename; // Obtiene el nombre del archivo de la propiedad 'filename' del objeto 'req.file'

  // Inserta los datos de la instalación en la base de datos
  dbConnection.query('INSERT INTO UCM_AW_RIU_INS_Instalaciones (nombre, tipoReserva, imagen, aforo, horarioInicio, horarioFin) VALUES (?, ?, ?, ?, ?, ?)', [nombre, tipoReserva, imagen, aforo, horaInicio, horaFin], (err, result) => {
    if (err) {
      // Maneja los errores de la base de datos aquí
      console.error(err);
      return res.redirect(`/home`); // Redirige a la página de inicio en caso de error
    }
    // Redirige a la página del destino con confirmación de la instalación añadida
    res.redirect(`/home`);
  });
});

// Ruta para manejar la reserva de una instalación específica
app.post('/realizar_reserva', (req, res) => {
  const { dia, hora } = req.body;
  const usuId = req.session.Id; // Suponiendo que el ID del usuario actual está disponible en req.usuarioId
  const instId = req.body.instalacionId; // Suponiendo que el ID de la instalación está presente en el cuerpo de la solicitud

  // Inserta los datos de la reserva en la tabla UCM_AW_RIU_RES_Reservas
  dbConnection.query('INSERT INTO UCM_AW_RIU_RES_Reservas (dia, hora, usuId, instId) VALUES (?, ?, ?, ?)', [dia, hora, usuId, instId], (err, result) => {
    if (err) {
      // Maneja los errores de la base de datos aquí
      return res.redirect('/reserva/:id');
    }
    // Redirige a la página de confirmación de reserva exitosa
    res.redirect('/home');
  });
});

// Ruta para buscar destinos por nombre o descripción
app.get('/buscar', (req, res) => {
  const searchTerm = req.query.nombreBuscar; // Obtiene el término de búsqueda del parámetro de consulta
  // Realiza una consulta a la base de datos para buscar destinos por nombre o descripción
  dbConnection.query('SELECT * FROM UCM_AW_RIU_INS_Instalaciones WHERE nombre LIKE ?', [`%${searchTerm}%`], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error de la base de datos' });
      return;
    }
    // Renderiza la vista "home.ejs" con los resultados de la búsqueda
    res.render('home', { results: results, session: req.session});
  });
});

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});