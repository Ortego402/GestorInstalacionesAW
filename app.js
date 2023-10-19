// Importa las bibliotecas y módulos necesarios
const express = require('express'); // Importa Express
const dbConnection = require('./js/dbConfig'); // Importa la configuración de la base de datos
// const bcrypt = require('bcrypt'); // Importa la biblioteca bcrypt para el hashing de contraseñas

// Crea una instancia de Express
const app = express();
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

app.get('/reserva', (req, res) => {
  res.render('reserva');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/registro', (req, res) => {
  res.render('registro');
});

// Ruta para mostrar detalles de un destino específico
app.get('/destino/:id', (req, res) => {
  const id = req.params.id;
  const reservaConfirmada = req.query.reserva === 'confirmada';
  const comentarioConfirmado = req.query.comentario === 'confirmada';

  // Mensaje que se mostrará en función de la confirmación de reserva o comentario
  let mensaje = '';
  if (reservaConfirmada) {
    mensaje = '¡Reserva completada! Gracias por realizar la reserva.';
  } else if (comentarioConfirmado) {
    mensaje = 'Comentario realizado correctamente.';
  } else if (req.query.reserva === 'null' || req.query.comentario === 'null') {
    mensaje = '¡Ups! Ha ocurrido un error al realizar la acción.';
  }

  // Realiza una consulta a la base de datos para obtener detalles del destino y sus imágenes y comentarios asociados
  dbConnection.query('SELECT * FROM destinos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error de la base de datos' });
    }

    if (result.length === 0) {
      return res.status(404).send('Destino no encontrado');
    }

    // Consultas para obtener imágenes y comentarios del destino específico
    dbConnection.query('SELECT * FROM imagenes_destino WHERE destino_id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error de la base de datos' });
      }

      dbConnection.query('SELECT * FROM comentarios WHERE destino_id = ?', [id], (err, comentarios) => {
        if (err) {
          return res.status(500).json({ error: 'Error de la base de datos' });
        }
        // Renderiza la vista "destino.ejs" con los detalles del destino, imágenes y comentarios
        res.render('destino', { result: result[0], results: results, comentarios: comentarios, mensaje: mensaje });
      });
    });
  });
});

// Ruta para buscar destinos por nombre o descripción
app.get('/buscar', (req, res) => {
  const searchTerm = req.query.nombreBuscar; // Obtiene el término de búsqueda del parámetro de consulta
  // Realiza una consulta a la base de datos para buscar destinos por nombre o descripción
  dbConnection.query('SELECT * FROM destinos WHERE nombre LIKE ? OR descripcion LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error de la base de datos' });
      return;
    }
    // Renderiza la vista "home.ejs" con los resultados de la búsqueda
    res.render('home', { results: results });
  });
});

// Ruta para manejar la reserva de un destino específico
app.post('/destino/:id/reservar', (req, res) => {
  const { nombre, email, fecha_reserva } = req.body;
  const id = req.params.id;

  // Valida el formato del correo electrónico utilizando una expresión regular
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El correo no es válido' });
  }

  // Inserta los datos de la reserva en la base de datos
  dbConnection.query('INSERT INTO reservas (destino_id, nombre_cliente, correo_cliente, fecha_reserva) VALUES (?, ?, ?, ?)', [id, nombre, email, fecha_reserva], (err, result) => {
    if (err) {
      return res.redirect(`/destino/${id}?reserva=null`);
    }
    // Redirige a la página del destino con confirmación de reserva
    res.redirect(`/destino/${id}?reserva=confirmada`);
  });
});

// Ruta para manejar la publicación de comentarios en un destino específico
app.post('/destino/:id/comentarios', (req, res) => {
  const { nombre_usuario, comentario } = req.body;
  const id = req.params.id;

  // Inserta los datos del comentario en la base de datos
  dbConnection.query('INSERT INTO comentarios (destino_id, nombre_usuario, comentario) VALUES (?, ?, ?)', [id, nombre_usuario, comentario], (err, result) => {
    if (err) {
      return res.redirect(`/destino/${id}?comentario=null`);
    }
    // Redirige a la página del destino con confirmación de comentario
    res.redirect(`/destino/${id}?comentario=confirmada`);
  });
});


app.post('/registro', (req, res) => {
  const { nombre, apellidos, correo, username, password } = req.body;

  const checkUsernameQuery = 'SELECT * FROM usuarios WHERE username = ?';
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
  const query = 'INSERT INTO usuarios (nombre, apellidos, correo, username, password) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [username, bcrypt.hash(password, 10)], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    return res.status(200).json({ message: 'Registro exitoso.' });
  });
  
});

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});