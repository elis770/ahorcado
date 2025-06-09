let palabraSecreta,
  letraInput,
  R,
  xintentos,
  guionesSpans,
  errores = 0,
  tempMessageTimeoutId = null,
  img,
  guiones,
  jugarDeNuevoBtn,
  m,
  palabraAdivinada;

async function cargarPalabras() {
  try {
    const respuesta = await fetch('palabras.json');
    const datos = await respuesta.json();
    const palabras = datos.palabras;
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    console.log(palabras[indiceAleatorio]);
    return palabras[indiceAleatorio];
  } catch (error) {
    mostrarMensajeTemporal('⚠️ Error al cargar las palabras: ' + error);
  }
}

async function objetosJuego() {
  palabraSecreta = await cargarPalabras();
  let palabraMostrada = Array(palabraSecreta.length).fill('_');
  let xletras = document.getElementById('xletras');
  xletras.innerHTML = palabraSecreta.length;
  xintentos.innerHTML = 9;
  guiones.innerHTML = palabraMostrada
    .map((letra) => `<span>${letra}</span>`)
    .join(' ');
  guionesSpans = document.querySelectorAll('.guiones span');
  //Limpiar cualquier timeout pendiente de una partida anterior
  if (tempMessageTimeoutId) {
    clearTimeout(tempMessageTimeoutId);
    tempMessageTimeoutId = null;
  }
  // Habilitar input
  letraInput.disabled = false;
  letraInput.value = '';
  letraInput.focus();
  R.style.display = 'none';
}
function mostrarMensajeTemporal(mensaje) {
  if (tempMessageTimeoutId) {
    clearTimeout(tempMessageTimeoutId);
  }
  m.style.display = 'flex';
  R.style.display = 'block';
  R.innerHTML = mensaje;
    setTimeout(() => {
      m.style.display = 'none';
      R.style.display = 'none';
      R.innerHTML = '';
      tempMessageTimeoutId = null;
    }, 1000);
}

function accionJuego(l, t) {
  let acierto = false;
  if (!/^[a-z]$/.test(l)) {
    mostrarMensajeTemporal('⚠️ Por favor ingresa solo una letra válida.');
    letraInput.value = '';
    letraInput.focus();
    return;
  }
  for (let i = 0; i < t.length; i++) {
    if (l === t[i]) {
      guionesSpans[i].textContent = l;
      acierto = true;
    }
  }

  if (!acierto) {
    errores++;
    xintentos.innerHTML--;
    console.log(xintentos);
    personita(errores);
    if (!palabraAdivinada && parseInt(xintentos.innerHTML) > 1) {
      mostrarMensajeTemporal(`❌ Letra "${l.toUpperCase()}" incorrecta.`);
    }
    if (xintentos < 0) {
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

function personita(numero) {
  img = document.querySelector('.imagen');
  img.src = 'images/' + numero + '.png';
}

let opcionesJuego = (i, t, g) => {
  palabraAdivinada = Array.from(g).every((s) => s.textContent.trim() !== '_');
  if (palabraAdivinada) {
    letraInput.disabled = true;
    m.style.display = 'flex';
    R.style.display = 'block';
    jugarDeNuevoBtn.style.display = 'block';
    R.innerHTML = '¡FELICITACIONES! Has adivinado la palabra.';
  } else if (i === 0) {
    if (tempMessageTimeoutId) {
      clearTimeout(tempMessageTimeoutId);
      tempMessageTimeoutId = null;
    }

    letraInput.disabled = true;
    m.style.display = 'flex';
    R.style.display = 'block';
    R.innerHTML = `¡HAS PERDIDO! La palabra era: ${t.toUpperCase()}`;
    jugarDeNuevoBtn.style.display = 'block';
    const img = document.querySelector('.imagen');
    img.src = 'images/final.png';
  }
};
document.addEventListener('DOMContentLoaded', async () => {
  jugarDeNuevoBtn = document.getElementById('jugarDeNuevoBtn');
  jugarDeNuevoBtn.addEventListener('click', () => {
    location.reload();
  });
  jugarDeNuevoBtn.style.display = 'none';
  m = document.querySelector('main');
  m.style.display = 'none';
  (letraInput = document.getElementById('letraInput')),
    (R = document.querySelector('.R')),
    (xintentos = document.getElementById('xintentos')),
    (guiones = document.querySelector('.guiones'));

  letraInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const letraIngresada = letraInput.value.toLowerCase();
      if (letraInput.disabled) {
        return;
      } else {
        accionJuego(letraIngresada, palabraSecreta);
      }
    }
  });

  await objetosJuego();
});
