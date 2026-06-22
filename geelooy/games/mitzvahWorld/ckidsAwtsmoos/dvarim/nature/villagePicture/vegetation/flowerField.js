// B"H
/**
 * @file flowerField.js
 * @description
 * Instanced crossed-petal flower field. Even tiny petal textures now reject
 * pixelated filters: ping-pong wrapping, linear sampling, and mipmaps so the
 * meadow does not become a jagged dream.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { PICTURE_COLORS as C } from "../palette.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const wave = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

function mark(object) {
  object.userData ||= {};
  Object.assign(object.userData, { vegetationVisualOnly:true, physics:"none", skipOctree:true, noOctree:true, skipRaycast:true });
}

function petalTexture(color) {
  const size = 64, data = new Uint8Array(size * size * 4);
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x - size / 2) / (size / 2 - 1), dy = (y - size / 2) / (size / 2 - 1);
    const petal = Math.min(Math.hypot(dx - .32, dy), Math.hypot(dx + .32, dy), Math.hypot(dx, dy - .32), Math.hypot(dx, dy + .32));
    const center = Math.hypot(dx, dy) < .22, inside = petal < .34 || center, i = (y * size + x) * 4;
    data[i] = center ? 245 : r; data[i + 1] = center ? 210 : g; data[i + 2] = center ? 58 : b; data[i + 3] = inside ? 255 : 0;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.MirroredRepeatWrapping; tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true; tex.repeat.set(1, 1); tex.anisotropy = 4; tex.needsUpdate = true;
  tex.userData = { awtsmoosPingPongSeamless:"flower-petal" };
  return tex;
}

function setInstance(mesh, i, p, s, yaw = 0) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  m.compose(new THREE.Vector3(p[0], p[1], p[2]), q, new THREE.Vector3(s[0], s[1], s[2]));
  mesh.setMatrixAt(i, m);
}

function flowerMaterial(color) {
  return new THREE.MeshLambertMaterial({ map:petalTexture(color), transparent:true, alphaTest:.5, side:THREE.DoubleSide, depthWrite:false });
}

export function instancedFlowerField(options = {}) {
  const count = Math.max(1, Math.floor(n(options.count, 80))), radius = n(options.radius, 2.4), seed = n(options.seed, 1);
  const group = new THREE.Group(), stemMat = new THREE.MeshLambertMaterial({ color:0x2f8d3e });
  const color = options.color || (seed % 2 ? C.pinkFlower : C.yellowFlower);
  const stems = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stemMat, count);
  const petalsA = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flowerMaterial(color), count);
  const petalsB = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flowerMaterial(color === C.pinkFlower ? C.yellowFlower : C.pinkFlower), count);
  stems.name = "meadow_flower_stems_visual_only"; petalsA.name = "meadow_flower_cross_petals_a_visual_only"; petalsB.name = "meadow_flower_cross_petals_b_visual_only";
  for (let i = 0; i < count; i++) {
    const a = i * 2.399 + seed, r = radius * Math.sqrt(Math.abs(wave(i + seed))), x = Math.cos(a) * r, z = Math.sin(a) * r * .72;
    const h = .14 + Math.abs(wave(i * 3 + seed)) * .16, bloom = .16 + Math.abs(wave(i * 7 + seed)) * .08;
    setInstance(stems, i, [x, h / 2, z], [.014, h, .014], a);
    setInstance(petalsA, i, [x, h + .04, z], [bloom, bloom, bloom], a);
    setInstance(petalsB, i, [x, h + .043, z], [bloom, bloom, bloom], a + Math.PI / 2);
  }
  stems.instanceMatrix.needsUpdate = true; petalsA.instanceMatrix.needsUpdate = true; petalsB.instanceMatrix.needsUpdate = true;
  group.add(stems, petalsA, petalsB); group.traverse(mark); return group;
}
