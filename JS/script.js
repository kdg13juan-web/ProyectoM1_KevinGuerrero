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

  toastEl.textContent = message;
  toastEl.classList.add("show");

  clearTimeout(showToast._timeoutId);
  showToast._timeoutId = setTimeout(() => {
    toastEl.classList.remove("show");
  }, TOAST_DURATION_MS);
}

/**
 * hslToRgb
 * Convierte valores HSL a un array RGB [r,g,b] en rango 0-255.
 * @param {number} h Hue 0-360
 * @param {number} s Saturation 0-100
 * @param {number} l Lightness 0-100
 * @returns {number[]} [r, g, b]
 */
function hslToRgb(h, s, l) {
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

let basePalette = [];
let displayedPalette = [];
let currentBrightness = null; // "Alto" | "Medio" | "Bajo" | null
let currentSaturation = null; // "Alta" | "Media" | "Baja" | null

/* =========================
   Funciones principales
   ========================= */

function setButtonsForType(type) {
  if (type === "normal") {
    divStyleButtons.style.display = "none";
    currentBrightness = null;
    currentSaturation = null;
    return;
  }

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

  btnBrightness.textContent = "Brillo: " + currentBrightness;
  btnSaturation.textContent = "Saturación: " + currentSaturation;
}

function cycleBrightnessValue() {
  if (!currentBrightness) currentBrightness = BRIGHTNESS_CYCLE[0];
  const index = BRIGHTNESS_CYCLE.indexOf(currentBrightness);
  currentBrightness = BRIGHTNESS_CYCLE[(index + 1) % BRIGHTNESS_CYCLE.length];
  btnBrightness.textContent = "Brillo: " + currentBrightness;
}

function cycleSaturationValue() {
  if (!currentSaturation) currentSaturation = SATURATION_CYCLE[0];
  const index = SATURATION_CYCLE.indexOf(currentSaturation);
  currentSaturation = SATURATION_CYCLE[(index + 1) % SATURATION_CYCLE.length];
  btnSaturation.textContent = "Saturación: " + currentSaturation;
}

/* =========================
   Generación de colores
   ========================= */

function generateBaseColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

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

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  const rgbArr = hslToRgb(h, s, l);
  const hex = rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
  const rgb = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
  const hsl = `hsl(${h}, ${s}%, ${l}%)`;

  return { h, s, l, hex, rgb, hsl, locked: false };
}

/* =========================
   Filtro de daltonismo
   ========================= */

/**
 * Matrices de transformación para simular daltonismo
 * Basadas en Brettel et al. 1997
 */
const COLOR_BLIND_MATRICES = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

// FIX: Estado del modo daltonismo declarado UNA SOLA VEZ aquí (nivel módulo)
let currentColorBlindMode = 'none';

/**
 * applyColorBlindFilter
 * Aplica la matriz de transformación al color para simular daltonismo
 */
function applyColorBlindFilter(r, g, b, mode) {
  if (mode === 'none' || !COLOR_BLIND_MATRICES[mode]) {
    return [r, g, b];
  }

  const matrix = COLOR_BLIND_MATRICES[mode];
  const norm = [r / 255, g / 255, b / 255];

  const transformed = [
    (matrix[0][0] * norm[0] + matrix[0][1] * norm[1] + matrix[0][2] * norm[2]) * 255,
    (matrix[1][0] * norm[0] + matrix[1][1] * norm[1] + matrix[1][2] * norm[2]) * 255,
    (matrix[2][0] * norm[0] + matrix[2][1] * norm[1] + matrix[2][2] * norm[2]) * 255
  ];

  return transformed.map(v => Math.round(Math.max(0, Math.min(255, v))));
}

/* =========================
   Aplicar ajustes sobre la paleta base
   ========================= */

function applyBrightnessAndSaturation() {
  if (!basePalette || basePalette.length === 0) return;

  displayedPalette = basePalette.map((baseColor) => {
    let h = baseColor.h;
    let s = baseColor.s;
    let l = baseColor.l;

    if (!baseColor.locked) {
      if (currentBrightness === "Alto") {
        l = Math.min(90, l + 20);
      } else if (currentBrightness === "Medio") {
        l = 50;
      } else if (currentBrightness === "Bajo") {
        l = Math.max(10, l - 20);
      }

      if (currentSaturation === "Alta") {
        s = Math.min(100, s + 30);
      } else if (currentSaturation === "Media") {
        s = 50;
      } else if (currentSaturation === "Baja") {
        s = Math.max(0, s - 30);
      }
    }

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

function renderDisplayedPalette() {
  const format = selectFormat.value;
  containerPalette.innerHTML = "";

  displayedPalette.forEach((color, index) => {
    const box = document.createElement("div");
    box.className = "color-box";

    // FIX: displayHex calculado correctamente y textToCopy declarado con let
    let displayHex = color.hex;
    if (currentColorBlindMode !== 'none') {
      const rgbArr = hslToRgb(color.h, color.s, color.l);
      const filtered = applyColorBlindFilter(rgbArr[0], rgbArr[1], rgbArr[2], currentColorBlindMode);
      displayHex = rgbToHex(filtered[0], filtered[1], filtered[2]);
    }

    box.style.background = displayHex;
    box.style.position = "relative";

    // FIX: textToCopy declarado con let dentro del scope correcto
    const info = document.createElement("div");
    info.className = "color-info";
    let textToCopy;
    switch (format) {
      case "hex":
        info.textContent = displayHex;
        textToCopy = displayHex;
        break;
      case "rgb":
        info.textContent = color.rgb;
        textToCopy = color.rgb;
        break;
      case "hsl":
      default:
        info.textContent = color.hsl;
        textToCopy = color.hsl;
        break;
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
      e.stopPropagation();
      basePalette[index].locked = !basePalette[index].locked;
      displayedPalette[index].locked = !displayedPalette[index].locked;
      renderDisplayedPalette();
      showToast(basePalette[index].locked ? "🔒 Color bloqueado" : "🔓 Color desbloqueado");
    });

    box.appendChild(info);
    box.appendChild(lockWrapper);

    // Evento de copiar color
    box.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        box.classList.add('copied');
        setTimeout(() => box.classList.remove('copied'), 400);
        showToast("📋 Copiado: " + textToCopy);
      } catch (err) {
        showToast("❌ No se pudo copiar");
      }
    });

    containerPalette.appendChild(box);
  });
}

// FIX: Listener del select de daltonismo registrado UNA SOLA VEZ, fuera del forEach
const selectColorBlind = document.getElementById("colorBlindMode");
selectColorBlind.addEventListener("change", () => {
  currentColorBlindMode = selectColorBlind.value;
  renderDisplayedPalette();
  const modeNames = {
    'none': 'Normal',
    'protanopia': 'Protanopia',
    'deuteranopia': 'Deuteranopia',
    'tritanopia': 'Tritanopia',
    'achromatopsia': 'Escala de Grises'
  };
  showToast("👁️ Modo: " + modeNames[currentColorBlindMode]);
});

/* =========================
   Operaciones de paleta
   ========================= */

function generatePalette(size) {
  if (basePalette.length === 0) {
    basePalette = Array.from({ length: size }, () => {
      const base = generateBaseColor();
      return { h: base.h, s: base.s, l: base.l, locked: false };
    });
  } else {
    basePalette = basePalette.map((color) => {
      if (color.locked) return color;
      const base = generateBaseColor();
      return { h: base.h, s: base.s, l: base.l, locked: false };
    });
  }

  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🎨 Nueva paleta generada");
}

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
    formats.appendChild(document.createTextNode(" hex  " + color.hex));
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

btnGenerate.addEventListener("click", () => {
  const size = parseInt(selectPaletteSize.value, 10) || 6;
  generatePalette(size);
});

selectPaletteSize.addEventListener("change", () => {
  const newSize = parseInt(selectPaletteSize.value, 10) || 6;
  changePaletteSize(newSize);
});

selectFormat.addEventListener("change", () => {
  renderDisplayedPalette();
  showToast("🔤 Formato cambiado");
});

selectType.addEventListener("change", () => {
  const type = selectType.value;
  setButtonsForType(type);

  if (type === "normal") {
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

  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🔤 Tipo cambiado: " + type);
});

btnBrightness.addEventListener("click", () => {
  cycleBrightnessValue();
  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("☀️ Brillo cambiado a " + currentBrightness);
});

btnSaturation.addEventListener("click", () => {
  cycleSaturationValue();
  applyBrightnessAndSaturation();
  renderDisplayedPalette();
  showToast("🎚️ Saturación cambiada a " + currentSaturation);
});

btnSave.addEventListener("click", () => {
  savePaletteToDOM();
});

/* =========================
   Inicialización
   ========================= */

(function init() {
  setButtonsForType(selectType.value || "normal");
  const initialSize = parseInt(selectPaletteSize.value, 10) || 6;
  generatePalette(initialSize);
})();

/* Dark mode */
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});