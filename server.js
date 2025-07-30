const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'juego')));

const tryCatchWrapper = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Error en la ruta:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Función para cargar palabras desde el JSON
function cargarPalabras() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'juego', 'palabras.json'), 'utf-8');
    const lista = JSON.parse(data);
    console.log('Palabras cargadas:', lista);
    return lista;
  } catch (error) {
    console.error('Error al cargar palabras:', error);
    return [];
  }
}

// ✅ Aquí inicializamos el array correctamente
let palabras = cargarPalabras();

// Endpoint para obtener palabras
app.get('/api/palabras', tryCatchWrapper((req, res) => {
  res.json(palabras);
}));

// Endpoint para agregar palabras
app.post('/api/palabras', tryCatchWrapper((req, res) => {
  const { palabra } = req.body;
  if (!palabra) return res.status(400).json({ error: 'Debe enviar una palabra' });

  palabras.push(palabra);

  fs.writeFileSync(path.join(__dirname, 'juego', 'palabras.json'), JSON.stringify(palabras, null, 2));

  res.status(201).json({ mensaje: 'Palabra agregada', palabras });
}));

let resultados = [];

app.post('/api/resultados', tryCatchWrapper((req, res) => {
  const { nombre, palabra, intentos_fallidos, resultado, puntaje } = req.body;
  if (!palabra || !resultado) return res.status(400).json({ error: 'Faltan datos para guardar el resultado.' });

  const nuevoResultado = {
    nombre: nombre || 'Anónimo',
    palabra,
    intentos_fallidos,
    resultado,
    puntaje,
    fecha: new Date().toISOString(),
  };

  resultados.push(nuevoResultado);
  res.status(201).json({ mensaje: 'Resultado guardado con éxito', data: nuevoResultado });
}));

app.get('/api/resultados', tryCatchWrapper((req, res) => {
  res.json(resultados);
}));

app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));