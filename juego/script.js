//declaracion de variables globales
let palabraSecreta, //palabra a adivinar
  letraInput, //ingreso de letra
  R, //mensaje de alerta
  xintentos, //intentos restantes
  guionesSpans, //la palabra secreta reprentada en guiones
  errores = 0, //can de errores
  tempMessageTimeoutId = null, //si hay que mostrar mensaje
  img, //la imagen de la persona
  guiones,
  jugarDeNuevoBtn, //reinicio
  playersBtn, // Botón para ver jugadores
  m, //caja del mensaje de alerta
  palabraAdivinada,
  puntaje = 10,
  puntajeA = 0,
  nombreJugador,
  nombreVictima, // Variable para el nombre de la víctima
  p,
  inicioBtn;

//generacion de la palabra secreta a descubrir desde el servidor
// Función para cargar la palabra y preparar los elementos relacionados
async function cargarPalabraYPreparar() {
  try {
    // Esperar respuesta del servidor
    const respuesta = await fetch('http://localhost:7000/api/palabras');
    const datos = await respuesta.json();
    console.log('Respuesta del servidor:', datos);
    // Asignar la palabra recibida a palabraSecreta
    palabraSecreta = datos.palabra || datos;
    console.log('Palabra secreta asignada:', palabraSecreta);

    // Preparar elementos relacionados con la palabra
    let palabraMostrada = Array(palabraSecreta.length).fill('_');
    let xletras = document.getElementById('xletras');
    xletras.innerHTML = palabraSecreta.length;
    guiones.innerHTML = palabraMostrada
      .map((letra) => `<span>${letra}</span>`)
      .join(' ');
    guionesSpans = document.querySelectorAll('.guiones span');
  } catch (error) {
    mostrarMensajeTemporal('⚠️ Error al cargar las palabras desde el servidor: ' + error);
    console.log(error);
  }
}

// Función de preparación para el juego
async function objetosJuego() {
  let name = document.getElementById('name');
  name.innerHTML = nombreVictima;
  await cargarPalabraYPreparar(); // Carga la palabra y prepara los elementos
  xintentos.innerHTML = 9; // Por default tiene 9 intentos

  //Limpiar cualquier timeout pendiente de una partida anterior
  if (tempMessageTimeoutId) {
    clearTimeout(tempMessageTimeoutId);
    tempMessageTimeoutId = null;
  }

  // Habilitar input
  letraInput.disabled = false; //que no quede deshabilitado para poner letra
  letraInput.value = '';
  letraInput.focus();
  R.style.display = 'none'; //que el mensaje quede tapado
  m.style.display = 'none';
  jugarDeNuevoBtn.style.display = 'none';
  playersBtn.style.display = 'none';
  errores = 0;
  personita(0);
}

//funcion para mostrar mensajes temporales en caso de error o que se equivoco
function mostrarMensajeTemporal(mensaje) {
  //limpiar anterior
  if (tempMessageTimeoutId) {
    clearTimeout(tempMessageTimeoutId);
  }
  //mostrar mensaje
  m.style.display = 'flex';
  R.style.display = 'block';
  R.innerHTML = mensaje; //mensaje me lo mandan por parametro

  //que desaparezca el mensaje luego de unos segundos SOLO si no es mensaje de fin de partida
  if (!mensaje.includes('¡HAS PERDIDO!') && !mensaje.includes('¡FELICITACIONES!')) {
    setTimeout(() => {
      m.style.display = 'none';
      R.style.display = 'none';
      R.innerHTML = '';
      tempMessageTimeoutId = null;
    }, 2000); // 2 segundos para mensajes temporales
  }
}

//opciones de accion a la hora de que usuario ingrese letra
function accionJuego(l, t) {
  let acierto = false;

  //en caso que no meta una letra ej(numeros, o incluso de otro lenguaje 'chino')
  if (!/^[a-z]$/.test(l)) {
    mostrarMensajeTemporal('⚠️ Por favor ingresa solo una letra válida.');
    letraInput.value = ''; //borramos lo de adentro
    letraInput.focus();
    return;
  }
  //si lo anterior no se aplica nos fijamos si coicide con alguna letra de la palabra
  for (let i = 0; i < t.length; i++) {
    if (l === t[i]) {
      guionesSpans[i].textContent = l; //lo ingresamos en el lugar
      acierto = true; //la variable cambia
      puntajeA = puntaje;
      puntaje = puntajeA + 10;
    }
  }

  //en caso que en el bucle no se cambio la variable acierto
  if (!acierto) {
    errores++; //acumula los errores (esto por ahora es para las imagenes, TODO)
    xintentos.innerHTML--; //disminuye cuantos intentos mas queda
    //puntajeA = puntaje
    //puntaje = puntajeA - 5
    //console.log(xintentos);
    personita(errores); //los errores se refleja en el cambio de img

    if (!palabraAdivinada && parseInt(xintentos.innerHTML) > 1) {
      mostrarMensajeTemporal(`❌ Letra "${l.toUpperCase()}" incorrecta.`); //mostramos mensaje y con la letra que puso
      //TODO: si es que manda la misma letra no deberia acumularce la cantidad de errores y asi tambien si es que mando una correcta que ya la puso en el mensaje deberia mandar un aviso
    }
  }
  letraInput.value = '';
  letraInput.focus();
  opcionesJuego(parseInt(xintentos.innerHTML), t, guionesSpans);
}

//en caso que se equivoque la variable errores se invoca como un numero y en esa posicion estan ordenadas las imagenes
function personita(numero) {
  img = document.querySelector('.imagen');
  img.src = 'images/' + numero + '.png';
}

//funcion decenlase del juego
let opcionesJuego = (i, t, g) => {
  palabraAdivinada = Array.from(g).every((s) => s.textContent.trim() !== '_'); //nos fijamos si esta llena los guiones o falta
  if (palabraAdivinada) {
    //si es true ha ganado y mostramos mensaje y le damos la opcion de jugar devuelta
    letraInput.disabled = true;

    puntajeA = puntaje;
    puntaje = puntajeA + 90;

    m.style.display = 'flex';
    R.style.display = 'block';
    jugarDeNuevoBtn.style.display = 'block';
    playersBtn.style.display = 'block';
    R.innerHTML = '¡FELICITACIONES! Has adivinado la palabra.';
    guardarResultado(nombreJugador, t, errores, 'victoria', puntaje);
  } else if (i === 0) {
    //si es false ha perdido y mostramos mensaje
    if (tempMessageTimeoutId) {
      clearTimeout(tempMessageTimeoutId);
      tempMessageTimeoutId = null;
    }
    //TODO: hacer una funcion de mensaje de desenlaces...
    letraInput.disabled = true;
    m.style.display = 'flex';
    R.style.display = 'block';
    R.innerHTML = `¡HAS PERDIDO! La palabra era: ${t.toUpperCase()}`;
    jugarDeNuevoBtn.style.display = 'block';
    playersBtn.style.display = 'block';
    img = document.querySelector('.imagen');
    img.src = 'images/final.png'; //mostramos una imagen especial
    guardarResultado(nombreJugador, t, errores, 'derrota', puntaje);
  }
};

//funcion para guardar el resultado
async function guardarResultado(
  nombre,
  palabra,
  intentosFallidos,
  resultado,
  puntaje
) {
  try {
    await fetch('http://localhost:7000/api/resultados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nombre || 'Anónimo',
        palabra: palabra,
        intentos_fallidos: intentosFallidos,
        resultado: resultado,
        puntaje: puntaje,
      }),
    });
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
    mostrarMensajeTemporal('⚠️ Error al guardar la partida.');
  }
}

// Obtiene los resultados de los jugadores desde el servidor.
async function cargarResultados() {
  try {
    const respuesta = await fetch('http://localhost:7000/api/resultados');
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const resultados = await respuesta.json();
    return resultados;
  } catch (error) {
    console.error('Falló la petición para cargar los resultados:', error);
    mostrarMensajeTemporal('⚠️ No se pudieron cargar los resultados.');
    return null; // Devuelve null si hay un error
  }
}

// Muestra los resultados en una tabla HTML en el elemento #w.
function mostrarResultadosEnTabla(resultados) {
  const w = document.getElementById('w');
  if (!w || !resultados || resultados.length === 0) {
    w.innerHTML = '<p>No hay resultados para mostrar.</p>';
    return;
  }
  // Ordenar los resultados por puntaje de mayor a menor
  resultados.sort((a, b) => b.puntaje - a.puntaje);

  // Crear la estructura de la tabla
  let tablaHtml = `
      <table>
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Jugador</th>
            <th>Puntaje</th>
          </tr>
        </thead>
        <tbody>
    `;

  // Añadir una fila por cada resultado
  resultados.forEach((r, i) => {
    tablaHtml += `
        <tr>
          <td>#${i + 1}</td>
          <td>${r.nombre || 'Anónimo'}</td>
          <td>${r.puntaje}</td>
        </tr>
      `;
  });

  tablaHtml += `
        </tbody>
      </table>
    `;

  w.innerHTML = tablaHtml;
}

async function iniciarJuego() {
  await objetosJuego();
}

//cuando inicie el programa damos los variables los propositos pero luego de haber definido la funcion del juegon por eso es aync await
document.addEventListener('DOMContentLoaded', async () => {
  const miBody = document.body;
  const nom1Input = document.getElementById('nom1');
  const nom2Input = document.getElementById('nom2');
  const contraPersonaBtn = document.getElementById('contraPersona');
  playersBtn = document.getElementById('playersBtn');


  function intentarIniciarJuego() {
    nombreJugador = nom1Input.value.trim();
    nombreVictima = nom2Input.value.trim();
    if (!nombreJugador || !nombreVictima) {
      mostrarMensajeTemporal('⚠️ Por favor, ingresa ambos nombres.');
      return;
    }
    miBody.setAttribute('data-tag', 'uno');
    iniciarJuego();
  }

  contraPersonaBtn.addEventListener('click', intentarIniciarJuego);
  nom1Input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') intentarIniciarJuego();
  });
  nom2Input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') intentarIniciarJuego();
  });

  // Cargar y mostrar los resultados de la tabla de jugadores.
  const resultados = await cargarResultados();
  if (resultados) {
    mostrarResultadosEnTabla(resultados);
  }

  //boton de reinicio
  jugarDeNuevoBtn = document.getElementById('jugarDeNuevoBtn');
  jugarDeNuevoBtn.addEventListener('click', () => {
    miBody.setAttribute('data-tag', 'cero');
    nom1Input.value = '';
    nom2Input.value = '';
    nom1Input.focus();
  });

  playersBtn.addEventListener('click', async () => {
    miBody.setAttribute('data-tag', 'dos');
    const resultados = await cargarResultados();
    if (resultados) {
      mostrarResultadosEnTabla(resultados);
    }
  });

  jugarDeNuevoBtn.style.display = 'none'; //default quiero que este tapado
  playersBtn.style.display = 'none'; //default quiero que este tapado
  m = document.querySelector('main');
  m.style.display = 'none'; //default quiero que este tapado
  letraInput = document.getElementById('letraInput');
  R = document.querySelector('.R');
  xintentos = document.getElementById('xintentos');
  guiones = document.querySelector('.guiones');

  //en caso que aprete enter y ponga una letra
  letraInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const letraIngresada = letraInput.value.toLowerCase(); //hacer lo minuscula
      if (letraInput.disabled) {
        return; //si esta disable no va hacer nada
      } else {
        //si no es los casos anteriores, que ejecute la funcion con los parametros
        accionJuego(letraIngresada, palabraSecreta);
      }
    }
  });

  // No iniciar el juego automáticamente
  // await objetosJuego();
});