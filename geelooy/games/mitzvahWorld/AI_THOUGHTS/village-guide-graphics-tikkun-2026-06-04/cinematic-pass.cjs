// B"H
/**
 * @file cinematic-pass.cjs
 * @description
 * Chapter 11: The Awtsmoos converts the screenshot into authored level data.
 * The village JSON is rewritten whole. Hero tree, cobble road, tuned lighting,
 * and density caps become data contracts instead of hidden code hacks.
 */
const fs = require("fs");
const file = "geelooy/games/mitzvahWorld/levels/ladder/data/village.json";
const level = JSON.parse(fs.readFileSync(file, "utf8"));
const niv = level.nivrayim ||= {};
const arr = key => (niv[key] ||= []);

function tuneSky() {
  const sky = arr("ProceduralSky")[0] ||= { name: "golden_screenshot_sky", position: { x: 0, y: 0, z: 0 } };
  Object.assign(sky, {
    name: "golden_hour_reference_sky_lambert",
    timeOfDay: 17.15,
    sunIntensity: 0.86,
    hemiIntensity: 1.12,
    ambientIntensity: 0.58,
    fogNear: 70,
    fogFar: 410,
    topColor: 0x8fb8df,
    bottomColor: 0xffc17a,
    horizonGlow: 0xffb35a,
    mobileLambertGrade: "warm-fable-reference"
  });
}

function addHeroTree() {
  niv.VillageHeroTree = [{
    name: "left_spawn_reference_hero_tree",
    trunkHeight: 8.8,
    limbCount: 34,
    leafCount: 620,
    crownRadius: 6.2,
    scale: 1.18,
    barkColor: 0x5a341d,
    branchColor: 0x4d2d19,
    leafColor: 0x4c9635,
    position: { x: -21, y: 0.02, z: 15 }
  }];
}

function addStonePath() {
  niv.VillageStonePath = [{
    name: "spawn_to_guide_reference_cobble_path",
    count: 118,
    width: 4.4,
    length: 42,
    y: 0.055,
    dirtX: 0,
    dirtZ: 6.4,
    rotationY: -0.62,
    stoneColor: 0xb9ad91,
    dirtColor: 0x8b6741,
    points: [[-12, 17], [-6, 10], [0, 5.5], [7, 1.2], [13, -4.5]]
  }];
}

function simplifyTreeFields() {
  const fields = arr("VillageTreeField");
  const tuned = [
    [18, 96, 8, -92],
    [16, 74, -76, 42],
    [16, 72, 88, 52]
  ];
  fields.forEach((field, i) => Object.assign(field, {
    count: tuned[i]?.[0] || 14,
    radius: tuned[i]?.[1] || 70,
    position: { x: tuned[i]?.[2] ?? field.position?.x ?? 0, y: 0, z: tuned[i]?.[3] ?? field.position?.z ?? 0 },
    leafBrightness: 1.28,
    leafMaterialMode: "background-only-after-hero-tree"
  }));
}

function tuneGuideAndSpawn() {
  const guide = arr("InteractiveNpc")[0];
  if (!guide) return;
  Object.assign(guide, {
    name: "Reference Village Level Guide",
    selectorTitle: "Choose Levels",
    beacon: true,
    beaconHeight: 4.6,
    position: { x: 10.8, y: 0.1, z: -4.4 },
    dialogue: [
      "Shalom! I guard the challenge path.",
      "Tap Choose Levels to see all available challenges.",
      "The village is only the beginning."
    ]
  });
}

function tuneFoliage() {
  arr("VillageGrassField").forEach((field, i) => {
    field.count = i === 0 ? 2400 : 1500;
    field.groundLift = 0.014;
    field.mobileDensityCap = true;
  });
}

function addCompositionProps() {
  const props = arr("VillagePictureProp").filter(p => !String(p.name || "").startsWith("reference_") && p.kind !== "pictureDirtPath");
  props.unshift(
    { name: "reference_path_lantern_left", kind: "lantern", position: { x: -7.8, z: 7.6 }, scale: 1.95, terrainLawGrounded: true },
    { name: "reference_house_ivy_flowers", kind: "flowerPatch", count: 96, radius: 3.2, seed: 88, position: { x: 9.5, z: -2.8 }, scale: 1.2, terrainLawGrounded: true },
    { name: "reference_tree_shadow_flowers", kind: "flowerPatch", count: 120, radius: 4.8, seed: 92, position: { x: -18, z: 11 }, scale: 1.25, terrainLawGrounded: true }
  );
  niv.VillagePictureProp = props;
}

tuneSky();
addHeroTree();
addStonePath();
simplifyTreeFields();
tuneGuideAndSpawn();
tuneFoliage();
addCompositionProps();
level.shaym = "Village_Cinematic_Lambert_Reference_Pass";
level.title = "Cinematic Lambert Village";
fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, heroTrees: niv.VillageHeroTree.length, stonePaths: niv.VillageStonePath.length, guide: niv.InteractiveNpc[0].position }, null, 2));
