// Importa las bibliotecas y módulos necesarios
var createError = require('http-errors');
const config = require("./config/dbConfig");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mysqlsession = require("express-mysql-session");
var MySQLStore = mysqlsession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

const UserRouter = require('./routes/Users');
const AdminRouter = require('./routes/Admin')

const port = 3000;

const app = express()

app.use(express.urlencoded({extended: true})); //Esto es para formData
app.use(express.json())
app.use(cookieParser());

app.use(session({
  secret: 'UCMReservas',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));
app.use(logger('dev'));


// Middleware para archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del motor de vistas y carpeta de vistas
app.set('view engine', 'ejs'); // Motor de vistas EJS
app.set("views", path.join(__dirname, 'views')); // Carpeta de vistas

// Usa los enrutadores
app.use('/', UserRouter); // Ruta raíz ahora manejada por el enrutador de admin
app.use('/home', AdminRouter); // Ruta raíz ahora manejada por el enrutador de admin


// Captura el error 404 y lo pasa al manejador de errores
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function(err, req, res, next) {
  // Establece las variables locales, solo proporcionando el error en desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // Renderiza la página de error
  res.status(err.status || 500);
  res.render('error.ejs');
});

// Inicia el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

module.exports = app;

