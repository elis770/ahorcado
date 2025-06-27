# Conexión de Ahorcado a MySQL

Este documento explica los pasos que se siguieron para migrar el juego del ahorcado de usar un archivo `palabras.json` local a obtener las palabras desde una base de datos MySQL a través de un backend con Node.js.

## Paso 1: Análisis Inicial

Se revisaron los archivos clave del proyecto:
- `package.json`: Para ver las dependencias existentes (estaba casi vacío).
- `server.js`: Para entender el estado del backend (estaba vacío).
- `juego/script.js`: Para ver cómo se cargaban las palabras actualmente (usaba `fetch('palabras.json')`).

## Paso 2: Instalación de Dependencias del Backend

Para crear el servidor y conectarlo a MySQL, se instalaron las siguientes dependencias de Node.js con `npm`:
- **express**: Para crear y gestionar el servidor web y las rutas de la API.
- **mysql2**: Para conectarse a la base de datos MySQL y ejecutar consultas. Es una versión más moderna y rápida que el paquete `mysql`.
- **cors**: Para permitir que el frontend (servido en un origen) pueda hacer peticiones al backend (servido en el mismo origen, pero es una buena práctica tenerlo).

El comando ejecutado fue:
```bash
npm install express mysql2 cors
```

## Paso 3: Creación del Servidor (`server.js`)

Se creó un servidor en `server.js` con las siguientes funcionalidades:

1.  **Servidor Express**: Se inicializó un servidor `express`.
2.  **Middleware**:
    - Se usó `cors()` para habilitar las solicitudes desde el frontend.
    - Se usó `express.static('juego')` para servir todos los archivos estáticos (HTML, CSS, JS, imágenes) de la carpeta `juego`. Esto permite que al acceder a `http://localhost:3000` se cargue el juego.
3.  **Conexión a MySQL**:
    - Se configuró un "pool" de conexiones a la base de datos usando `mysql.createPool`. Esto es más eficiente que crear una conexión nueva para cada consulta.
    - Se especificaron las credenciales de la base de datos (`host`, `user`, `password`, `database`).
4.  **Ruta de API (`/api/palabras`)**:
    - Se creó un endpoint `GET` en la ruta `/api/palabras`.
    - Cuando el frontend llama a esta ruta, el servidor ejecuta una consulta SQL (`SELECT palabra FROM palabras`) a la base de datos.
    - Si la consulta es exitosa, el servidor devuelve una lista de palabras en formato JSON.
    - Si hay un error, devuelve un estado 500 (Error Interno del Servidor).

## Paso 4: Modificación del Frontend (`juego/script.js`)

Se actualizó el código del frontend para que obtuviera las palabras del nuevo servidor en lugar del archivo local.

- Se modificó la función `cargarPalabras`.
- La línea `const respuesta = await fetch('palabras.json');` se cambió por:
  ```javascript
  const respuesta = await fetch('http://localhost:3000/api/palabras');
  ```
- Esto redirige la solicitud del frontend al endpoint de la API que creamos en el paso anterior.

## Paso 5: Depuración

Durante el proceso, surgieron dos errores comunes que fueron solucionados:

1.  **Error 500 (Internal Server Error)**: El frontend reportó un error al no poder interpretar la respuesta del servidor. Al revisar la consola de Node.js, se encontró el verdadero error.
2.  **`getaddrinfo ENOTFOUND localhost:3306`**: Este error en la consola de Node.js indicó que no se podía encontrar el servidor de la base de datos. La causa fue que el `host` y el `port` de MySQL estaban combinados en una sola línea (`host: 'localhost:3306'`).
    - **Solución**: Se separaron en dos propiedades distintas en el objeto de configuración de `server.js`, que es el formato correcto:
      ```javascript
      host: 'localhost',
      port: 3306,
      ```

Tras estos ajustes, la conexión entre el frontend, el backend y la base de datos quedó establecida correctamente.

## Conexiones JavaScript (Node.js Backend) y MySQL

Es fundamental entender que la conexión directa desde el **JavaScript del navegador (frontend)** a una base de datos MySQL **no es segura ni posible** por razones de seguridad y arquitectura. Siempre se debe usar un **backend** (como Node.js en este caso) como intermediario.

### 1. Conexión de JavaScript (Node.js Backend) a MySQL (Lectura de Datos)

Este es el flujo que hemos implementado para obtener las palabras.

**a. Configuración de la Conexión en Node.js:**

En tu archivo `server.js` (o similar), necesitas configurar el módulo `mysql2` para conectarte a tu base de datos.

```javascript
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',       // Dirección del servidor MySQL
  port: 3306,              // Puerto de MySQL (por defecto 3306)
  user: 'tu_usuario',      // Tu usuario de MySQL
  password: 'tu_contraseña', // Tu contraseña de MySQL
  database: 'tu_base_de_datos' // El nombre de tu base de datos
}).promise(); // Usamos .promise() para trabajar con async/await
```

**b. Creación de un Endpoint para Lectura (GET Request):**

Define una ruta en tu servidor Express que, al ser accedida, consulte la base de datos.

```javascript
app.get('/api/datos', async (req, res) => {
  try {
    const [rows, fields] = await db.query('SELECT * FROM tu_tabla');
    res.json(rows); // Envía los datos como JSON al frontend
  } catch (err) {
    console.error('Error al leer datos de la DB:', err);
    res.status(500).send('Error en el servidor al leer datos');
  }
});
```

**c. Solicitud desde el Frontend (JavaScript del Navegador):**

Desde tu `script.js` (o cualquier JS del lado del cliente), realizas una petición HTTP a tu backend.

```javascript
async function obtenerDatosDesdeBackend() {
  try {
    const response = await fetch('http://localhost:3000/api/datos'); // URL de tu endpoint
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const datos = await response.json();
    console.log('Datos recibidos:', datos);
    return datos;
  } catch (error) {
    console.error('Error al obtener datos del backend:', error);
    return null;
  }
}

// Llama a la función cuando necesites los datos
// obtenerDatosDesdeBackend();
```

### 2. Conexión de JavaScript (Node.js Backend) a MySQL (Escritura de Datos)

Para escribir datos (INSERT, UPDATE, DELETE), el flujo es similar, pero el frontend enviará datos al backend, y el backend los procesará y los guardará en la base de datos.

**a. Creación de un Endpoint para Escritura (POST/PUT/DELETE Request):**

Define una ruta en tu servidor Express que reciba datos del frontend. Usaremos `POST` para insertar nuevos datos.

```javascript
app.post('/api/guardar_dato', async (req, res) => {
  const { nuevoDato } = req.body; // Asume que el frontend envía un JSON con { nuevoDato: "valor" }

  if (!nuevoDato) {
    return res.status(400).send('Dato requerido');
  }

  try {
    const [result] = await db.query('INSERT INTO tu_tabla (columna) VALUES (?)', [nuevoDato]);
    res.status(201).json({ message: 'Dato guardado exitosamente', id: result.insertId });
  } catch (err) {
    console.error('Error al guardar dato en la DB:', err);
    res.status(500).send('Error en el servidor al guardar dato');
  }
});
```

**b. Envío de Datos desde el Frontend (JavaScript del Navegador):**

Desde tu `script.js`, realizas una petición HTTP `POST` (o `PUT`/`DELETE` según la operación) enviando los datos en el cuerpo de la solicitud.

```javascript
async function enviarDatoAlBackend(dato) {
  try {
    const response = await fetch('http://localhost:3000/api/guardar_dato', {
      method: 'POST', // O 'PUT', 'DELETE'
      headers: {
        'Content-Type': 'application/json' // Indica que estás enviando JSON
      },
      body: JSON.stringify({ nuevoDato: dato }) // Convierte el objeto JS a JSON string
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    console.log('Respuesta del backend:', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al enviar dato al backend:', error);
    return null;
  }
}

// Ejemplo de uso:
// enviarDatoAlBackend('Mi nuevo valor');
```