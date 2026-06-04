// B"H
/**
 * @file rest-cinematic-pass.cjs
 * @description
 * Chapter 19: The Awtsmoos seals the rest of the screenshot transition.
 * Backdrop and lighting are added as level data, while all file edits remain
 * complete, reusable, and testable.
 */
const fs = require("fs");
const file = "geelooy/games/mitzvahWorld/levels/ladder/data/village.json";
const level = JSON.parse(fs.readFileSync(file, "utf8"));
const niv = level.nivrayim ||= {};

niv.VillageLightingRig = [{
  name: "reference_golden_hour_lambert_rig",
  skyColor: 0xffd9a4,
  groundColor: 0x31512f,
  hemiIntensity: 0.72,
  sunColor: 0xffc27a,
  sunIntensity: 1.18,
  sunX: -24,
  sunY: 28,
  sunZ: 18,
  fogColor: 0xffc88a,
  fogNear: 75,
  fogFar: 420
}];

niv.VillageBackdrop = [{
  name: "reference_hills_and_sunset_glow",
  backColor: 0x8aa06b,
  midColor: 0x78915d,
  nearColor: 0x657a50,
  glowColor: 0xffb66a,
  glowOpacity: 0.28,
  glowX: 8,
  glowY: 16,
  glowZ: -84
}];

level.shaym = "Village_Cinematic_Lambert_Backdrop_Lighting_Pass";
level.title = "Cinematic Lambert Village With Backdrop";
fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, lighting: niv.VillageLightingRig.length, backdrop: niv.VillageBackdrop.length }, null, 2));
