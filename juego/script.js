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
  m, //caja del mensaje de alerta
  palabraAdivinada;

//generacion de la palabra secreta a descubrir desde el servidor
async function cargarPalabras() {
  try {
    //esperar res del servidor
    const respuesta = await fetch('http://localhost:3000/api/palabras');
    const palabras = await respuesta.json();
    //elige una de un indice random
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    console.log(palabras[indiceAleatorio]); //esto es para reviciones
    return palabras[indiceAleatorio];
  } catch (error) {
    mostrarMensajeTemporal('⚠️ Error al cargar las palabras desde el servidor: ' + error);
    console.log(error)
    return null; // Devuelve null o una palabra por defecto en caso de error
  }
}

//funcion preparacion para el juego
async function objetosJuego() {
  palabraSecreta = await cargarPalabras(); //precisamos la palabra secreta 
  let palabraMostrada = Array(palabraSecreta.length).fill('_'); //recoremos la palabra para saber cuantas hay
  let xletras = document.getElementById('xletras');
  xletras.innerHTML = palabraSecreta.length; //lo anterior lo ponemos en html
  xintentos.innerHTML = 9; //por default tiene 9 intentos (debe ser menos TODO pero tendrias que editar las imagenes despues)
  guiones.innerHTML = palabraMostrada //la cantidad de letras es la misma para poner los guiones
    .map((letra) => `<span>${letra}</span>`)
    .join(' ');
  guionesSpans = document.querySelectorAll('.guiones span'); //llamamos los guiones

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

  //que desaparezca el mensaje luego de unos segundos
    setTimeout(() => {
      m.style.display = 'none';
      R.style.display = 'none';
      R.innerHTML = '';
      tempMessageTimeoutId = null;
    }, 1000);
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
    }
  }

  //en caso que en el bucle no se cambio la variable acierto
  if (!acierto) {
    errores++; //acumula los errores (esto por ahora es para las imagenes, TODO)
    xintentos.innerHTML--; //disminuye cuantos intentos mas queda
    //console.log(xintentos);
    personita(errores); //los errores se refleja en el cambio de img

    if (!palabraAdivinada && parseInt(xintentos.innerHTML) > 1) {
      mostrarMensajeTemporal(`❌ Letra "${l.toUpperCase()}" incorrecta.`); //mostramos mensaje y con la letra que puso
      //TODO: si es que manda la misma letra no deberia acumularce la cantidad de errores y asi tambien si es que mando una correcta que ya la puso en el mensaje deberia mandar un aviso
    }

    if (xintentos > 0) {
      if (tempMessageTimeoutId) {
        clearTimeout(tempMessageTimeoutId);
      }
      tempMessageTimeoutId();
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
  if (palabraAdivinada) { //si es true ha ganado y mostramos mensaje y le damos la opcion de jugar devuelta
    letraInput.disabled = true;
    m.style.display = 'flex';
    R.style.display = 'block';
    jugarDeNuevoBtn.style.display = 'block';
    R.innerHTML = '¡FELICITACIONES! Has adivinado la palabra.';
    guardarResultado(t, errores, 'victoria');
  } else if (i === 0) { //si es false ha perdido y mostramos mensaje
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
    img = document.querySelector('.imagen');
    img.src = 'images/final.png'; //mostramos una imagen especial
    guardarResultado(t, errores, 'derrota');
  }
};

//funcion para guardar el resultado
async function guardarResultado(palabra, intentosFallidos, resultado) {
  try {
    await fetch('http://localhost:3000/api/resultados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        palabra: palabra,
        intentos_fallidos: intentosFallidos,
        resultado: resultado,
      }),
    });
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
    mostrarMensajeTemporal('⚠️ Error al guardar la partida.');
  }
}

//cuando inicie el programa damos los variables los propositos pero luego de haber definido la funcion del juegon por eso es aync await
document.addEventListener('DOMContentLoaded', async () => {
  //boton de reinicio
  jugarDeNuevoBtn = document.getElementById('jugarDeNuevoBtn');
  jugarDeNuevoBtn.addEventListener('click', () => {
    location.reload();
  });
  jugarDeNuevoBtn.style.display = 'none'; //default quiero que este tapado
  m = document.querySelector('main');
  m.style.display = 'none';  //default quiero que este tapado
  (letraInput = document.getElementById('letraInput')),
    (R = document.querySelector('.R')),
    (xintentos = document.getElementById('xintentos')),
    (guiones = document.querySelector('.guiones'));

    //en caso que aprete enter y ponga una letra
  letraInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const letraIngresada = letraInput.value.toLowerCase(); //hacer lo minuscula
      if (letraInput.disabled) {
        return; //si esta disable no va hacer nada
      } else { //si no es los casos anteriores, que ejecute la funcion con los parametros
        accionJuego(letraIngresada, palabraSecreta);
      }
    }
  });

  await objetosJuego(); //esperamos la funcion dentro de la palabra secreta
});