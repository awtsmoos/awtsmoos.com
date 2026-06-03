// B"H
/**
 * @file VillageTreeField.js
 * @description
 * Chapter 240: The forest stops pretending and borrows the true tree soul.
 *
 * Each field now uses the existing procedural-core TreeGenerator to create real
 * branch/trunk geometry and real leaf quad geometry once, then instances those
 * generated trees many times. Leaves receive an alpha DataTexture, so their
 * rectangular backgrounds vanish. Future AI: trees are visual only; do not add
 * these generated branches or leaves to the octree.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { TreeGenerator } from "../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const rand = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const attr = (values, itemSize) => new THREE.BufferAttribute(new Float32Array(values || []), itemSize);
const idx = values => new THREE.BufferAttribute((Math.max(...values) > 65535 ? new Uint32Array(values) : new Uint16Array(values)), 1);

function rgb(values = []) { const out = []; for (let i = 0; i < values.length; i += 4) out.push(values[i], values[i + 1], values[i + 2]); return out; }
function geometryFrom(data, colors = false) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", attr(data.verts, 3));
  if (data.normals?.length) geo.setAttribute("normal", attr(data.normals, 3));
  if (data.uvs?.length) geo.setAttribute("uv", attr(data.uvs, 2));
  if (colors && data.colors?.length) geo.setAttribute("color", attr(rgb(data.colors), 3));
  if (data.indices?.length) geo.setIndex(idx(data.indices));
  if (!data.normals?.length) geo.computeVertexNormals();
  geo.computeBoundingSphere(); return geo;
}
function leafAlphaTexture() {
  const size = 32, data = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const dx = (x - 16) / 15, dy = (y - 16) / 15;
    data[y * size + x] = Math.hypot(dx * 0.72, dy * 1.22) < 0.88 ? 255 : 0;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.AlphaFormat);
  tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.needsUpdate = true; return tex;
}
function config(seed) {
  return { name: "instanced_village_oak", seed, type: "deciduous", bark: { type: "oak", tint: 0xffffff }, branch: {
    levels: 3, angle: { 1: 54, 2: 48, 3: 30 }, children: { 0: 4, 1: 3, 2: 2 }, force: { direction: { x: 0.02, y: 1, z: 0.01 }, strength: -0.008 },
    gnarliness: { 0: 0.06, 1: 0.16, 2: 0.22, 3: 0.08 }, length: { 0: 6.8, 1: 3.2, 2: 1.7, 3: 0.8 }, radius: { 0: 0.46, 1: 0.18, 2: 0.08, 3: 0.035 },
    sections: { 0: 7, 1: 6, 2: 4, 3: 3 }, segments: { 0: 5, 1: 4, 2: 3, 3: 2 }, start: { 1: 0.35, 2: 0.18, 3: 0.1 }, taper: { 0: 0.66, 1: 0.62, 2: 0.6, 3: 0.5 }, twist: { 0: 0, 1: 0.08, 2: 0.1, 3: 0 }
  }, leaves: { type: "leaf_oak", count: 18, size: 0.42, sizeVariance: 0.5, tint: [0.22, 0.56, 0.16, 1] } };
}
function mark(root) { root.traverse(o => Object.assign(o.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true })); }
function set(mesh, i, p, q, s) { mesh.setMatrixAt(i, new THREE.Matrix4().compose(p, q, s)); }

export default class VillageTreeField extends Domem {
  type = "villageTreeField";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; }
  async heescheel(olam) {
    const count = Math.max(1, Math.floor(n(this.options.count, 80))), radius = n(this.options.radius, 90), seed = n(this.options.seed, 5);
    const generated = new TreeGenerator(config(seed)).generate();
    const trunks = new THREE.InstancedMesh(geometryFrom(generated.branches), new THREE.MeshLambertMaterial({ color: this.options.barkColor || 0x5a371d }), count);
    const leaves = new THREE.InstancedMesh(geometryFrom(generated.leaves, true), new THREE.MeshLambertMaterial({ vertexColors: true, alphaMap: leafAlphaTexture(), transparent: true, alphaTest: 0.42, side: THREE.DoubleSide, depthWrite: false }), count);
    trunks.name = "tree_field_real_generated_branches_no_collision"; leaves.name = "tree_field_generated_transparent_leaves_no_collision";
    for (let i = 0; i < count; i += 1) {
      const a = i * 2.399 + seed, r = radius * Math.sqrt(rand(i + seed)), sc = 0.78 + rand(i * 5) * 0.82;
      const p = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r * 0.72), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)), s = new THREE.Vector3(sc, sc, sc);
      set(trunks, i, p, q, s); set(leaves, i, p, q, s);
    }
    trunks.instanceMatrix.needsUpdate = leaves.instanceMatrix.needsUpdate = true;
    this.mesh = new THREE.Group(); this.mesh.name = this.name || "VillageTreeField"; this.mesh.add(trunks, leaves);
    const p = this.position || {}; this.mesh.position.set(n(p.x), n(p.y), n(p.z)); mark(this.mesh);
    await olam.hoyseef(this); this.isReady = true;
  }
}
