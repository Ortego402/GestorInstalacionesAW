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

app.get('/usuarios', (req, res) => {
  // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
  dbConnection.query('SELECT * FROM UCM_AW_RIU_USU_Usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error de la base de datos' });
    }
    
    res.render('listarUsuarios', { results: results, session: req.session});

});});

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

app.post('/registrar', (req, res) => {
  const { nombre, apellido1, apellido2, correo, facultad, curso, grupo, password, confirmPassword} = req.body;
  let mensaje = null;
  console.log(password);
  const checkEmailQuery = 'SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE email = ?';
  dbConnection.query(checkEmailQuery, [correo], (checkEmailErr, checkEmailResult) => {
    if (checkEmailErr) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Comprobar el email según sus requisitos
    if (checkEmailResult.length > 0) {
      mensaje = 'El email ya esta registrado en la base de datos.';
    }
    // Comprobar la contraseña según sus requisitos
    else if (!mensaje && password.length < 8) {
      mensaje = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!mensaje && !/[A-Z]/.test(password)) {
      mensaje = 'La contraseña debe tener una letra mayúscula.';
    } else if (!mensaje && !/\d/.test(password)) {
      mensaje = 'La contraseña debe tener al menos un número.';
    } else if (!mensaje && !/\W/.test(password)) {
      mensaje = 'La contraseña debe contener al menos un carácter especial.';
    } else if (!mensaje && password !== confirmPassword) {
      mensaje = 'Las contraseñas deben coincidir.';
    }
  });

  if (mensaje) {
    return res.render('registro', { mensaje: mensaje , nombre: nombre, apellido1: apellido1, apellido2: apellido2, correo: correo, facultad: facultad, curso: curso, grupo: grupo});
  }
  else{
    // Insertar datos en la base de datos haseo la contraseña para que no se sepa cual es

    console.log(password);
    const plaintextPassword = req.body.password; 
    console.log(plaintextPassword);
    const encrip = bcrypt.hash(plaintextPassword, 10); 
    console.log(encrip);
    bcrypt.hash(plaintextPassword, 10, (err, hash) => {
      if (err) {
        console.error('Error al generar el hash de la contraseña:', err);
        return res.status(500).json({ error: 'Error al hashear la contraseña' });
      }

      dbConnection.query('INSERT INTO UCM_AW_RIU_USU_Usuarios (nombre, apellido1, apellido2, email, facultad, cruso, grupo, contraseña, contraseña_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, apellido1, apellido2, correo, curso, grupo, hash, password], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Las credenciales son válidas, almacenar información del usuario en la sesión
        req.session.nombre = nombre;
        req.session.apellido1 = apellido1;
        req.session.apellido2 = apellido2;
        req.session.email = correo;
        req.session.facultad = facultad;
        req.session.curso = curso;
        req.session.grupo = grupo;
        // Puedes almacenar más información en la sesión según tus necesidades

        return res.redirect('/');
      });
    });
  }

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

        // Realizar una consulta para obtener los datos de la organización
        dbConnection.query('SELECT * FROM UCM_AW_RIU_ORG_Organizacion', (orgErr, orgResult) => {
          if (orgErr) {
            // Manejar errores de la base de datos si es necesario
            return res.status(500).json({ error: 'Error de la base de datos' });
          }

          if (orgResult.length > 0) {
            // Si hay resultados de la consulta, almacenarlos en la sesión
            req.session.orgNombre = orgResult[0].nombre;
            req.session.orgIcono = orgResult[0].imagen;
            req.session.orgDireccion = orgResult[0].direccion;
          }
          
          // Redirigir a la página de inicio o cualquier otra página según tu lógica de la aplicación
          return res.redirect('/home');
        });
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

app.get('/cambiarRol/:id', (req, res) => {
  const id = req.params.id;

  // Realiza una consulta para obtener el rol actual del usuario
  dbConnection.query('SELECT rol FROM UCM_AW_RIU_USU_Usuarios WHERE Id = ?', [id], (err, results) => {
    if (err) {
      // Maneja los errores de la base de datos aquí
      console.error(err);
      return res.status(500).json({ error: 'Error de la base de datos' });
    }

    // Obtiene el rol actual del resultado de la consulta
    const rolActual = results[0].rol;
    // Cambia el rol de '1' a '0' o de '0' a '1' según el valor actual
    const nuevoRol = rolActual === '1' ? '0' : '1';
    // Realiza una consulta de actualización para cambiar el rol
    dbConnection.query('UPDATE UCM_AW_RIU_USU_Usuarios SET rol = ? WHERE Id = ?', [nuevoRol, id], (err, result) => {
      if (err) {
        // Maneja los errores de la base de datos aquí
        console.error(err);
        return res.status(500).json({ error: 'Error de la base de datos al actualizar el rol' });
      }
      
      // Redirige a la página de lista de usuarios después de cambiar el rol
      res.redirect('/usuarios');
    });
  });
});

app.get('/perfil', (req, res) => {
  const id = req.session.Id;

  // Realiza una consulta para obtener el rol actual del usuario
  dbConnection.query('SELECT * FROM UCM_AW_RIU_USU_Usuarios WHERE Id = ?', [id], (err, usuario) => {
    if (err) {
      // Maneja los errores de la base de datos aquí
      console.error(err);
      return res.status(500).json({ error: 'Error de la base de datos' });
    }
    console.log(usuario)
    res.render('perfil', { usuario: usuario[0], session: req.session });
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

app.get('/logout', (req, res) => {
  // Destruye la sesión y redirige al usuario a la página de login
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    // Redirige a la página de login después de cerrar sesión
    res.redirect('/login');
  });
});

// Ruta para manejar la edición de datos del usuario
app.post('/editar/:id', (req, res) => {
  const userId = req.params.id;
  const { nombre, apellido1, apellido2, facultad, curso, grupo } = req.body;

  // Realiza la actualización de los datos del usuario en la base de datos
  dbConnection.query('UPDATE UCM_AW_RIU_USU_Usuarios SET nombre = ?, apellido1 = ?, apellido2 = ?, facultad = ?, curso = ?, grupo = ? WHERE Id = ?', 
  [nombre, apellido1, apellido2, facultad, curso, grupo, userId], 
  (err, result) => {
      if (err) {
          // Maneja los errores de la base de datos aquí
          console.error(err);
          return res.status(500).json({ error: 'Error de la base de datos al actualizar los datos del usuario' });
      }
      
      // Redirige a la página de perfil del usuario después de actualizar los datos
      res.redirect('/perfil');
  });
});

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});