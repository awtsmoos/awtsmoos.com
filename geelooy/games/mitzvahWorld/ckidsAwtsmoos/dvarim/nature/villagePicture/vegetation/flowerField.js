// B"H
/**
 * @file flowerField.js
 * @description
 * Chapter 246: Flowers become crossed petals instead of little blocks.
 *
 * Stems are thin instanced boxes. Blossoms are two crossed transparent RGBA
 * petal cards, so fields read as meadow flowers on mobile without colliders or
 * per-flower Object3D cost. No AlphaFormat, no cubes pretending to be flowers.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { PICTURE_COLORS as C } from "../palette.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const wave = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

function petalTexture(color) {
  const size = 32, data = new Uint8Array(size * size * 4);
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const dx = (x - 16) / 15, dy = (y - 16) / 15;
    const petal = Math.min(Math.hypot(dx - 0.32, dy), Math.hypot(dx + 0.32, dy), Math.hypot(dx, dy - 0.32), Math.hypot(dx, dy + 0.32));
    const center = Math.hypot(dx, dy) < 0.22;
    const inside = petal < 0.34 || center;
    const i = (y * size + x) * 4;
    data[i] = center ? 245 : r; data[i + 1] = center ? 210 : g; data[i + 2] = center ? 58 : b; data[i + 3] = inside ? 255 : 0;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
function setInstance(mesh, i, p, s, yaw = 0) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(...s));
  mesh.setMatrixAt(i, m);
}
function flowerMaterial(color) {
  return new THREE.MeshLambertMaterial({ map: petalTexture(color), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: false });
}

export function instancedFlowerField(options = {}) {
  const count = Math.max(1, Math.floor(n(options.count, 80)));
  const radius = n(options.radius, 2.4), seed = n(options.seed, 1);
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x2f8d3e });
  const color = options.color || (seed % 2 ? C.pinkFlower : C.yellowFlower);
  const stems = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stemMat, count);
  const petalsA = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flowerMaterial(color), count);
  const petalsB = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flowerMaterial(color === C.pinkFlower ? C.yellowFlower : C.pinkFlower), count);
  stems.name = "meadow_flower_stems_visual_only";
  petalsA.name = "meadow_flower_cross_petals_a_visual_only";
  petalsB.name = "meadow_flower_cross_petals_b_visual_only";
  for (let i = 0; i < count; i += 1) {
    const a = i * 2.399 + seed, r = radius * Math.sqrt(Math.abs(wave(i + seed)));
    const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.72;
    const h = 0.14 + Math.abs(wave(i * 3 + seed)) * 0.16;
    const bloom = 0.16 + Math.abs(wave(i * 7 + seed)) * 0.08;
    setInstance(stems, i, [x, h / 2, z], [0.014, h, 0.014], a);
    setInstance(petalsA, i, [x, h + 0.04, z], [bloom, bloom, bloom], a);
    setInstance(petalsB, i, [x, h + 0.043, z], [bloom, bloom, bloom], a + Math.PI / 2);
  }
  stems.instanceMatrix.needsUpdate = petalsA.instanceMatrix.needsUpdate = petalsB.instanceMatrix.needsUpdate = true;
  group.add(stems, petalsA, petalsB);
  group.traverse(o => Object.assign(o.userData ||= {}, { vegetationVisualOnly: true, physics: "none", skipOctree: true, noOctree: true, skipRaycast: true }));
  return group;
}
