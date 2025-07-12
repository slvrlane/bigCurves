/**
 * @fileoverview Ein generatives Kunstwerk mit getrennten Seeds für Form und Farbe.
 * @author Marc & Gemini
 * @version 4.1
 */

const canvasSketch = require('canvas-sketch');
// const format = require('date-format');
const random = require('canvas-sketch-util/random');

// --- Module importieren ---
const { myColors, initiateSeed, addGrain, printFooter } = require('../lib/helpers.js');
const { drawArc } = require('../lib/dots.js');

// --- SEED-EINSTELLUNGEN ---
// HIER KANNST DU DIE SEEDS FIXIEREN ODER ZUFÄLLIG LASSEN (mit 0)
let SHAPE_SEED = 0; // 0 = zufällige Form. 'deine-seed-nummer' = feste Form.
let COLOR_SEED = 0; // 0 = zufällige Farben. 'deine-seed-nummer' = feste Farben.

// --- Globale, statische Einstellungen ---
const SHOW_GRAIN = true;
const PRINT_FOOTER = true;

const FILENAME_PREFIX = "2bigCurves"

// Parameter zum Experimentieren
const ANZ_SEGMENTS = 100;

const BASE1_RADIUS = 24;
const SPAGHETTI1_THICKNESS = BASE1_RADIUS * 1.5;

const BASE2_RADIUS = 8;
const SPAGHETTI2_THICKNESS = BASE2_RADIUS * 1;

const GRAIN_STYLE = "parallel"; // parallel, colorfull, red, invert

// Grundlegende Sketch-Settings (ohne benutzerdefinierte Eigenschaften)
const settings = {
  // dimensions: [655, 910],  // in A6 ratio, aber halb so gross für Arbeitsgalerie
  dimensions: [1311, 1819],  // A6 Karte mit bleed
  attributes: { willReadFrequently: true },
  animate: false,
  scaleToView: true,
};

/**
 * Die Haupt-Sketch-Funktion.
 * Der gesamte zufallsabhängige Code wird hier drin ausgeführt.
 */
const sketch = ({ context, width, height }) => {
  // --- KORREKTE SEED INITIALISIERUNG ---
  // Die Seeds werden direkt hier initialisiert, basierend auf den globalen Variablen.
  const shapeSeed = initiateSeed(SHAPE_SEED);
  const colorSeed = initiateSeed(COLOR_SEED);

  // --- FARBEN GENERIEREN ---
  // 1. Den Zufallsgenerator auf den Farben-Seed setzen.
  random.setSeed(colorSeed);
  // 2. Farben definieren. myColors() verwendet jetzt den korrekten Seed.
  const colors = {
    background: myColors(""),
    spaghetti1: myColors("", 1),
    spaghetti2: myColors("", 1),
  };

  // --- FORM-DATEN GENERIEREN ---
  const e = Math.min(width, height) * 0.01;
  // 3. Den Zufallsgenerator auf den Formen-Seed umschalten.
  random.setSeed(shapeSeed);
  // 4. Alle weiteren zufallsbasierten Berechnungen für die Form durchführen.
  const serpentine1Data = [];
  const serpentine2Data = [];
  const spaghetti1Size = SPAGHETTI1_THICKNESS * e;
  const spaghetti2Size = SPAGHETTI2_THICKNESS * e;
  const dot1Size = BASE1_RADIUS * e;
  const dot2Size = BASE2_RADIUS * e;

  let currentX = width / 2;
  let currentY = height / 3;
  let currentRadius = Math.floor(random.range(0.8, 1.5) * dot1Size);
  let startAngle = random.range(0, 2 * Math.PI);

  // Spagetthi 1
  for (let i = 0; i < ANZ_SEGMENTS; i++) {
    const angleOffset = random.range(0.6, 1.5 * Math.PI);
    const endAngle = startAngle + angleOffset;
    const isClockwise = i % 2 === 1;

    serpentine1Data.push({ x: currentX, y: currentY, radius: currentRadius, sAngle: startAngle, eAngle: endAngle, clw: isClockwise });

    const nextRadius = Math.floor(random.range(0.8, 1.5) * dot1Size);
    const connectionLength = currentRadius + nextRadius;
    const nextCenterX = currentX + connectionLength * Math.cos(endAngle);
    const nextCenterY = currentY + connectionLength * Math.sin(endAngle);

    currentX = nextCenterX;
    currentY = nextCenterY;
    currentRadius = nextRadius;
    startAngle = endAngle + Math.PI;
  }

  currentX = width / 2;
  currentY = height / 3;
  currentRadius = Math.floor(random.range(0.8, 1.5) * dot1Size);
  startAngle = random.range(0, 2 * Math.PI);

  // Spagetthi 2
  for (let i = 0; i < ANZ_SEGMENTS; i++) {
    const angleOffset = random.range(0.6, 1.5 * Math.PI);
    const endAngle = startAngle + angleOffset;
    const isClockwise = i % 2 === 1;

    serpentine2Data.push({ x: currentX, y: currentY, radius: currentRadius, sAngle: startAngle, eAngle: endAngle, clw: isClockwise });

    const nextRadius = Math.floor(random.range(0.8, 1.5) * dot2Size);
    const connectionLength = currentRadius + nextRadius;
    const nextCenterX = currentX + connectionLength * Math.cos(endAngle);
    const nextCenterY = currentY + connectionLength * Math.sin(endAngle);

    currentX = nextCenterX;
    currentY = nextCenterY;
    currentRadius = nextRadius;
    startAngle = endAngle + Math.PI;
  }

  // Die eigentliche Render-Funktion, die bei jedem Frame aufgerufen wird
  return ({ context, width, height }) => {
    // a. Hintergrund zeichnen
    context.fillStyle = colors.background.hex;
    context.fillRect(0, 0, width, height);

    // b1. Spaghetti1-Struktur zeichnen
    context.save();
    context.globalCompositeOperation = "overlay";
    serpentine1Data.forEach(segment => {
      context.save();
      context.translate(segment.x, segment.y);
      drawArc(context, segment.radius, colors.spaghetti1, spaghetti1Size, segment.sAngle, segment.eAngle, segment.clw);
      context.restore();
    });
    context.restore();

    // b2. Spaghetti2-Struktur zeichnen
    context.save();
    context.globalCompositeOperation = "overlay";
    serpentine2Data.forEach(segment => {
      context.save();
      context.translate(segment.x, segment.y);
      drawArc(context, segment.radius, colors.spaghetti2, spaghetti2Size, segment.sAngle, segment.eAngle, segment.clw);
      context.restore();
    });
    context.restore();

    // c. Optional: Grain hinzufügen
    if (SHOW_GRAIN) {
      addGrain(context, [width, height], GRAIN_STYLE);
    }

    // d. Optional: Fusszeile mit Infos drucken
    if (PRINT_FOOTER) {
      const colorList = [colors.background, colors.spaghetti1, colors.spaghetti2];
      const seeds = { shape: shapeSeed, color: colorSeed };
      printFooter(context, width, height, seeds, settings, colorList);
    }
  };
};

// --- STARTPUNKT DES PROGRAMMS ---


settings.prefix = FILENAME_PREFIX;
// settings.name = format('yyMMdd_hhmmss', new Date());
// Der Suffix kann jetzt die initialen Konfigurations-Seeds verwenden, um den Dateinamen aussagekräftig zu machen.
// settings.suffix = `s${SHAPE_SEED || 'rand'}-c${COLOR_SEED || 'rand'}`;

// Den Sketch mit den sauberen Settings starten.
canvasSketch(sketch, settings);
