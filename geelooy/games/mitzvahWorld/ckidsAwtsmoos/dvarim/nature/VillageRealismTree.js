// B"H
/**
 * @file VillageRealismTree.js
 * @description
 * Chapter 310: The single tree is also stack-safe.
 *
 * No large index array is spread into Math.max. The Awtsmoos counts indices one
 * at a time, preserving grounded standalone trees without hidden stack bombs.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { TreeGenerator } from "../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js";

const DEFAULT_CANOPY = Object.freeze({ r: 1, g: 1, b: 1, a: 1 });
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
function maxValue(values = []) { let max = 0; for (let i = 0; i < values.length; i += 1) if (values[i] > max) max = values[i]; return max; }
function attribute(values, itemSize) { return new THREE.BufferAttribute(new Float32Array(values || []), itemSize); }
function indexAttribute(indices = []) { return new THREE.BufferAttribute(maxValue(indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices), 1); }
function geometryFrom(data) { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", attribute(data.verts || [], 3)); if (data.normals?.length) geo.setAttribute("normal", attribute(data.normals, 3)); if (data.uvs?.length) geo.setAttribute("uv", attribute(data.uvs, 2)); if (data.indices?.length) geo.setIndex(indexAttribute(data.indices)); if (!data.normals?.length) geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere(); return geo; }
function markAsOnlyVision(root) { root.traverse?.(child => Object.assign(child.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true })); }
function leafTexture() { const size = 128, data = new Uint8Array(size * size * 4); for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) { const u = x / size, v = y / size, dx = (u - 0.5) * 1.8, dy = (v - 0.5) * 2.4, d = Math.hypot(dx, dy); const inside = d < 0.95, vein = Math.abs(dx + Math.sin(v * 8) * 0.03) < 0.035 && inside, gold = Math.sin(x * 9 + y * 13) > 0.82 && inside; const i = (y * size + x) * 4, glow = Math.max(0, 1 - d) * 60; data[i] = inside ? (gold ? 222 : 42 + glow + (vein ? 38 : 0)) : 0; data[i + 1] = inside ? (gold ? 186 : 128 + glow + (vein ? 40 : 0)) : 0; data[i + 2] = inside ? (gold ? 60 : 36) : 0; data[i + 3] = inside ? 255 : 0; } const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.needsUpdate = true; return tex; }
function configFor(op = {}) { const leaf = op.leafColor || DEFAULT_CANOPY; return { name: op.name || "grounded_village_realism_tree", seed: Number(op.seed || 91773), type: "deciduous", bark: { type: "oak", tint: 0xffffff }, branch: { levels: 3, angle: { 1: 52, 2: 47, 3: 34 }, children: { 0: 4, 1: 3, 2: 2 }, force: { direction: { x: 0.04, y: 1, z: 0.02 }, strength: -0.006 }, gnarliness: { 0: 0.05, 1: 0.14, 2: 0.22, 3: 0.08 }, length: { 0: 8.6, 1: 4.1, 2: 2.2, 3: 1.1 }, radius: { 0: 0.7, 1: 0.32, 2: 0.14, 3: 0.055 }, sections: { 0: 8, 1: 7, 2: 5, 3: 4 }, segments: { 0: 6, 1: 5, 2: 4, 3: 3 }, start: { 1: 0.38, 2: 0.2, 3: 0.1 }, taper: { 0: 0.66, 1: 0.62, 2: 0.58, 3: 0.5 }, twist: { 0: -0.05, 1: 0.08, 2: 0.14, 3: 0 } }, leaves: { type: "leaf_oak", count: Number(op.leafCount || 16), size: Number(op.leafSize || 0.66), sizeVariance: 0.45, tint: [leaf.r, leaf.g, leaf.b, leaf.a] } }; }
function minY(root) { root.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(root); return !box.isEmpty() && Number.isFinite(box.min.y) ? box.min.y : 0; }

export default class VillageRealismTree extends Domem {
  type = "villageRealismTree";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.scaleValue = Number(op.scale || 1); }
  async heescheel(olam) { const generated = new TreeGenerator(configFor(this.options)).generate(); const branchMesh = new THREE.Mesh(geometryFrom(generated.branches), new THREE.MeshLambertMaterial({ color: this.options.barkColor || 0x5b331d })); const leafMesh = new THREE.Mesh(geometryFrom(generated.leaves), new THREE.MeshLambertMaterial({ color: 0xffffff, map: leafTexture(), side: THREE.DoubleSide, transparent: true, alphaTest: 0.45, depthWrite: false })); this.mesh = new THREE.Group(); this.mesh.name = this.name || "VillageRealismTree_grounded_treasure"; this.mesh.add(branchMesh, leafMesh); this.mesh.scale.setScalar(this.scaleValue); const p = this.position || {}; this.mesh.position.set(num(p.x), num(p.y), num(p.z)); this.mesh.position.y += num(this.options.groundY ?? this.options.worldGroundY, 0) + num(this.options.groundLift, 0) - minY(this.mesh); markAsOnlyVision(this.mesh); await olam.hoyseef(this); this.isReady = true; }
}
