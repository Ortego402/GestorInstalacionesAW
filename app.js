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
app.use(session({
  secret: 'Epicscape',
  resave: false,
  saveUninitialized: true
}));
app.use(fileUpload());
const port = 3000; // Puerto en el que se ejecutará el servidor

// Configura Express para usar bodyParser y EJS como motor de plantillas
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//para coger las imagenes
app.use('/public', express.static('public'));

// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express.static('public'));

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

// main.js