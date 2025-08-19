const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'juego')));

// Configuración de la conexión a MySQL
// IMPORTANTE: Reemplaza estos valores con tus credenciales de MySQL
const db = mysql.createPool({
  host: 'localhost', // o la IP de tu servidor de base de datos
  port: 3306,        // el puerto de MySQL (usualmente 3306)
  user: 'root',      // tu usuario de MySQL
  password: '58868767Es',      // tu contraseña de MySQL
  database: 'ahorcado_db' // el nombre de tu base de datos
}).promise();

// Ruta de la API para obtener las palabras
app.get('/api/palabras', async (req, res) => {
  try {
    // Reemplaza 'palabras' y 'palabra' si tu tabla o columna se llaman diferente
    const [results] = await db.query('SELECT palabra FROM palabras'); 
    
    // Extraemos solo el string de la palabra de cada fila
    const palabras = results.map(item => item.palabra);
    res.json(palabras);
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).send('Error en el servidor');
  }
});
let jugadores = [ 
  { nombre: "Juan", puntaje: 2 }, 
  { nombre: "Pedro", puntaje: 3 } 
]
app.get('/jugadores', (req, res) => {
  res.json(jugadores)
})
// Ruta de la API para guardar el resultado del juego
app.post('/api/resultados', async (req, res) => {
  const { palabra, intentos_fallidos, resultado } = req.body;

  if (!palabra || intentos_fallidos === undefined || !resultado) {
    return res.status(400).send('Faltan datos para guardar el resultado.');
  }

  try {
    const query = 'INSERT INTO resultados (palabra, intentos_fallidos, resultado) VALUES (?, ?, ?)';
    await db.query(query, [palabra, intentos_fallidos, resultado]);
    res.status(201).send('Resultado guardado exitosamente.');
  } catch (err) {
    console.error('Error al guardar en la base de datos:', err);
    res.status(500).send('Error en el servidor al guardar el resultado.');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

/*
// Importa el módulo Express
const express = require('express');

// Crea una instancia de una aplicación Express
const app = express();

// Define el puerto donde el servidor escuchará las peticiones
const PORT = process.env.PORT || 4000;

// Configura el contenido estático en public
// app.use(express.static('public'));

// Ruta GET para la raíz que responde con un mensaje básico
app.get('/', (req, res) => {
  res.send('¡Bienvenido! Usá /hola?nombre=TuNombre o /adios?nombre=TuNombre');
});

// Ruta GET /hola que toma el nombre por query string (?nombre=...)
app.get('/hola', (req, res) => {
  const nombre = req.query.nombre; // Extrae el parámetro 'nombre' de la URL
  if (nombre) {
    res.send(`¡Hola, ${nombre}!`);
  } else {
    res.send('¡Hola! Decime tu nombre usando ?nombre=TuNombre');
  }
});

// Ruta GET /adios que también toma el nombre por query string
app.get('/adios', (req, res) => {
  const nombre = req.query.nombre; // Extrae el parámetro 'nombre'
  if (nombre) {
    res.send(`Adiós, ${nombre}.`);
  } else {
    res.send('Adiós. (pero no sé tu nombre)');
  }
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

/*const express = require('express')

const app = express()

let jugadores = [ 
  { nombre: "Juan", puntaje: 2 }, 
  { nombre: "Pedro", puntaje: 3 } 
]

// Configura el contenido estático en public
app.use(express.static('public'));

app.get('/hello', (req, res) => {
  let name = req.query.name
  res.send('Hello ' + name)
})

app.get('/jugadores', (req, res) => {
  res.json(jugadores)
})

app.listen(3000)*/