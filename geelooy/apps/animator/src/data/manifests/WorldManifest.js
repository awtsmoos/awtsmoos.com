
// B"H
/**
 * @file WorldManifest.js
 * @description
 * 
 * ============================================================================
 * CHAPTER: THE BLUEPRINT OF ASSIYAH (Tochnit Ha-Olam)
 * ============================================================================
 * Another JSON vessel shattered and reborn as pure JavaScript.
 * This file contains the exact geometric layout of the initial physical park.
 * Every mountain, every building, and every blade of grass is spoken into 
 * existence through these coordinates.
 * 
 * Like the words "Let there be a firmament," these arrays dictate the bounds 
 * of the celestial and terrestrial spheres.
 * ============================================================================
 */

export const WorldManifest = {
  sceneName: "Awtsmoos Dialogue Park",
  background: {
    skyColorTop: "#0f131a",
    skyColorBottom: "#2b3642",
    groundColor: "#0a0a0a"
  },
  camera: {
    zoom: 1.1,
    y: 140,
    x: 0
  },
  timeOfDay: 0.8,
  mountains: [
    { x: -4000, y: 0, w: 3000, h: 1200, color: "#1a1e24" },
    { x: -1000, y: 0, w: 2500, h: 900, color: "#222" },
    { x: 1500, y: 0, w: 3500, h: 1000, color: "#2b3642" }
  ],
  buildings: [
    { type: "skyscraper", x: -2500, y: 0, w: 350, h: 1100, color: "#14181a" },
    { type: "skyscraper", x: -1800, y: 0, w: 400, h: 1400, color: "#1a1e22" },
    { type: "skyscraper", x: -1000, y: 0, w: 280, h: 800, color: "#0d1114" },
    { type: "building", x: -500, y: 0, w: 300, h: 500, color: "#111" },
    { type: "skyscraper", x: 200, y: 0, w: 450, h: 1200, color: "#1a1e22" },
    { type: "skyscraper", x: 1000, y: 0, w: 350, h: 950, color: "#0d1114" },
    { type: "skyscraper", x: 1800, y: 0, w: 300, h: 1000, color: "#111" },
    { type: "skyscraper", x: 2400, y: 0, w: 450, h: 1500, color: "#14181a" }
  ],
  foliage: [
    { type: "tree", x: -1200, y: 20, size: 150 },
    { type: "tree", x: -800, y: 20, size: 220 },
    { type: "tree", x: 800, y: 20, size: 250 },
    { type: "tree", x: 1400, y: 20, size: 180 },
    { type: "bush", x: -500, y: 10, size: 80 },
    { type: "bush", x: -400, y: 15, size: 60 },
    { type: "bush", x: 550, y: 10, size: 75 },
    { type: "bush", x: -100, y: -15, size: 40 }
  ],
  props: [
    { type: "bench", x: 0, y: 10, scale: 1.1 },
    { type: "bench", x: -950, y: 10, scale: 1 },
    { type: "bench", x: 1100, y: 10, scale: 1.1 },
    { type: "lamp", x: -300, y: 10, scale: 1.3, isOn: true },
    { type: "lamp", x: 300, y: 10, scale: 1.3, isOn: true },
    { type: "lamp", x: -650, y: 10, scale: 1.3, isOn: true },
    { type: "lamp", x: 750, y: 10, scale: 1.3, isOn: true },
    { type: "lamp", x: -1150, y: 10, scale: 1.3, isOn: true },
    { type: "lamp", x: 1350, y: 10, scale: 1.3, isOn: true },
    { type: "trashcan", x: 420, y: 0, scale: 1.3 },
    { type: "trashcan", x: -450, y: 5, scale: 1.1 },
    { type: "pigeon", x: 100, y: 5, scale: 1.5, flipX: true },
    { type: "pigeon", x: 140, y: 8, scale: 1.3 },
    { type: "pigeon", x: -150, y: -2, scale: 1.4 },
    { type: "cup", x: -80, y: 0, scale: 0.6 },
    { type: "fireHydrant", x: -530, y: 15, scale: 1.3 },
    { type: "fireHydrant", x: 920, y: 15, scale: 1.3 },
    { type: "newspaperBox", x: -600, y: 5, scale: 1.2 },
    { type: "hotdogCart", x: 520, y: 0, scale: 1.5 },
    { type: "fence", x: -800, y: 0, scale: 1, w: 400 },
    { type: "fence", x: 800, y: 0, scale: 1, w: 400 },
    { type: "parkSign", x: -150, y: 0, scale: 1.2 }
  ]
};
