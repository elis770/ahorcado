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
  letraInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      document.querySelector('#enviarLetra').click(); // Simula el click del botón
    }
  });
  const R = document.querySelector('.R');

  document.querySelector('button').addEventListener('click', function () {
    const letraIngresada = letraInput.value.toLowerCase();
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
      xintentos.innerHTML--;
      R.innerHTML = errores;
      mostrarAhorcado(errores);
      console.error('❌ Letra incorrecta');
    }
    letraInput.value = '';
    opcionesJuego(parseInt(xintentos.innerHTML));
  });
}
document.addEventListener('DOMContentLoaded', async () => {
  await iniciarJuego();
});

function mostrarAhorcado(numero) {
  const img = document.querySelector('.imagen');
  img.src = 'images/' + numero + '.png';
}

let opcionesJuego = (intentos) => {
  if (intentos === 0) {
    const R = document.querySelector('.R');
    R.innerHTML = '¡HAS PERDIDO!';
    const letraInput = document.getElementById('letraInput');
    const boton = document.getElementById('enviarLetra');

    // Deshabilitar input y botón
    letraInput.disabled = true;
    boton.disabled = true;

    // Mostrar imagen final
    const img = document.querySelector('.imagen');
    img.src = 'images/final.png'; // Asegúrate de tener esta imagen
  }
};
