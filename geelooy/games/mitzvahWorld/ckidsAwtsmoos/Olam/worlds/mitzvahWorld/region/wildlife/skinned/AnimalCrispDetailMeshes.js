// B"H
/**
 * @file AnimalCrispDetailMeshes.js
 * @description Small low-poly anatomical meshes for close animal readability.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const EYELID = new THREE.BoxGeometry(.12, .018, .028);
const NOSTRIL = new THREE.SphereGeometry(.022, 8, 6);
const JAW = new THREE.BoxGeometry(.18, .026, .045);
const TOE = new THREE.ConeGeometry(.025, .09, 6);
const HOOF_SPLIT = new THREE.BoxGeometry(.018, .038, .09);
const BEARD_STRAND = new THREE.ConeGeometry(.035, .24, 6);
const MANE_STRIP = new THREE.BoxGeometry(.055, .18, .08);
const WATTLE = new THREE.SphereGeometry(.045, 8, 6);
const FEATHER = new THREE.BoxGeometry(.05, .012, .18);

/**
 * Creates a sealed child detail mesh through the factory API so material
 * caching, octree flags, and selection inheritance stay consistent.
 */
function detail(make, kind, geo, color, pos, scale, rot) {
  return make(kind, geo, color, pos, scale, rot);
}

/** Adds eyelids, nostrils, and a jaw edge to make the head read as anatomy. */
function faceDetails(root, p, api) {
  const y = p.height * 1.18;
  const z = p.body.torso[2] * .92 + p.body.snout[2] * .78;
  const x = p.body.head[0] * .3;

  for (const side of [-1, 1]) {
    api.seal(root, detail(api.make, "eyelid", EYELID, 0x2b160f, [side * x, y + .035, z - .02], [1, 1, 1], [0, 0, side * .08]));
    api.seal(root, detail(api.make, "nostril", NOSTRIL, 0x090403, [side * p.body.snout[0] * .36, y - .08, z + p.body.snout[2] * .2], [1, .65, 1], [0, 0, 0]));
  }

  api.seal(root, detail(api.make, "jawline", JAW, 0x2a170f, [0, y - .16, z + .04], [Math.max(.9, p.body.head[0] * 2.4), 1, 1], [0, 0, 0]));
}

/** Splits hoofed feet and adds simple toes for paw/claw animals. */
function footDetails(root, species, p, api) {
  const hoofed = ["deer", "goat", "cow"].includes(species);
  const color = hoofed ? 0x11100d : 0x20140f;
  const y = Math.max(.06, p.height * .08);

  for (const side of [-1, 1]) for (const zSide of [-1, 1]) {
    const x = side * p.legs.stanceX;
    const z = zSide * p.legs.stanceZ;

    if (hoofed) {
      api.seal(root, detail(api.make, "splitHoof", HOOF_SPLIT, color, [x - side * .022, y, z + .08], [1, 1, 1], [0, side * .08, 0]));
      api.seal(root, detail(api.make, "splitHoof", HOOF_SPLIT, color, [x + side * .022, y, z + .08], [1, 1, 1], [0, -side * .08, 0]));
    } else {
      for (const toe of [-1, 0, 1]) api.seal(root, detail(api.make, "toe", TOE, color, [x + toe * .04, y, z + .12], [1, 1, 1], [Math.PI / 2, 0, 0]));
    }
  }
}

/** Adds cheap species-specific silhouette cues without procedural textures. */
function speciesDetails(root, species, p, api) {
  if (p.markings?.beard || species === "goat") {
    for (const offset of [-.055, 0, .055]) api.seal(root, detail(api.make, "beardStrand", BEARD_STRAND, 0xd8ceb1, [offset, p.height * .92, p.body.torso[2] * 1.18], [1, 1, 1], [Math.PI, 0, 0]));
  }

  if (species === "boar" || species === "deer") {
    for (let i = 0; i < 5; i += 1) api.seal(root, detail(api.make, "maneRidge", MANE_STRIP, 0x2b1b16, [0, p.height * (1.18 - i * .075), p.body.torso[2] * (.42 - i * .1)], [1, 1, 1], [0, 0, 0]));
  }

  if (species === "chicken") {
    api.seal(root, detail(api.make, "wattle", WATTLE, 0xc91520, [0, p.height * 1.12, p.body.torso[2] * 1.08], [1, 1.35, .8], [0, 0, 0]));
  }

  if (species === "bird" || species === "chicken") {
    for (const side of [-1, 1]) for (let i = 0; i < 4; i += 1) api.seal(root, detail(api.make, "featherEdge", FEATHER, 0xd7cf94, [side * (.28 + i * .045), p.height * .78, -i * .08], [1, 1, 1], [0, side * .18, side * .18]));
  }
}

/**
 * Adds near-camera anatomical detail meshes. These are intentionally primitive
 * meshes: the win is silhouette and readable body parts, not texture work.
 */
export function addCrispAnimalDetailMeshes(root, species, profile, api) {
  if (!root || !profile || !api?.make || !api?.seal) return 0;
  const before = root.children?.length || 0;

  faceDetails(root, profile, api);
  footDetails(root, species, profile, api);
  speciesDetails(root, species, profile, api);

  const added = (root.children?.length || 0) - before;
  root.userData.crispAnatomyDetailMeshes = added;
  root.userData.crispAnatomyDetailKinds = "eyelids,nostrils,jaw,toes,hooves,beard,mane,wattle,featherEdges";
  return added;
}
