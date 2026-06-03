// B"H
/**
 * @file rockField.js
 * @description
 * Chapter 224: small stones gather without burdening the world.
 * Decorative instanced rocks make the village feel lived-in, but they do not
 * enter collision. The Awtsmoos separates beauty from blockage.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { geometry, material } from "../geometryKit.js";
import { PICTURE_COLORS as C } from "../palette.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const pulse = i => Math.abs(Math.sin(i * 71.17 + 3.13));

/** @param {object} options scatter controls. */
export function instancedRockField(options = {}) {
  const count = Math.max(1, Math.floor(n(options.count, 36)));
  const radius = n(options.radius, 5.2), seed = n(options.seed, 2);
  const mesh = new THREE.InstancedMesh(geometry("icosphere"), material(C.rock, { textureMode: "stone" }), count);
  mesh.name = "instanced_rock_field_visual_only";
  for (let i = 0; i < count; i += 1) {
    const a = i * 2.17 + seed, r = radius * Math.sqrt(pulse(i + seed));
    const p = new THREE.Vector3(Math.cos(a) * r, 0.08, Math.sin(a) * r * 0.78);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pulse(i) * 0.5, a, pulse(i + 4) * 0.35));
    const s = 0.12 + pulse(i + 8) * 0.28;
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(s * 1.4, s * 0.55, s));
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  Object.assign(mesh.userData ||= {}, { rockFieldVisualOnly: true, physics: "none" });
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}
