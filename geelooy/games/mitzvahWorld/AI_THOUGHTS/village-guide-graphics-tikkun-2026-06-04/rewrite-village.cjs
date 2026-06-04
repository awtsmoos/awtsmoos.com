// B"H
/**
 * @file rewrite-village.cjs
 * @description
 * Chapter 3: The Awtsmoos rewrites the village scroll as one whole vessel.
 * No partial patching, no hidden incision: the full JSON is loaded, purified,
 * and written back complete so the level guide is born near spawn and the
 * mobile village stops drowning in black leaves and white fire.
 */
const fs = require("fs");
const file = "geelooy/games/mitzvahWorld/levels/ladder/data/village.json";
const level = JSON.parse(fs.readFileSync(file, "utf8"));
const niv = level.nivrayim ||= {};

const pos = (x, y, z) => ({ x, y, z });
const clone = value => JSON.parse(JSON.stringify(value));
const arr = key => (niv[key] ||= []);

function tuneSky() {
  const sky = arr("ProceduralSky")[0] ||= { name: "soft_village_sky", position: pos(0, 0, 0) };
  Object.assign(sky, {
    timeOfDay: 15.2,
    sunIntensity: 0.74,
    hemiIntensity: 1.08,
    ambientIntensity: 0.66,
    fogNear: 125,
    fogFar: 500,
    topColor: 0x86b8ff,
    bottomColor: 0xffd6a6
  });
}

function tuneTerrain() {
  const terrain = arr("ProceduralTerrain")[0];
  if (!terrain) return;
  Object.assign(terrain, {
    textureType: "safegrass",
    textureSize: 768,
    microNoise: 0.032,
    mobileTone: "warm-readable-green",
    position: { x: 0, y: -0.72, z: 0 }
  });
}

function tuneTrees() {
  const fields = arr("VillageTreeField");
  const counts = [28, 24, 24];
  const radii = [116, 88, 82];
  fields.forEach((field, index) => Object.assign(field, {
    count: counts[index] || 22,
    radius: radii[index] || 80,
    leafBrightness: 1.25,
    leafMaterialMode: "mobile-green-volume",
    groundLift: 0
  }));
}

function makeGuide(base) {
  const guide = clone(base || {});
  Object.assign(guide, {
    name: "Village Level Guide Visible From Spawn",
    opensLevelSelect: true,
    hasShop: true,
    selectorTitle: "MITZVAH LEVELS",
    proximity: 10.5,
    talkDistance: 10.5,
    height: 1.8,
    visualHeight: 1.8,
    radius: 0.5,
    visualGroundBiasY: 0,
    groundLift: 0.05,
    beacon: true,
    beaconColor: 0xffd54a,
    beaconHeight: 5.8,
    path: "https://models-3122d.web.app/chossid.glb?k=2",
    position: { x: -6.2, y: 0.08, z: 8.2 },
    rotation: { y: 0.04 },
    dialogue: [
      "Shalom! I am the level guide. Stand close and tap me to choose levels.",
      "Level 1 starts the mitzvah path. The menu also lets you buy and sell clothing.",
      "I glow near spawn now, so you should see me immediately."
    ]
  });
  return guide;
}

function tuneNpcs() {
  const npcs = arr("InteractiveNpc");
  const oldGuide = npcs.find(n => n.opensLevelSelect) || npcs[0];
  const mentor = npcs.find(n => n.name === "Main House Study Mentor");
  niv.InteractiveNpc = [makeGuide(oldGuide), mentor].filter(Boolean);
}

function addGuideProps() {
  const props = arr("VillagePictureProp").filter(p => !String(p.name || "").startsWith("spawn_guide_"));
  props.unshift(
    { name: "spawn_guide_gold_lantern_left", kind: "lantern", groundLift: 0, position: { x: -8.4, z: 8.4 }, scale: 1.75, terrainLawGrounded: true },
    { name: "spawn_guide_gold_lantern_right", kind: "lantern", groundLift: 0, position: { x: -4.0, z: 8.3 }, scale: 1.75, terrainLawGrounded: true },
    { name: "spawn_guide_clear_meadow_ring", kind: "flowerPatch", count: 48, radius: 2.4, seed: 73, groundLift: 0, position: { x: -6.2, z: 8.2 }, scale: 1.1, terrainLawGrounded: true }
  );
  niv.VillagePictureProp = props;
}

function tuneGrass() {
  arr("VillageGrassField").forEach((field, index) => {
    field.count = index === 0 ? 1500 : 1000;
    field.mobileDensityCap = true;
  });
}

tuneSky();
tuneTerrain();
tuneTrees();
tuneNpcs();
addGuideProps();
tuneGrass();
level.shaym = "Village_Guide_Visible_Mobile_Graphics_Tikkun";
level.title = "Grounded Village With Visible Guide";
fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, file, npcCount: niv.InteractiveNpc.length, guide: niv.InteractiveNpc[0].position, treeCounts: niv.VillageTreeField.map(t => t.count) }, null, 2));
