const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'juego')));

// Importar rutas
const palabrasRouter = require('./routes/palabras');
const resultadosRouter = require('./routes/resultados');

// Usar rutas
app.use('/api/palabras', palabrasRouter);
app.use('/api/resultados', resultadosRouter);

app.listen(port, () =>
  console.log(`Servidor corriendo en http://localhost:${port}`)
);