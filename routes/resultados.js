const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// Crear la tabla 'resultados' si no existe
const SQL_CREATE_RESULTADOS = `CREATE TABLE IF NOT EXISTS resultados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50),
    palabra VARCHAR(10),
    intentos_fallidos INT,
    resultado VARCHAR(25),
    puntaje INT,
    fecha DATE
)`;

// Consultas SQL como constantes
const SQL_INSERT_RESULTADO = 'INSERT INTO resultados (nombre, palabra, intentos_fallidos, resultado, puntaje, fecha) VALUES (?, ?, ?, ?, ?, ?)';
const SQL_SELECT_RESULTADOS = 'SELECT * FROM resultados ORDER BY fecha DESC';

db.query(SQL_CREATE_RESULTADOS)
    .then(() => console.log('Tabla "resultados" verificada/creada.'))
    .catch((err) => console.error('Error creando/verificando la tabla resultados:', err));

// Guardar resultado en la base de datos
router.post('/', async (req, res) => {
    const { nombre, palabra, intentos_fallidos, resultado, puntaje } = req.body;
    if (!palabra || !resultado) {
        return res.status(400).json({ error: 'Faltan datos para guardar el resultado.' });
    }

        try {
            // Formatear fecha como DATETIME (YYYY-MM-DD HH:MM:SS)
            const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const [result] = await db.execute(
                SQL_INSERT_RESULTADO,
                [nombre || 'Anónimo', palabra, intentos_fallidos, resultado, puntaje, fecha]
            );
            res.status(201).json({ mensaje: 'Resultado guardado con éxito', insertId: result.insertId });
        } catch (error) {
            console.error('Error al guardar resultado:', error);
            res.status(500).json({ error: 'Error al guardar el resultado en la base de datos' });
        }
});

// Obtener resultados desde la base de datos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(SQL_SELECT_RESULTADOS);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener resultados:', error);
        res.status(500).json({ error: 'Error al obtener los resultados de la base de datos' });
    }
});

module.exports = router;