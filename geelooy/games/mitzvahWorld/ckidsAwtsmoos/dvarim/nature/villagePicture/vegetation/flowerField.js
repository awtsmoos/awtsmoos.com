// B"H
/**
 * @file flowerField.js
 * @description
 * Chapter 223: flowers stop being cubes and become quick little sparks.
 * The Awtsmoos scatters petals as instanced meshes: one stem geometry, one
 * blossom geometry, many matrices. They are sight only, never collision.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { material } from "../geometryKit.js";
import { PICTURE_COLORS as C } from "../palette.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const wave = i => Math.sin(i * 12.9898) * 43758.5453 % 1;

function setInstance(mesh, i, p, s, yaw = 0) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(...s));
  mesh.setMatrixAt(i, m);
}

/**
 * Builds fast decorative flowers without per-flower Object3D overhead.
 * @param {object} options count/radius/seed controls.
 * @returns {THREE.Group} visual-only flowers.
 */
export function instancedFlowerField(options = {}) {
  const count = Math.max(1, Math.floor(n(options.count, 44)));
  const radius = n(options.radius, 1.8), seed = n(options.seed, 1);
  const group = new THREE.Group();
  const stems = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material(0x2f9b4f, { textureMode: "cloth" }), count);
  const blossoms = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material(C.pinkFlower, { textureMode: "cloth", side: THREE.DoubleSide }), count);
  stems.name = "instanced_flower_stems_visual_only";
  blossoms.name = "instanced_flower_blossoms_visual_only";
  for (let i = 0; i < count; i += 1) {
    const a = i * 2.399 + seed, r = radius * Math.sqrt(Math.abs(wave(i + seed)));
    const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.72;
    const h = 0.08 + Math.abs(wave(i * 3 + seed)) * 0.12;
    setInstance(stems, i, [x, h / 2, z], [0.018, h, 0.018], a);
    setInstance(blossoms, i, [x, h + 0.035, z], [0.11, 0.11, 0.11], a);
  }
  stems.instanceMatrix.needsUpdate = blossoms.instanceMatrix.needsUpdate = true;
  group.add(stems, blossoms);
  Object.assign(group.userData ||= {}, { vegetationVisualOnly: true, physics: "none" });
  return group;
}
