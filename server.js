const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'juego')));

let palabras = ['manzana', 'banana', 'pera', 'durazno']
let jugadores = [ 
  { nombre: "Juan", puntaje: 2 }, 
  { nombre: "Pedro", puntaje: 3 } 
]
let resultados = []; // Array para guardar los resultados de las partidas

// Agregamos la función
const tryCatchWrapper = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Error en la ruta:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Ruta para guardar el resultado de una partida
app.post('/api/resultados', tryCatchWrapper((req, res) => {
  const { nombre, palabra, intentos_fallidos, resultado, puntaje } = req.body;

  // Validación básica de los datos recibidos
  if (!palabra || !resultado) {
    return res.status(400).json({ error: 'Faltan datos para guardar el resultado.' });
  }

  const nuevoResultado = {
    nombre: nombre || 'Anónimo',
    palabra,
    intentos_fallidos,
    resultado,
    puntaje,
    fecha: new Date().toISOString()
  };

  resultados.push(nuevoResultado);
  console.log('Resultado guardado:', nuevoResultado);
  res.status(201).json({ mensaje: 'Resultado guardado con éxito', data: nuevoResultado });
}));
app.get('/api/resultados', tryCatchWrapper((req, res) => {
  res.json(resultados);
}));

// Tus rutas envueltas en try/catch
app.get('/api/palabras', tryCatchWrapper((req, res) => {
  res.json(palabras);
}));

app.get('/jugadores', tryCatchWrapper((req, res) => {
  res.json(jugadores);
}));

app.post('/jugadores', tryCatchWrapper((req, res) => {
  const nuevoJugador = req.body;

  if (!nuevoJugador || !nuevoJugador.nombre || typeof nuevoJugador.puntaje !== 'number') {
    return res.status(400).json({ error: 'Datos del jugador inválidos' });
  }

  jugadores.push(nuevoJugador);
  console.log('Jugador agregado:' + nuevoJugador )
  res.status(201).json({ mensaje: 'Jugador agregado', jugador: nuevoJugador });
}));

/*fetch('http://localhost:3000/jugadores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'maria', puntaje: 10 })
})
.then(res => res.json())
.then(data => console.log('jugador agregado', data))
.catch(err => console.error('error:' + err));*/

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});