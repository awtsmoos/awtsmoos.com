// B"H
/**
 * @file VillageAnimalFactory.js
 * @description Chapter 712: the toy oval is torn open into anatomy.
 * The Awtsmoos gives every creature a readable vessel: rib cage, hips, neck,
 * muzzle, ears, paws, tail, eyes, and named rig roots. These are still humble
 * procedural meshes, but no longer anonymous potatoes pacing the meadow.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const speciesDefaults = {
  fox: { primary: 0xb65a22, accent: 0xf3d39b, dark: 0x17120f, white: 0xfff0c7, scale: 1.0 },
  wolf: { primary: 0x6f7477, accent: 0xc4c7bf, dark: 0x1a1c1e, white: 0xd8d8cf, scale: 1.12 },
  ram: { primary: 0x9b805a, accent: 0xe6d2a6, dark: 0x211814, white: 0xf0e4ca, scale: 1.08 },
  stag: { primary: 0x8b5a34, accent: 0xd9c28f, dark: 0x17110b, white: 0xf1ddbd, scale: 1.18 }
};
const up = new THREE.Vector3(0, 1, 0);

function mat(color, emissive = 0x000000) { return new THREE.MeshLambertMaterial({ color, emissive }); }
function mesh(geo, material, name, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, material); m.name = name;
  m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot);
  return m;
}
function sphere(name, material, pos, scale, segments = [12, 8]) { return mesh(new THREE.SphereGeometry(1, ...segments), material, name, pos, scale); }
function cone(name, material, pos, scale, rot = [0, 0, 0]) { return mesh(new THREE.ConeGeometry(0.5, 1, 8), material, name, pos, scale, rot); }
function cyl(name, material, pos, scale, rot = [0, 0, 0]) { return mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 8), material, name, pos, scale, rot); }
function segment(name, material, from, to, radius) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const mid = new THREE.Vector3(...from).add(new THREE.Vector3(...to)).multiplyScalar(0.5);
  const m = cyl(name, material, [0, 0, 0], [radius, dir.length(), radius]);
  m.position.copy(mid); m.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  return m;
}
function add(root, parts, key, object) { parts[key] ||= []; parts[key].push(object); root.add(object); return object; }
function makeRoot(name) { const root = new THREE.Group(); root.name = name; return root; }

function fourLegs(root, parts, darkMat, scale = 1) {
  const zPairs = [-0.62, 0.62], xPairs = [-0.32, 0.32];
  zPairs.forEach((z, zi) => xPairs.forEach(x => {
    const upper = segment(`leg_upper_${x}_${z}`, darkMat, [x, 0.78, z], [x * 1.03, 0.35, z + (zi ? 0.04 : -0.04)], 0.075 * scale);
    const lower = segment(`leg_lower_${x}_${z}`, darkMat, [x * 1.03, 0.35, z], [x * 1.08, 0.08, z + 0.07], 0.06 * scale);
    const paw = sphere(`paw_${x}_${z}`, darkMat, [x * 1.08, 0.035, z + 0.13], [0.13 * scale, 0.055 * scale, 0.24 * scale], [8, 6]);
    add(root, parts, "legs", upper); add(root, parts, "legs", lower); add(root, parts, "paws", paw);
  }));
}
function eyes(root, parts, darkMat, y = 1.15) {
  [-0.115, 0.115].forEach(x => add(root, parts, "eyes", sphere(`eye_${x}`, darkMat, [x, y, 1.28], [0.035, 0.042, 0.024], [8, 6])));
}
function tail(root, parts, primaryMat, whiteMat, length = 1.2, lift = 0.2) {
  const tailRoot = makeRoot("tailRoot"); tailRoot.position.set(0, 0.76, -0.92); root.add(tailRoot); parts.tailRoot = tailRoot;
  tailRoot.add(segment("tail_base", primaryMat, [0, 0, 0], [0.08, lift, -length * 0.55], 0.18));
  tailRoot.add(segment("tail_mid", primaryMat, [0.08, lift, -length * 0.55], [0.18, lift + 0.08, -length], 0.15));
  tailRoot.add(cone("tail_white_tip", whiteMat, [0.2, lift + 0.1, -length - 0.16], [0.24, 0.42, 0.24], [Math.PI / 2.8, 0, 0]));
}
function foxLike(root, parts, colors, species) {
  const primaryMat = mat(colors.primary), accentMat = mat(colors.accent), darkMat = mat(colors.dark), whiteMat = mat(colors.white);
  add(root, parts, "body", sphere("rib_cage_long_low", primaryMat, [0, 0.78, 0.05], [0.43, 0.38, 0.92]));
  add(root, parts, "body", sphere("lean_hips", primaryMat, [0, 0.72, -0.62], [0.36, 0.32, 0.48]));
  add(root, parts, "chest", sphere("pale_chest", whiteMat, [0, 0.82, 0.58], [0.28, 0.24, 0.28]));
  const headRoot = makeRoot("headRoot"); headRoot.position.set(0, 1.05, 0.98); root.add(headRoot); parts.headRoot = headRoot;
  headRoot.add(sphere("angular_head", primaryMat, [0, 0, 0], [0.28, 0.22, 0.31]));
  headRoot.add(cone("pointed_muzzle", accentMat, [0, -0.03, 0.34], [0.22, 0.5, 0.18], [Math.PI / 2, 0, 0]));
  headRoot.add(sphere("dark_nose", darkMat, [0, -0.03, 0.62], [0.055, 0.04, 0.035], [8, 6]));
  [-0.19, 0.19].forEach(x => headRoot.add(cone(`knife_ear_${x}`, primaryMat, [x, 0.36, -0.06], [0.22, 0.5, 0.16], [0, 0, x < 0 ? 0.22 : -0.22])));
  eyes(headRoot, parts, darkMat, 0.08); fourLegs(root, parts, darkMat, species === "wolf" ? 1.14 : 1);
  tail(root, parts, primaryMat, whiteMat, species === "wolf" ? 0.95 : 1.32, species === "wolf" ? 0.02 : 0.24);
}
function horned(root, parts, colors, species) {
  const primaryMat = mat(colors.primary), accentMat = mat(colors.accent), darkMat = mat(colors.dark), whiteMat = mat(colors.white);
  add(root, parts, "body", sphere("barrel_body", primaryMat, [0, 0.9, 0], [0.52, 0.48, 0.88]));
  add(root, parts, "chest", sphere("strong_chest", primaryMat, [0, 1.0, 0.58], [0.46, 0.48, 0.48]));
  const headRoot = makeRoot("headRoot"); headRoot.position.set(0, 1.38, 0.95); root.add(headRoot); parts.headRoot = headRoot;
  headRoot.add(sphere("head", primaryMat, [0, 0, 0], [0.28, 0.3, 0.34]));
  headRoot.add(cone("muzzle", whiteMat, [0, -0.05, 0.38], [0.24, 0.42, 0.22], [Math.PI / 2, 0, 0]));
  if (species === "ram") [-0.32, 0.32].forEach(x => headRoot.add(mesh(new THREE.TorusGeometry(0.26, 0.045, 8, 18, Math.PI * 1.55), accentMat, `curl_horn_${x}`, [x, 0.03, -0.03], [1, 1, 0.62], [Math.PI / 2, 0, x < 0 ? 0.45 : -0.45])));
  else [-0.22, 0.22].forEach(x => { headRoot.add(segment(`antler_main_${x}`, accentMat, [x, 0.18, -0.04], [x * 1.7, 0.86, -0.12], 0.045)); headRoot.add(segment(`antler_branch_${x}`, accentMat, [x * 1.45, 0.56, -0.1], [x * 2.2, 0.78, -0.28], 0.035)); });
  eyes(headRoot, parts, darkMat, 0.03); fourLegs(root, parts, darkMat, 1.12); tail(root, parts, primaryMat, whiteMat, 0.38, 0.04);
}

/** @param {object} definition Animal definition. @param {object} owner Runtime owner. @returns {THREE.Group} Named procedural animal rig. */
export function createVillageAnimal(definition = {}, owner) {
  const species = definition.species || "fox";
  const colors = { ...speciesDefaults[species] || speciesDefaults.fox, ...definition };
  const root = new THREE.Group(); root.name = `${species}_realistic_rig`; root.userData.rigParts = {}; root.nivraAwtsmoos = owner;
  if (species === "ram" || species === "stag") horned(root, root.userData.rigParts, colors, species);
  else foxLike(root, root.userData.rigParts, colors, species);
  const scale = Number(definition.visualScale || colors.scale || 1); root.scale.setScalar(scale); root.rotation.y = Math.PI;
  root.traverse(child => { child.nivraAwtsmoos = owner; child.castShadow = false; child.receiveShadow = true; Object.assign(child.userData ||= {}, { isVillageWildlifePart: true, skipOctree: true, noOctree: true }); });
  return root;
}

/** @param {THREE.Object3D} root Animal root. */
export function disposeVillageAnimal(root) { root?.traverse?.(child => { child.geometry?.dispose?.(); child.material?.dispose?.(); }); root?.removeFromParent?.(); }
