const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Función para cargar todas las palabras desde el JSON
function cargarPalabras() {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, '../juego/palabras.json'),
      'utf-8'
    );
    const lista = JSON.parse(data);
    return lista;
  } catch (error) {
    console.error('Error al cargar palabras:', error);
    return [];
  }
}

let palabras = cargarPalabras();

router.get('/', (req, res) => {
  if (!palabras.length) {
    return res.status(404).json({ error: 'No hay palabras disponibles' });
  }
  const indiceAleatorio = Math.floor(Math.random() * palabras.length);
  const palabraAleatoria = palabras[indiceAleatorio];
  res.json({ palabra: palabraAleatoria });
});

module.exports = router;
