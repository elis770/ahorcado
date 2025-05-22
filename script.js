// 1. Array de palabras
const palabras = [
  'manzana',
  'futbol',
  'jardin',
  'telefono',
  'cascada',
  'bicicleta',
  'pintura',
  'computadora',
  'reloj',
  'espejo',
  'cortina',
  'almohada',
  'desierto',
  'montaña',
  'naranja',
  'estrella',
  'murcielago',
  'tigre',
  'elefante',
  'delfin',
  'guitarra',
  'piano',
  'bateria',
  'trueno',
  'relampago',
  'viento',
  'lluvia',
  'nieve',
  'sol',
  'luna',
  'océano',
  'bosque',
  'selva',
  'ciudad',
  'camino',
  'puerta',
  'ventana',
  'techo',
  'suelo',
  'pared',
  'libro',
  'pagina',
  'lapiz',
  'pluma',
  'cuaderno',
  'mesa',
  'silla',
  'lampara',
  'televisor',
  'radio',
  'coche',
  'autobus',
  'tren',
  'avion',
  'barco',
  'fruta',
  'verdura',
  'carne',
  'pescado',
  'arroz',
  'pan',
  'leche',
  'queso',
  'chocolate',
  'cafe',
  'flor',
  'arbol',
  'hoja',
  'raiz',
  'tronco',
  'animal',
  'insecto',
  'pez',
  'ave',
  'reptil',
  'huevo',
  'nido',
  'cueva',
  'isla',
  'playa',
];
// 2. Seleccionar una palabra aleatoria
let indiceAleatorio = Math.floor(Math.random() * palabras.length);
let palabraSecreta = palabras[indiceAleatorio];
console.log(palabraSecreta);
// 3. Crear array de guiones
//let guion = ["_"];
//let guion = `<span class="letras">_</span>`;

let palabraMostrada = Array(palabraSecreta.length).fill('_');
console.log(palabraSecreta.length, palabraMostrada);
const guiones = document.querySelector('.guiones');
guiones.innerHTML = palabraMostrada.map(letra => `<span>${letra}</span>`).join(" ");
const guionesSpans = document.querySelectorAll('.guiones span');
// 4. Contador de errores y límite
// let errores = 0;
// const maxErrores = 10;

// // 5. Array de letras usadas
// let letrasUsadas = [];

// // 6. Función para mostrar el ahorcado
// function mostrarAhorcado(errores) { ... }

// // 7. Función para validar y procesar letra
// function procesarLetra() { ... }
const letraInput = document.querySelector('#letraInput');
// 8. Evento del botón "Enter"
document.querySelector('button').addEventListener('click', function () {
  const letraIngresada = letraInput.value.toLowerCase(); //'r'
  // obtener letra, validar, comprobar, actualizar...
  for (let i = 0; i < palabraSecreta.length; i++) {
    if (letraIngresada === palabraSecreta[i]) {
      console.log(i);
      guionesSpans[i].textContent = letraIngresada
    }
  }
});
// if (letraDePalabra === letraIngresada) {
//     // actualiza palabraMostrada en la posición i
// }
// palabraMostrada[i] = letraIngresada;
// guiones.innerHTML = palabraMostrada.join(" ");

// if(letraIngresada != palabraSecreta){
//     return console.error('no es correcta')
// }

// let adivinar = input('')
// let errores = 0;
// if (!letraCorrecta) {
//     errores++;
//     mostrarAhorcado(errores);
// }
// function mostrarAhorcado(errores) {
//     const img = document.getElementById("ahorcado");
//     img.src = "images/" + errores + ".png";
// }