// B"H
/**
 * @file VillageAnimalFactory.js
 * @description Chapter 711: the meadow animals receive readable bone and form.
 * Shared merged geometry gives fox, wolf, ram, and stag distinct silhouettes
 * while three draw calls per creature guard the village frame budget.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { mergeGeometries } from "/games/scripts/jsm/utils/BufferGeometryUtils.js";

const cache = new Map();
const up = new THREE.Vector3(0, 1, 0);
const primitives = {
  body: new THREE.SphereGeometry(1, 10, 7),
  box: new THREE.BoxGeometry(1, 1, 1),
  cone: new THREE.ConeGeometry(0.5, 1, 7),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 7),
  torus: new THREE.TorusGeometry(0.5, 0.12, 6, 12, Math.PI * 1.35)
};

/** @param {THREE.BufferGeometry} geometry Source. @param {number[]} position XYZ. @param {number[]} scale XYZ. @param {number[]} rotation XYZ. @returns {THREE.BufferGeometry} Transformed clone. */
function part(geometry, position, scale, rotation = [0, 0, 0]) {
  const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale));
  return geometry.clone().applyMatrix4(matrix);
}

/** @param {THREE.Vector3} from Segment start. @param {THREE.Vector3} to Segment end. @param {number} radius Radius. @returns {THREE.BufferGeometry} Limb geometry. */
function segment(from, to, radius) {
  const direction = to.clone().sub(from), midpoint = from.clone().add(to).multiplyScalar(0.5);
  const geometry = primitives.cylinder.clone();
  geometry.applyMatrix4(new THREE.Matrix4().compose(midpoint, new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize()), new THREE.Vector3(radius, direction.length(), radius)));
  return geometry;
}

function common(primary, accent, dark, longBody = 1) {
  primary.push(part(primitives.body, [0, 0.78, 0], [0.62, 0.58, 1.16 * longBody]));
  primary.push(part(primitives.body, [0, 0.93, 0.72], [0.48, 0.5, 0.62]));
  [[-0.38, -0.58], [0.38, -0.58], [-0.38, 0.58], [0.38, 0.58]].forEach(([x, z]) => {
    primary.push(part(primitives.cylinder, [x, 0.34, z], [0.14, 0.62, 0.14]));
    dark.push(part(primitives.body, [x, 0.06, z + 0.08], [0.18, 0.1, 0.28]));
  });
  dark.push(part(primitives.body, [0, 1.04, 1.24], [0.12, 0.1, 0.12]));
  [-0.18, 0.18].forEach(x => dark.push(part(primitives.body, [x, 1.2, 1.04], [0.045, 0.06, 0.04])));
  accent.push(part(primitives.body, [0, 0.77, 0.48], [0.48, 0.42, 0.45]));
}

function fox(primary, accent, dark) {
  common(primary, accent, dark, 1.04);
  accent.push(part(primitives.body, [0, 1.02, 1.15], [0.3, 0.25, 0.52]));
  [-0.27, 0.27].forEach(x => primary.push(part(primitives.cone, [x, 1.57, 0.86], [0.25, 0.58, 0.2], [0, 0, x < 0 ? 0.16 : -0.16])));
  primary.push(segment(new THREE.Vector3(0, 0.8, -0.95), new THREE.Vector3(0.08, 1.15, -1.72), 0.3));
  accent.push(part(primitives.cone, [0.1, 1.25, -1.92], [0.44, 0.82, 0.44], [Math.PI / 2.8, 0, 0]));
}

function wolf(primary, accent, dark) {
  common(primary, accent, dark, 1.12);
  accent.push(part(primitives.body, [0, 1.03, 1.25], [0.3, 0.24, 0.58]));
  [-0.27, 0.27].forEach(x => primary.push(part(primitives.cone, [x, 1.55, 0.86], [0.22, 0.52, 0.18], [0, 0, x < 0 ? 0.12 : -0.12])));
  primary.push(segment(new THREE.Vector3(0, 0.82, -1.0), new THREE.Vector3(0, 0.98, -1.72), 0.2));
}

function ram(primary, accent, dark) {
  common(primary, accent, dark, 0.96);
  primary.push(part(primitives.body, [0, 1.05, 0.82], [0.62, 0.62, 0.58]));
  [-0.42, 0.42].forEach((x, i) => accent.push(part(primitives.torus, [x, 1.42, 0.87], [0.7, 0.7, 0.38], [Math.PI / 2, i ? -0.45 : 0.45, i ? -0.25 : 0.25])));
  accent.push(part(primitives.body, [0, 0.83, -0.98], [0.24, 0.2, 0.34]));
}

function stag(primary, accent, dark) {
  common(primary, accent, dark, 1.08);
  primary.push(segment(new THREE.Vector3(0, 1.0, 0.7), new THREE.Vector3(0, 1.62, 1.0), 0.25));
  [-0.25, 0.25].forEach(x => {
    accent.push(segment(new THREE.Vector3(x, 1.55, 0.92), new THREE.Vector3(x * 1.5, 2.35, 0.82), 0.07));
    accent.push(segment(new THREE.Vector3(x * 1.3, 1.9, 0.87), new THREE.Vector3(x * 2.3, 2.18, 0.68), 0.055));
    accent.push(segment(new THREE.Vector3(x * 1.45, 2.12, 0.84), new THREE.Vector3(x * 2.2, 2.52, 0.72), 0.05));
  });
  accent.push(part(primitives.body, [0, 0.88, -1.08], [0.18, 0.16, 0.3]));
}

/** @param {string} species Species key. @returns {object} Shared geometry channels. */
function geometryFor(species) {
  if (cache.has(species)) return cache.get(species);
  const primary = [], accent = [], dark = [];
  ({ fox, wolf, ram, stag }[species] || fox)(primary, accent, dark);
  const result = { primary: mergeGeometries(primary), accent: mergeGeometries(accent), dark: mergeGeometries(dark) };
  Object.values(result).forEach(geometry => { geometry.computeBoundingBox(); geometry.computeBoundingSphere(); geometry.userData.sharedVillageAnimalGeometry = true; });
  cache.set(species, result); return result;
}

/** @param {object} definition Animal definition. @param {object} owner Runtime owner. @returns {THREE.Group} Recognizable low-poly animal. */
export function createVillageAnimal(definition, owner) {
  const geometry = geometryFor(definition.species || "fox"), group = new THREE.Group();
  const colors = [definition.color || 0x9a6238, definition.accent || 0xf1d09a, 0x171514];
  [geometry.primary, geometry.accent, geometry.dark].forEach((geo, index) => {
    const material = new THREE.MeshLambertMaterial({ color: colors[index], emissive: 0x000000 });
    const mesh = new THREE.Mesh(geo, material); mesh.nivraAwtsmoos = owner; group.add(mesh);
  });
  group.rotation.y = Math.PI;
  return group;
}

/** @param {THREE.Object3D} root Animal root. */
export function disposeVillageAnimal(root) { root?.traverse?.(child => child.material?.dispose?.()); root?.removeFromParent?.(); }
