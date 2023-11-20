// Importa las bibliotecas y módulos necesarios
const express = require('express'); // Importa Express
const dbConnection = require('./js/dbConfig'); // Importa la configuración de la base de datos

// Crea una instancia de Express
const app = express();
const bcrypt = require('bcrypt'); //guarda la contraseña en forma de hash instalar => npm install bcrypt
const fs = require('fs'); //para pasar la imagen a binario
const path = require('path');
const fileUpload = require('express-fileupload'); //para usar file correctamente es necesario instalarse =>npm install express express-fileupload
const session = require('express-session'); //para manejar los incios de seseion es necesario instalarse =>npm install express express-session
const router = require('./app/router/router'); // Importa el enrutador principal
app.use(session({
  secret: 'UCMReservas',
  resave: false,
  saveUninitialized: true
}));
app.use(fileUpload());
const port = 3000; // Puerto en el que se ejecutará el servidor

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
// Middleware para archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del motor de vistas y carpeta de vistas
app.set('view engine', 'ejs'); // Motor de vistas EJS
app.set("views", path.join(__dirname, 'views')); // Carpeta de vistas

// Usa los enrutadores
app.use('/', usersRouter); // Ruta raíz ahora manejada por el enrutador de users
app.use('/home', instalacionesRouter); // Cambiado a '/home' para evitar conflictos


// Captura el error 404 y lo pasa al manejador de errores
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function(err, req, res, next) {
  // Establece las variables locales, solo proporcionando el error en desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza la página de error
  res.status(err.status || 500);
  res.render('error');
});

// Inicia el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

module.exports = app;

