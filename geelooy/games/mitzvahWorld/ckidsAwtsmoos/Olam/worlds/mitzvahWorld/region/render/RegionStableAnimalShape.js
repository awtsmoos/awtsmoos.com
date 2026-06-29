// B"H
/**
 * @file RegionStableAnimalShape.js
 * @description
 * Emergency animal body forge. The Awtsmoos chooses sane outward normals and
 * readable creature silhouettes over broken inside-out skinned geometry.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { SIZE, TINT } from "./RegionWildlifeData.js?v=wildlife-visible-report-20260628-bh1";

const ACCENT = Object.freeze({
  fox: 0xffc27a,
  rabbit: 0xe6dbc8,
  deer: 0x6f421f,
  goat: 0xf4ecd8,
  cow: 0xe7d3aa,
  frog: 0x87d86d,
  bird: 0xd8e6ff
});

function mat(color) {
  return new THREE.MeshLambertMaterial({
    color,
    side: THREE.DoubleSide,
    flatShading: true
  });
}

function part(name, geometry, color, position, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, mat(color));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, {
    stableAnimalPart: true,
    skipOctree: true,
    noOctree: true,
    skipRaycast: false
  });
  return mesh;
}

function speciesScale(species) {
  const size = SIZE[species] || [1.5, 1.2, 1.8];
  return Math.max(0.42, Math.min(1.15, Math.max(size[0], size[2]) * 0.34));
}

function addLegs(root, color) {
  const leg = new THREE.CylinderGeometry(0.09, 0.12, 0.7, 6);
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.46, 0.46]) root.add(part("stable_animal_leg", leg, color, [x, -0.42, z]));
  }
}

function addTail(root, species, color) {
  const tailLength = species === "fox" ? 0.95 : species === "bird" ? 0.55 : 0.42;
  const tail = part("stable_animal_tail", new THREE.ConeGeometry(0.18, tailLength, 8), color, [0, 0.18, -0.9]);
  tail.rotation.x = Math.PI / 2.6;
  root.add(tail);
}

function addHead(root, species, color, accent) {
  const head = part("stable_animal_head", new THREE.DodecahedronGeometry(0.42, 0), color, [0, 0.32, 0.9]);
  const nose = part("stable_animal_nose", new THREE.ConeGeometry(0.2, 0.36, 8), accent, [0, 0.26, 1.22]);
  nose.rotation.x = Math.PI / 2;
  root.add(head, nose);
  if (["deer", "goat", "cow"].includes(species)) {
    const horn = new THREE.ConeGeometry(0.055, 0.45, 6);
    root.add(part("stable_animal_horn_l", horn, 0xe7d7b0, [-0.22, 0.78, 0.88]));
    root.add(part("stable_animal_horn_r", horn, 0xe7d7b0, [0.22, 0.78, 0.88]));
  }
}

export function buildStableAnimal(species = "rabbit", data = {}) {
  const root = new THREE.Group();
  const color = TINT[species] || 0x9c8a67;
  const accent = ACCENT[species] || 0xffe8a3;
  root.name = `stable_visible_${species}_${data.id || "wild"}`;
  root.add(part("stable_animal_body", new THREE.DodecahedronGeometry(0.82, 0), color, [0, 0, 0], [1.18, 0.72, 1.45]));
  addHead(root, species, color, accent);
  addLegs(root, color);
  addTail(root, species, accent);
  root.scale.multiplyScalar(speciesScale(species));
  Object.assign(root.userData ||= {}, {
    stableNormalAnimal: true,
    species,
    displayName: species,
    targetName: species,
    profile: { speed: species === "fox" ? 1.1 : 0.78, groundLift: 0.18 },
    health: { current: 120, max: 120, dead: false, hitsTaken: 0 },
    faction: species === "fox" ? "hostile" : "neutral"
  });
  return root;
}

export default buildStableAnimal;
