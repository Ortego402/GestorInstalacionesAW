// Importa el módulo mysql
const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const dbConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "UCM_RIU",
    port: 3306
});

// Conecta a la base de datos
dbConnection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err); // Muestra un mensaje de error si la conexión falla
    return;
  }
  console.log('Conexión exitosa a la base de datos'); // Muestra un mensaje de éxito si la conexión es exitosa
});

// Exporta el objeto de conexión y otras funciones relacionadas con la base de datos
module.exports = dbConnection;
