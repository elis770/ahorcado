const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a MySQL usando variables de entorno
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();


module.exports = db;