// B"H
/** AnimalParts.js — multi-part readable low-poly animals, never merged flat soup. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { animalEyeMaterial, animalLambert, softShadowMaterial } from "./AnimalMaterials.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";

const GEOM = {
  body: new THREE.DodecahedronGeometry(0.82, 0),
  head: new THREE.DodecahedronGeometry(0.42, 0),
  snout: new THREE.ConeGeometry(0.2, 0.36, 8),
  leg: new THREE.CylinderGeometry(0.09, 0.12, 0.7, 6),
  tail: new THREE.ConeGeometry(0.18, 0.7, 8),
  ear: new THREE.ConeGeometry(0.08, 0.36, 6),
  horn: new THREE.ConeGeometry(0.055, 0.45, 6),
  eye: new THREE.SphereGeometry(0.045, 8, 6),
  wing: new THREE.ConeGeometry(0.26, 0.78, 6),
  shadow: new THREE.CircleGeometry(1.05, 24)
};

function mesh(name, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const part = new THREE.Mesh(geometry, material);
  part.name = name;
  part.position.set(...position);
  part.scale.set(...scale);
  part.rotation.set(...rotation);
  part.castShadow = false;
  part.receiveShadow = true;
  Object.assign(part.userData ||= {}, { stableAnimalPart:true, skipOctree:true, noOctree:true, skipRaycast:false });
  return part;
}

function addLegs(root, profile) {
  for (const x of [-0.42, 0.42]) for (const z of [-0.46, 0.46]) {
    root.add(mesh("stable_leg", GEOM.leg, animalLambert(profile.hoofColor, "hoof"), [x, -0.42, z]));
  }
}

function addHead(root, profile) {
  root.add(mesh("stable_head", GEOM.head, animalLambert(profile.baseColor, "head"), [0, 0.32, 0.9]));
  root.add(mesh("stable_snout", GEOM.snout, animalLambert(profile.accentColor, "snout"), [0, 0.26, 1.22], [1, 1, 1], [Math.PI / 2, 0, 0]));
  root.add(mesh("stable_eye_l", GEOM.eye, animalEyeMaterial(), [-0.16, 0.44, 1.2]));
  root.add(mesh("stable_eye_r", GEOM.eye, animalEyeMaterial(), [0.16, 0.44, 1.2]));
}

function addEarsAndHorns(root, profile) {
  root.add(mesh("stable_ear_l", GEOM.ear, animalLambert(profile.baseColor, "ear"), [-0.22, 0.72, 0.82]));
  root.add(mesh("stable_ear_r", GEOM.ear, animalLambert(profile.baseColor, "ear"), [0.22, 0.72, 0.82]));
  if (!["deer", "goat", "cow"].includes(profile.species)) return;
  root.add(mesh("stable_horn_l", GEOM.horn, animalLambert(profile.hornColor, "horn"), [-0.22, 0.92, 0.88]));
  root.add(mesh("stable_horn_r", GEOM.horn, animalLambert(profile.hornColor, "horn"), [0.22, 0.92, 0.88]));
}

function addTailAndWings(root, profile) {
  const long = profile.species === "fox" ? 1.2 : profile.species === "bird" ? 0.5 : 0.48;
  root.add(mesh("stable_tail", GEOM.tail, animalLambert(profile.accentColor, "tail"), [0, 0.18, -0.96], [1, long, 1], [Math.PI / 2.6, 0, 0]));
  if (profile.species !== "bird") return;
  root.add(mesh("stable_wing_l", GEOM.wing, animalLambert(profile.accentColor, "wing"), [-0.76, 0.02, 0], [1, 0.9, 1], [0, 0, Math.PI / 2]));
  root.add(mesh("stable_wing_r", GEOM.wing, animalLambert(profile.accentColor, "wing"), [0.76, 0.02, 0], [1, 0.9, 1], [0, 0, -Math.PI / 2]));
}

export function addAnimalParts(root, profile) {
  root.add(mesh("stable_body", GEOM.body, animalLambert(profile.baseColor, "body"), [0, 0, 0], [1.18, 0.72, 1.45]));
  root.add(mesh("stable_belly", GEOM.body, animalLambert(profile.accentColor, "belly"), [0, -0.05, 0.2], [0.76, 0.42, 0.92]));
  addHead(root, profile);
  addEarsAndHorns(root, profile);
  addLegs(root, profile);
  addTailAndWings(root, profile);
  const shadow = mesh("stable_soft_shadow", GEOM.shadow, softShadowMaterial(), [0, -0.79, 0], [1.15, 0.82, 1], [-Math.PI / 2, 0, 0]);
  Object.assign(shadow.userData, { skipRaycast:true, visualOnly:true });
  root.add(shadow);
}
