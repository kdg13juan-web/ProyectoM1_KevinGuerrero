/**
 * script.js
 * Generador de paletas con tipos, brillo y saturación interactivos
 *
 * Versión educativa: variables y funciones con nombres claros,
 * comentarios explicativos y estructura modular para facilitar el aprendizaje.
 */

/* =========================
   Constantes y utilidades
   ========================= */

/**
 * Tiempo en ms que dura visible el toast
 * Cambia esto si quieres que el mensaje dure más o menos.
 */
const TOAST_DURATION_MS = 1800;

/**
 * Ciclos predefinidos para los botones interactivos.
 * Los ciclos definen el orden en que se recorren los valores al hacer click.
 */
const BRIGHTNESS_CYCLE = ["Alto", "Medio", "Bajo"];
const SATURATION_CYCLE = ["Alta", "Media", "Baja"];

/* =========================
   Funciones utilitarias
   ========================= */

/**
 * showToast
 * Muestra un mensaje breve en pantalla (toast).
 * @param {string} message Texto a mostrar
 */

function showToast(message) {
  let toastEl = document.getElementById("toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "toast";
    document.body.appendChild(toastEl);
  }

  // Actualiza el texto y muestra el toast
  toastEl.textContent = message;
  toastEl.classList.add("show");

  // Limpia cualquier timeout previo y programa el ocultado
  clearTimeout(showToast._timeoutId);
  showToast._timeoutId = setTimeout(() => {
    toastEl.classList.remove("show");
  }, TOAST_DURATION_MS);
}




/**
 * hslToRgb
 * Convierte valores HSL a un array RGB [r,g,b] en rango 0-255.
 * Implementación estándar para poder reconstruir HEX/RGB desde HSL.
 * @param {number} h Hue 0-360
 * @param {number} s Saturation 0-100
 * @param {number} l Lightness 0-100
 * @returns {number[]} [r, g, b]
 */
function hslToRgb(h, s, l) {
  // Normalizar
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;

  if (sat === 0) {
    const v = Math.round(light * 255);
    return [v, v, v];
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const hk = hue / 360;

  const calc = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const r = Math.round(calc(hk + 1 / 3) * 255);
  const g = Math.round(calc(hk) * 255);
  const b = Math.round(calc(hk - 1 / 3) * 255);

  return [r, g, b];
}

/**
 * rgbToHex
 * Convierte tres valores RGB (0-255) a una cadena HEX como "#AABBCC".
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} HEX
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/* =========================
   Referencias al DOM
   ========================= */

/**
 * Guardamos referencias a los elementos del DOM que usamos frecuentemente.
 * Esto evita buscar elementos repetidamente y hace el código más claro.
 */
const btnGenerate = document.getElementById("generateBtn");
const btnSave = document.getElementById("saveBtn");
const containerPalette = document.getElementById("palette");
const containerSavedPalettes = document.getElementById("savedPalettes");
const selectPaletteSize = document.getElementById("paletteSize");
const selectFormat = document.getElementById("format");
const selectType = document.getElementById("style");
const divStyleButtons = document.getElementById("styleButtons");
const btnBrightness = document.getElementById("brightnessBtn");
const btnSaturation = document.getElementById("saturationBtn");

/* =========================
   Estado de la aplicación
   ========================= */

/**
 * basePalette
 * Array con los colores base generados inicialmente.
 * Cada elemento tiene la forma { h, s, l } (valores numéricos).
 */
let basePalette = [];

/**
 * displayedPalette
 * Array con los colores que se muestran actualmente en pantalla.
 * Cada elemento tiene { h, s, l, hex, rgb, hsl }.
 */
let displayedPalette = [];

/**
 * Valores actuales de brillo y saturación que aplicamos sobre basePalette.
 * Si son null significa que no hay ajuste aplicado (tipo Normal).
 */
let currentBrightness = null; // "Alto" | "Medio" | "Bajo" | null
let currentSaturation = null; // "Alta" | "Media" | "Baja" | null

/* =========================
   Funciones principales
   ========================= */

/**
 * setButtonsForType
 * Actualiza la visibilidad y el texto de los botones de Brillo y Saturación
 * según el tipo seleccionado (Normal, Pastel, Neón, Joya, Muted, Tierra).
 * No regenera la paleta: solo prepara los valores que se aplicarán.
 * @param {string} type Valor del selectType
 */
function setButtonsForType(type) {
  if (type === "normal") {
    // Ocultar botones y resetear ajustes
    divStyleButtons.style.display = "none";
    currentBrightness = null;
    currentSaturation = null;
    return;
  }

  // Mostrar botones y asignar valores iniciales según el tipo
  divStyleButtons.style.display = "flex";

  switch (type) {
    case "pastel":
      currentBrightness = "Alto";
      currentSaturation = "Baja";
      break;
    case "neon":
      currentBrightness = "Alto";
      currentSaturation = "Alta";
      break;
    case "joya":
      currentBrightness = "Bajo";
      currentSaturation = "Alta";
      break;
    case "muted":
      currentBrightness = "Medio";
      currentSaturation = "Baja";
      break;
    case "tierra":
      currentBrightness = "Medio";
      currentSaturation = "Media";
      break;
    default:
      currentBrightness = "Medio";
      currentSaturation = "Media";
  }

  // Actualizar texto visible en los botones
  btnBrightness.textContent = "Brillo: " + currentBrightness;
  btnSaturation.textContent = "Saturación: " + currentSaturation;

}

/**
 * cycleBrightnessValue
 * Cambia el valor de brillo al siguiente del ciclo y actualiza el texto del botón.
 */
function cycleBrightnessValue() {
  if (!currentBrightness) currentBrightness = BRIGHTNESS_CYCLE[0];
  const index = BRIGHTNESS_CYCLE.indexOf(currentBrightness);
  currentBrightness = BRIGHTNESS_CYCLE[(index + 1) % BRIGHTNESS_CYCLE.length];
  btnBrightness.textContent = "Brillo: " + currentBrightness;
}

/**
 * cycleSaturationValue
 * Cambia el valor de saturación al siguiente del ciclo y actualiza el texto del botón.
 */
function cycleSaturationValue() {
  if (!currentSaturation) currentSaturation = SATURATION_CYCLE[0];
  const index = SATURATION_CYCLE.indexOf(currentSaturation);
  currentSaturation = SATURATION_CYCLE[(index + 1) % SATURATION_CYCLE.length];
  btnSaturation.textContent = "Saturación: " + currentSaturation;
}

/* =========================
   Generación de colores
   ========================= */

/**
 * generateBaseColor
 * Crea un color base aleatorio y devuelve un objeto con h, s, l.
 * También devuelve hex/rgb/hsl por conveniencia.
 * @returns {{h:number,s:number,l:number,hex:string,rgb:string,hsl:string}}
 */
function generateBaseColor() {
  // Generamos RGB aleatorio
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convertimos RGB a HSL (algoritmo estándar)
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convertir a escala humana
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  // Reconstruir RGB/HEX desde HSL para consistencia
  const rgbArr = hslToRgb(h, s, l);
  const hex = rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
  const rgb = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
  const hsl = `hsl(${h}, ${s}%, ${l}%)`;

  return { h, s, l, hex, rgb, hsl,locked: false };
}

/* =========================
   Aplicar ajustes sobre la paleta base
   ========================= */

/**
 * applyBrightnessAndSaturation
 * Toma la basePalette (h,s,l) y aplica los ajustes actuales de brillo y saturación.
 * Actualiza displayedPalette con los valores hex/rgb/hsl resultantes.
 */
function applyBrightnessAndSaturation() {
  if (!basePalette || basePalette.length === 0) return;

  displayedPalette = basePalette.map((baseColor) => {
    let h = baseColor.h;
    let s = baseColor.s;
    let l = baseColor.l;
// Si el color NO está bloqueado, aplicar cambios
    if (!baseColor.locked) {
    // Ajuste de brillo
    if (currentBrightness === "Alto") {
      l = Math.min(90, l + 20);
    } else if (currentBrightness === "Medio") {
      l = 50;
    } else if (currentBrightness === "Bajo") {
      l = Math.max(10, l - 20);
    }

    // Ajuste de saturación
    if (currentSaturation === "Alta") {
      s = Math.min(100, s + 30);
    } else if (currentSaturation === "Media") {
      s = 50;
    } else if (currentSaturation === "Baja") {
      s = Math.max(0, s - 30);
    }
  }

    // Reconstruir valores de salida
    const rgbArr = hslToRgb(h, s, l);
    const hex = rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
    const rgb = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;

    return { h, s, l, hex, rgb, hsl, locked: baseColor.locked };
  });
}

/* =========================
   Renderizado en DOM
   ========================= */

/**
 * renderDisplayedPalette
 * Dibuja displayedPalette en el DOM usando el formato seleccionado.
 * Cada caja copia su valor al portapapeles al hacer click.
 */
function renderDisplayedPalette() {
  const format = selectFormat.value;
  containerPalette.innerHTML = "";

  displayedPalette.forEach((color, index) => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.background = color.hex;
    box.style.position = "relative"; // Para posicionar elementos internos

    // Información del color
    const info = document.createElement("div");
    info.className = "color-info";
    switch (format) {
    case "hex":
    info.textContent = color.hex;
    textToCopy = color.hex;
    break;
     case "rgb":
    info.textContent = color.rgb;
    textToCopy = color.rgb;
    break;
     case "hsl":
    info.textContent = color.hsl;
    textToCopy = color.hsl;
    break;
    default:
    info.textContent = color.hsl; // fallback
    
}

    // Tooltip para copiar color
    const colorTooltip = document.createElement("span");
    colorTooltip.className = "tooltip color-tooltip";
    colorTooltip.textContent = "Haz clic para copiar el color";
    box.appendChild(colorTooltip);

    // Candado + tooltip
    const lockIcon = document.createElement("button");
    lockIcon.className = "lock-icon";
    lockIcon.innerHTML = color.locked ? "🔒" : "🔓";

    const lockTooltip = document.createElement("span");
    lockTooltip.className = "tooltip lock-tooltip";
    lockTooltip.textContent = "Haz clic para bloquear color";

    const lockWrapper = document.createElement("div");
    lockWrapper.className = "lock-wrapper";
    lockWrapper.appendChild(lockIcon);
    lockWrapper.appendChild(lockTooltip);

    // Evento del candado
    lockIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Evitar copiar al hacer click en el candado
      basePalette[index].locked = !basePalette[index].locked;
      displayedPalette[index].locked = !displayedPalette[index].locked;
      renderDisplayedPalette(); // Redibujar para actualizar el icono
      showToast(basePalette[index].locked ? "🔒 Color bloqueado" : "🔓 Color desbloqueado");
    });

    // Agregar elementos al box
    box.appendChild(info);
    box.appendChild(lockWrapper);

    // Evento de copiar color
    box.addEventListener("click", async () => {
        let textToCopy;
          switch (format) {
          case "hex":
        textToCopy = color.hex;
          break;
          case "rgb":
        textToCopy = color.rgb;
          break;
          case "hsl":
          default:
        textToCopy = color.hsl;
    }
  
      try {
        await navigator.clipboard.writeText(textToCopy);
        box.classList.add('copied');
        setTimeout(() => box.classList.remove('copied'), 400);
        showToast("📋 Copiado: " + textToCopy);
      } catch (err) {
        showToast("❌ No se pudo copiar");
      }
    });

    // Finalmente agregar el box al contenedor
    containerPalette.appendChild(box);
  });
}



  // Animación al copiar
      document.querySelectorAll('.color-box').forEach(box => {
      box.addEventListener('click', function() {
        // Copia el color (puedes ajustar esto según tu estructura)
        const color = this.dataset.hex || this.textContent;
        navigator.clipboard.writeText(color);

        // Animación
        this.classList.add('copied');
        setTimeout(() => this.classList.remove('copied'), 400);
      });
    });



/* =========================
   Operaciones de paleta
   ========================= */

/**
 * generatePalette
 * Genera una nueva basePalette con la cantidad solicitada y aplica ajustes actuales.
 * No mezcla la lógica: primero genera la base, luego aplica ajustes y finalmente renderiza.
 * @param {number} size Cantidad de colores a generar
 */
function generatePalette(size) {
  // Si ya hay paleta y queremos más colores, generar solo los nuevos
  // Si queremos menos, recortar conservando bloqueados
  
  if (basePalette.length === 0) {
    basePalette = Array.from({ length: size }, () => {
      const base = generateBaseColor();
      return { h: base.h, s: base.s, l: base.l, locked: false };
    });
  } else {
    // Regenerar solo los colores NO bloqueados
    basePalette = basePalette.map((color) => {
      if (color.locked) {
        return color; // Mantener bloqueado
      }
      const base = generateBaseColor();
      return { h: base.h, s: base.s, l: base.l, locked: false };
    });
  }

  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🎨 Nueva paleta generada");
}

/**
 * changePaletteSize
 * Ajusta el tamaño de la paleta sin perder los colores existentes cuando es posible.
 * Si la paleta no existe, genera una nueva.
 * @param {number} newSize
 */
function changePaletteSize(newSize) {
  if (!basePalette || basePalette.length === 0) {
    generatePalette(newSize);
    return;
  }

  const currentSize = basePalette.length;
  if (newSize > currentSize) {
    const toAdd = newSize - currentSize;
    for (let i = 0; i < toAdd; i++) {
      const base = generateBaseColor();
      basePalette.push({ h: base.h, s: base.s, l: base.l, locked: false });
    }
  } else if (newSize < currentSize) {
    basePalette = basePalette.slice(0, newSize);
  }

  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🔢 Tamaño ajustado a " + newSize);
}

/**
 * savePaletteToDOM
 * Guarda la paleta actual en la sección de paletas guardadas (solo DOM).
 * No persiste en localStorage en esta versión educativa.
 */
function savePaletteToDOM() {
  if (!displayedPalette || displayedPalette.length === 0) {
    showToast("⚠️ No hay colores para guardar");
    return;
  }

  const paletteWrapper = document.createElement("div");
  paletteWrapper.className = "palette";

  displayedPalette.forEach((color) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.flexDirection = "column";
    item.style.alignItems = "center";

    const box = document.createElement("div");
    box.className = "color-box";
    box.style.width = "100px";
    box.style.height = "100px";
    box.style.borderRadius = "6px";
    box.style.border = "1px solid #ccc";
    box.style.background = color.hex;

    const formats = document.createElement("div");
    formats.className = "formats";
    formats.style.marginTop = "6px";
    formats.style.fontSize = "12px";
    formats.style.textAlign = "center";
    
    formats.appendChild(document.createTextNode(color.hsl));
    formats.appendChild(document.createElement("br"));
    formats.appendChild(document.createTextNode(" hex  " + color.hex) );
    formats.appendChild(document.createElement("br"));
    formats.appendChild(document.createTextNode(color.rgb));
  

    item.appendChild(box);
    item.appendChild(formats);
    paletteWrapper.appendChild(item);
  });

  containerSavedPalettes.appendChild(paletteWrapper);
  showToast("💾 Paleta guardada");
}

/* =========================
   Eventos de UI
   ========================= */

// Generar nueva paleta al hacer click
btnGenerate.addEventListener("click", () => {
  const size = parseInt(selectPaletteSize.value, 10) || 6;
  generatePalette(size);
});

// Cambiar tamaño de paleta desde el select
selectPaletteSize.addEventListener("change", () => {
  const newSize = parseInt(selectPaletteSize.value, 10) || 6;
  changePaletteSize(newSize);
});

// Cambiar formato de visualización (HEX/RGB o HSL)
selectFormat.addEventListener("change", () => {
  renderDisplayedPalette();
  showToast("🔤 Formato cambiado");
});

// Cambiar tipo (Normal, Pastel, Neón, Joya, Muted, Tierra)
// No regenera la paleta: aplica ajustes sobre la paleta base existente
selectType.addEventListener("change", () => {
  const type = selectType.value;
  setButtonsForType(type);

  if (type === "normal") {
    // Revertir displayedPalette a basePalette sin ajustes
    displayedPalette = basePalette.map((base) => {
      const rgbArr = hslToRgb(base.h, base.s, base.l);
      return {
        h: base.h,
        s: base.s,
        l: base.l,
        hex: rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]),
        rgb: `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`,
        hsl: `hsl(${base.h}, ${base.s}%, ${base.l}%)`,
      };
    });
    renderDisplayedPalette();
    showToast("🔤 Tipo: Normal (sin ajustes)");
    return;
  }

  // Para otros tipos, aplicar ajustes y renderizar
  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🔤 Tipo cambiado: " + type);
});

// Brillo interactivo: ciclar valor y aplicar sobre la paleta base
btnBrightness.addEventListener("click", () => {
  cycleBrightnessValue();
  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("☀️ Brillo cambiado a " + currentBrightness);
});

// Saturación interactiva: ciclar valor y aplicar sobre la paleta base
btnSaturation.addEventListener("click", () => {
  cycleSaturationValue();
  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🎚️ Saturación cambiada a " + currentSaturation);
});






// Guardar paleta actual
btnSave.addEventListener("click", () => {
  savePaletteToDOM();
});

/* =========================
   Inicialización
   ========================= */

/**
 * init
 * Función que se ejecuta al cargar el script para dejar la UI en un estado válido.
 * - Configura botones según el tipo por defecto
 * - Genera una paleta inicial
 */
(function init() {
  setButtonsForType(selectType.value || "normal");
  const initialSize = parseInt(selectPaletteSize.value, 10) || 6;
  generatePalette(initialSize);
})();

/*color dark mode*/
const toggle = document.getElementById("themeToggle");

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });


