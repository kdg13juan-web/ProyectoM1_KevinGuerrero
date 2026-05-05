// Generar color aleatorio
function generarColorAleatorio() {
  const r = Math.floor(Math.random() * 250);
  const g = Math.floor(Math.random() * 250);
  const b = Math.floor(Math.random() * 250);
  
  const hex = "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
  
  const rgb = `rgb(${r}, ${g}, ${b})`;
  
  return { r, g, b, hex, rgb };
}

// Mostrar paleta de colores
function mostrarPaleta(colores) {
  const contenedor = document.getElementById("contenedorColores");
  contenedor.innerHTML = "";
  
  colores.forEach((color, index) => {
    const colorItem = document.createElement("div");
    colorItem.className = "color-item";
    
    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.backgroundColor = color.hex;
    preview.title = `Click para copiar: ${color.hex}`;
    preview.onclick = () => copiarAlPortapapeles(color.hex);
    
    const codigoHex = document.createElement("div");
    codigoHex.className = "color-codigo";
    codigoHex.innerHTML = `<span class="color-hex">${color.hex}</span>`;
    
    const codigoRgb = document.createElement("div");
    codigoRgb.className = "color-codigo";
    codigoRgb.innerHTML = `<span class="color-rgb">${color.rgb}</span>`;
    
    colorItem.appendChild(preview);
    colorItem.appendChild(codigoHex);
    colorItem.appendChild(codigoRgb);
    
    contenedor.appendChild(colorItem);
  });
  
  document.getElementById("paleta").classList.remove("oculto");
}

// Copiar código al portapapeles
function copiarAlPortapapeles(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    alert("✅ Copiado: " + texto);
  });
}
const opcionesRuletas = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33
    , 34, 35, 36,37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,71, 72, 73, 74, 75, 76, 77, 78, 79, 80
    ,81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33
    , 34, 35, 36,37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,71, 72, 73, 74, 75, 76, 77, 78, 79, 80
    ,81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]
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
    ctx.fillStyle = "#000000";
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

  let destino = Math.random() * 20 * 2 * Math.PI;
  let inicio = 30;
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
      
      // Calcular el índice ganador
      let indiceGanador = Math.floor(((anguloFinal % (2 * Math.PI)) / anguloPorOpcion));
      let numeroGanador = opcionesRuletas[num][indiceGanador];
      
      // Mostrar el número ganador
      alert(`🎉 ¡GANASTE EL NÚMERO ${numeroGanador}! 🎉`);
      
      let colores = [];
      // Generar 6 colores aleatorios
      for (let i = 0; i < 6; i++) {
        colores.push(generarColorAleatorio());
      }
      
      // Mostrar paleta
      mostrarPaleta(colores);
    }
  }

  requestAnimationFrame(animar);
}

// Inicializar ruletas
dibujarRuleta(1);
dibujarRuleta(2);
