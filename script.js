// Opciones distintas para cada ruleta
const opcionesRuletas = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,],
  2: ["Rojo", "Verde", "Azul", "Amarillo"],
  3: ["100 pts", "200 pts", "500 pts", "Nada"]
};

// Mostrar solo la ruleta seleccionada
function mostrarRuleta(num) {
  document.querySelectorAll(".ruleta").forEach(div => div.classList.add("oculto"));
  document.getElementById("ruleta" + num).classList.remove("oculto");
}

// Dibujar ruleta en un canvas
function dibujarRuleta(num, anguloActual = 0) {
  const canvas = document.getElementById("canvas" + num);
  const ctx = canvas.getContext("2d");
  const opciones = opcionesRuletas[num];
  const numOpciones = opciones.length;
  const anguloPorOpcion = (2 * Math.PI) / numOpciones;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numOpciones; i++) {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, anguloActual + i * anguloPorOpcion, anguloActual + (i + 1) * anguloPorOpcion);

    // 🎨 Generar color dinámico según cantidad de opciones
    let hue = (i * 360) / numOpciones; // distribuye colores en el círculo cromático
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

    ctx.fill();
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(anguloActual + (i + 0.5) * anguloPorOpcion);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(opciones[i], 180, 10);
    ctx.restore();
  }
}


// Girar ruleta
function girarRuleta(num) {
  const opciones = opcionesRuletas[num];
  const numOpciones = opciones.length;
  const anguloPorOpcion = (2 * Math.PI) / numOpciones;

  let destino = Math.random() * 10 * 2 * Math.PI;
  let inicio = 0;
  let duracion = 3000;
  let tiempoInicio = null;

  function animar(timestamp) {
    if (!tiempoInicio) tiempoInicio = timestamp;
    let progreso = (timestamp - tiempoInicio) / duracion;

    if (progreso < 1) {
      let anguloActual = inicio + destino * progreso;
      dibujarRuleta(num, anguloActual);
      requestAnimationFrame(animar);
    } else {
      let anguloFinal = destino;
      dibujarRuleta(num, anguloFinal);
      let indice = Math.floor(((anguloFinal % (2 * Math.PI)) / anguloPorOpcion));
      alert("Resultado: " + opciones[indice]);
    }
  }

  requestAnimationFrame(animar);
}

// Inicializar todas las ruletas
dibujarRuleta(1);
dibujarRuleta(2);
dibujarRuleta(3);
