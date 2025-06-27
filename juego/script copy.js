// script.js

// Variable para almacenar el ID del timeout del mensaje de error temporal
let tempMessageTimeoutId;

async function cargarPalabras() {
  try {
    const respuesta = await fetch('palabras.json');
    const datos = await respuesta.json();
    const palabras = datos.palabras;
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    console.log(palabras[indiceAleatorio]);
    return palabras[indiceAleatorio];
  } catch (error) {
    console.error('Error al cargar las palabras:', error);
    return 'error';
  }
}

async function iniciarJuego() {
  const palabraSecreta = await cargarPalabras();
  let palabraMostrada = Array(palabraSecreta.length).fill('_');
  let xletras = document.getElementById('xletras');
  xletras.innerHTML = palabraSecreta.length;
  let xintentos = document.getElementById('xintentos');
  xintentos.innerHTML = 9;
  const guiones = document.querySelector('.guiones');
  guiones.innerHTML = palabraMostrada
    .map((letra) => `<span>${letra}</span>`)
    .join(' ');

  const guionesSpans = document.querySelectorAll('.guiones span');
  let errores = 0;
  const letraInput = document.querySelector('#letraInput');
  const R = document.querySelector('.R');
  const jugarDeNuevoBtn = document.getElementById('jugarDeNuevoBtn'); // Obtener el botón

  // Asegúrate de que R esté oculto y el botón de reinicio también al inicio
  R.style.display = 'none';
  jugarDeNuevoBtn.style.display = 'none'; // Ocultar el botón al inicio

  // Limpiar cualquier timeout pendiente de una partida anterior
  if (tempMessageTimeoutId) {
    clearTimeout(tempMessageTimeoutId);
    tempMessageTimeoutId = null;
  }

  // Habilitar input
  letraInput.disabled = false;
  letraInput.value = ''; // Limpiar el input
  letraInput.focus(); // Poner el foco


  letraInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const letraIngresada = letraInput.value.toLowerCase();
      
      // Valida que el juego no haya terminado ya
      if (letraInput.disabled) {
          return; 
      }

      if (!/^[a-z]$/.test(letraIngresada)) {
        console.warn('Por favor ingresa solo una letra válida.');
        letraInput.value = '';
        letraInput.focus();
        return;
      }

      let acierto = false;
      for (let i = 0; i < palabraSecreta.length; i++) {
        if (letraIngresada === palabraSecreta[i]) {
          guionesSpans[i].textContent = letraIngresada;
          acierto = true;
        }
      }

      if (!acierto) {
        errores++;
        xintentos.innerHTML--; // Decrementa los intentos

        // Limpia cualquier timeout anterior del mensaje temporal de error
        if (tempMessageTimeoutId) {
          clearTimeout(tempMessageTimeoutId);
          tempMessageTimeoutId = null;
        }

        R.style.display = 'block';
        R.innerHTML = `❌ Letra "${letraIngresada.toUpperCase()}" incorrecta.`;
        mostrarAhorcado(errores);

        // Configura un nuevo timeout para OCULTAR este mensaje temporal
        tempMessageTimeoutId = setTimeout(() => {
          R.style.display = 'none';
          R.innerHTML = '';
          tempMessageTimeoutId = null; // Limpiar la referencia
        }, 2000); // El mensaje estará visible por 2 segundos
        
      } else {
        // Si hay un acierto, oculta el mensaje de error temporal si estaba visible
        if (R.style.display === 'block' && tempMessageTimeoutId) {
            clearTimeout(tempMessageTimeoutId);
            tempMessageTimeoutId = null;
            R.style.display = 'none';
            R.innerHTML = '';
        }
      }

      letraInput.value = '';
      letraInput.focus();
      // Pasa la palabra secreta completa para poder mostrarla si pierde o gana
      opcionesJuego(parseInt(xintentos.innerHTML), palabraSecreta, guionesSpans);
    }
  });
  
  // Event listener para el botón "Volver a jugar"
  jugarDeNuevoBtn.addEventListener('click', () => {
    // Recarga la página para reiniciar el juego
    location.reload(); 
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await iniciarJuego();
});

function mostrarAhorcado(numero) {
  const img = document.querySelector('.imagen');
  img.src = 'images/' + numero + '.png';
}

let opcionesJuego = (intentosRestantes, palabraSecreta, guionesSpans) => {
  const R = document.querySelector('.R');
  const letraInput = document.getElementById('letraInput');
  const jugarDeNuevoBtn = document.getElementById('jugarDeNuevoBtn');

  // Comprobar si todas las letras han sido adivinadas
  const palabraAdivinada = Array.from(guionesSpans).every(span => span.textContent !== '_');

  if (palabraAdivinada) {
      // SI EL JUGADOR GANA:
      // Asegurarse de limpiar cualquier timeout de mensaje de error temporal pendiente
      if (tempMessageTimeoutId) {
          clearTimeout(tempMessageTimeoutId);
          tempMessageTimeoutId = null;
      }

      R.style.display = 'block';
      R.innerHTML = '¡FELICITACIONES! Has adivinado la palabra.';
      
      letraInput.disabled = true; // Deshabilita el input
      jugarDeNuevoBtn.style.display = 'block'; // Muestra el botón de reiniciar

  } else if (intentosRestantes === 0) {
    // SI EL JUGADOR PIERDE:
    // Asegurarse de limpiar cualquier timeout de mensaje de error temporal pendiente
    // ¡ESTO ES CRUCIAL PARA QUE EL MENSAJE DE PERDIDO NO DESAPAREZCA!
    if (tempMessageTimeoutId) {
        clearTimeout(tempMessageTimeoutId);
        tempMessageTimeoutId = null;
    }

    R.style.display = 'block'; // Muestra el mensaje
    R.innerHTML = `¡HAS PERDIDO! La palabra era: ${palabraSecreta.toUpperCase()}`; // Muestra la palabra secreta
    
    letraInput.disabled = true; // Deshabilita el input
    jugarDeNuevoBtn.style.display = 'block'; // Muestra el botón de reiniciar

    const img = document.querySelector('.imagen');
    img.src = 'images/final.png'; // Imagen de "perdido"
  }
};
// async function cargarPalabras() {
//   try {
//     const respuesta = await fetch('palabras.json');
//     const datos = await respuesta.json();
//     const palabras = datos.palabras;
//     const indiceAleatorio = Math.floor(Math.random() * palabras.length);
//     console.log(palabras[indiceAleatorio]);
//     return palabras[indiceAleatorio];
//   } catch (error) {
//     console.error('Error al cargar las palabras:', error);
//     return 'error';
//   }
// }
// async function iniciarJuego() {
//   const palabraSecreta = await cargarPalabras();
//   let palabraMostrada = Array(palabraSecreta.length).fill('_');
//   let xletras = document.getElementById('xletras');
//   xletras.innerHTML = palabraSecreta.length;
//   let xintentos = document.getElementById('xintentos');
//   xintentos.innerHTML = 9;
//   const guiones = document.querySelector('.guiones');
//   guiones.innerHTML = palabraMostrada
//     .map((letra) => `<span>${letra}</span>`)
//     .join(' ');

//   const guionesSpans = document.querySelectorAll('.guiones span');
//   let errores = 0;
//   const letraInput = document.querySelector('#letraInput');
//   const R = document.querySelector('.R');
//   letraInput.addEventListener('keydown', function (event) {
//     if (event.key === 'Enter') {
//       const letraIngresada = letraInput.value.toLowerCase();
//       if (!/^[a-z]$/.test(letraIngresada)) {
//         console.warn('Por favor ingresa solo una letra válida.');
//         letraInput.value = '';
//         letraInput.focus();
//         return;
//       }
//       let acierto = false;
//       for (let i = 0; i < palabraSecreta.length; i++) {
//         if (letraIngresada === palabraSecreta[i]) {
//           guionesSpans[i].textContent = letraIngresada;
//           acierto = true;
//         }
//       }
//       if (!acierto) {
//         errores++;
//         xintentos.innerHTML--;
//         R.innerHTML = errores;
//         mostrarAhorcado(errores);
//         setTimeout(() => {
//           R.style.display = 'block';
//         R.innerHTML = `❌ Letra ${letraIngresada} incorrecta`;
//         }, 500);
//         R.style.display = 'none';
//         R.innerHTML = ''
//       }
//       letraInput.value = '';
//       opcionesJuego(parseInt(xintentos.innerHTML));
//     }
//   });
// }

// document.addEventListener('DOMContentLoaded', async () => {
//   await iniciarJuego();
// });

// function mostrarAhorcado(numero) {
//   const img = document.querySelector('.imagen');
//   img.src = 'images/' + numero + '.png';
// }

// let opcionesJuego = (intentos) => {
//   if (intentos === 0) {
//     const R = document.querySelector('.R');
//     R.style.display = 'block';
//     R.innerHTML = '¡HAS PERDIDO!';
//     const letraInput = document.getElementById('letraInput');
//     const boton = document.getElementById('enviarLetra');

//     // Deshabilitar input y botón
//     letraInput.disabled = true;
//     boton.disabled = true;

//     // Mostrar imagen final
//     const img = document.querySelector('.imagen');
//     img.src = 'images/final.png'; // Asegúrate de tener esta imagen
//   }
// };
