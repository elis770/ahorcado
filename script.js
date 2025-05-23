async function cargarPalabras() {
  try {
    const respuesta = await fetch('palabras.json');
    const datos = await respuesta.json();
    const palabras = datos.palabras;
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    return palabras[indiceAleatorio];
  } catch (error) {
    console.error('Error al cargar las palabras:', error);
    return 'error';
  }
}
async function iniciarJuego() {
  const palabraSecreta = await cargarPalabras();
  let palabraMostrada = Array(palabraSecreta.length).fill('_');

  const guiones = document.querySelector('.guiones');
  guiones.innerHTML = palabraMostrada
    .map((letra) => `<span>${letra}</span>`)
    .join(' ');

  const guionesSpans = document.querySelectorAll('.guiones span');
  let errores = 0;
  const letraInput = document.querySelector('#letraInput');
  const R = document.querySelector('.R');

  document.querySelector('button').addEventListener('click', function () {
    const letraIngresada = letraInput.value.toLowerCase();
    if (!/^[a-z]$/.test(letraIngresada)) {
      console.warn('Por favor ingresa solo una letra válida.');
      letraInput.value = '';
      return;
    }
    let acierto = false;
    for (let i = 0; i < palabraSecreta.length; i++) {
      if (letraIngresada === palabraSecreta[i]) {
        guionesSpans[i].textContent = letraIngresada;
        acierto = true;
        return;
      }
    }
    if (!acierto) {
      errores++;
      R.innerHTML = errores;
      console.error('❌ Letra incorrecta');
    }
    letraInput.value = '';
  });
}
document.addEventListener('DOMContentLoaded', async () => {
  await iniciarJuego();
});

// // 6. Función para mostrar el ahorcado
// function mostrarAhorcado(errores) { ... }

// function mostrarAhorcado(errores) {
//     const img = document.getElementById("ahorcado");
//     img.src = "images/" + errores + ".png";
// }