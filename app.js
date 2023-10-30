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
  secret: 'Epicscape',
  resave: false,
  saveUninitialized: true
}));
app.use(fileUpload());
const port = 3000; // Puerto en el que se ejecutará el servidor

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/app/views"));
app.use(express.static('public'));
app.use('/', router); // Usa el enrutador principal en la ruta raíz

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

