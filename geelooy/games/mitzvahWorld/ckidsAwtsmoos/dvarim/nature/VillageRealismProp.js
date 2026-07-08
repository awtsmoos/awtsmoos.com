// B"H
/**
 * @file VillageRealismProp.js
 * @description
 * Chapter 311: Old realism props surrender their spread-stack danger.
 *
 * This legacy prop set is visual-only, but it still lived in the village bundle.
 * The Awtsmoos removes its `Math.max(...indices)` trap so no procedural prop can
 * collapse the world while measuring a large index buffer.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateProceduralGeometry } from "../../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const C = Object.freeze({ stone: 0xc9b88f, roof: 0x9a2d18, wood: 0x6b3f1f, dark: 0x2e1b12, gold: 0xffb44a, glow: 0x55ffbb, rock: 0x8d8a80, flowerA: 0xffd84d, flowerB: 0xd86cff });
const cube = { size: 1 };
function maxValue(values = []) { let max = 0; for (let i = 0; i < values.length; i += 1) if (values[i] > max) max = values[i]; return max; }
function geom(kind, params = cube) { const d = generateProceduralGeometry(kind, params, [], { id: `village_${kind}` }); const g = new THREE.BufferGeometry(), pos = d.positions || d.verts || d.vertices || [], nor = d.normals || [], uv = d.uvs || [], ind = d.indices || []; g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3)); if (nor.length) g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3)); if (uv.length) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2)); if (ind.length) g.setIndex(new THREE.BufferAttribute(maxValue(ind) > 65535 ? new Uint32Array(ind) : new Uint16Array(ind), 1)); if (!nor.length) g.computeVertexNormals(); g.computeBoundingSphere(); return g; }
function mat(color, extra = {}) { return new THREE.MeshLambertMaterial({ color, ...extra }); }
function piece(kind, color, pos, scale, rot = [0, 0, 0], extra = {}) { const m = new THREE.Mesh(geom(kind), mat(color, extra)); m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot); return m; }
function post(g, x, z, h = 1.1) { g.add(piece("cube", C.wood, [x, h / 2, z], [0.16, h, 0.16])); }
function rail(g, x, y, z, sx, rz = 0) { g.add(piece("cube", C.wood, [x, y, z], [sx, 0.13, 0.13], [0, rz, 0])); }
function mark(root) { root.traverse(child => { child.userData ||= {}; child.userData.skipOctree = true; child.userData.noOctree = true; child.userData.skipRaycast = true; child.userData.villageDecor = true; }); }
const recipes = {
  stonePath(op) { const g = new THREE.Group(); for (let i = 0; i < (op.count || 22); i += 1) { const z = -12 + i * 1.15, x = Math.sin(i * 1.35) * 0.42; g.add(piece("cube", 0xb9a882, [x, -0.08, z], [1.12, 0.045, 0.62], [0, i * 0.19, 0])); } return g; },
  terrace() { const g = new THREE.Group(); g.add(piece("cube", C.stone, [0, 0.32, 0], [18, 0.64, 8])); g.add(piece("cube", 0x8e8068, [0, -0.08, 4.25], [18.5, 0.35, 0.55])); return g; },
  steps() { const g = new THREE.Group(); for (let i = 0; i < 4; i += 1) g.add(piece("cube", C.stone, [0, i * 0.16, i * 0.58], [4.2 - i * 0.28, 0.18, 0.55])); return g; },
  cottage() { const g = new THREE.Group(); g.add(piece("cube", C.stone, [0, 1.35, 0], [5.0, 2.7, 3.8])); g.add(piece("cube", C.roof, [0, 3.03, 0], [5.75, 0.7, 4.55], [0, 0, 0.08])); g.add(piece("cube", C.wood, [0, 0.95, 1.96], [1.1, 1.65, 0.12])); [-1.55, 1.55].forEach(x => g.add(piece("cube", 0xffc86a, [x, 1.5, 1.99], [0.68, 0.55, 0.08]))); return g; },
  pergola() { const g = new THREE.Group(); [-1.6, 1.6].forEach(x => { post(g, x, -0.9, 2.3); post(g, x, 0.9, 2.3); }); rail(g, 0, 2.35, -0.9, 3.7); rail(g, 0, 2.35, 0.9, 3.7); g.add(piece("cube", C.glow, [0, 1.05, 0], [0.58, 1.55, 0.18], [0, 0, 0], { emissive: C.glow, emissiveIntensity: 0.35 })); const light = new THREE.PointLight(C.glow, 1.1, 6, 2); light.position.set(0, 1.2, 0); g.add(light); return g; },
  lampPost(op) { const g = new THREE.Group(); g.add(piece("cylinder", C.dark, [0, 1.35, 0], [0.16, 2.7, 0.16])); rail(g, 0.28, 2.78, 0, 0.9); g.add(piece("cube", C.gold, [0.6, 2.36, 0], [0.36, 0.48, 0.36], [0, 0, 0], { emissive: 0xff8a31, emissiveIntensity: 0.25 })); const light = new THREE.PointLight(0xffb45b, op.intensity || 0.9, 8, 2); light.position.set(0.6, 2.36, 0); g.add(light); return g; },
  bench() { const g = new THREE.Group(); g.add(piece("cube", C.wood, [0, 0.58, 0], [2.4, 0.18, 0.52])); g.add(piece("cube", C.wood, [0, 1.02, -0.28], [2.4, 0.18, 0.18], [0.35, 0, 0])); [-0.9, 0.9].forEach(x => { post(g, x, 0.18, 0.55); post(g, x, -0.18, 0.55); }); return g; },
  fence(op) { const g = new THREE.Group(); const count = op.count || 6; for (let i = 0; i < count; i += 1) post(g, i * 1.05, 0, 1.05); rail(g, (count - 1) * 0.525, 0.74, 0, count * 1.05); return g; },
  well() { const g = new THREE.Group(); g.add(piece("cylinder", C.stone, [0, 0.55, 0], [1.25, 0.62, 1.25])); g.add(piece("cylinder", C.dark, [0, 1.25, 0], [1.42, 0.1, 1.42])); return g; },
  rock(op) { const g = new THREE.Group(); g.add(piece("icosphere", C.rock, [0, 0.15, 0], [op.sx || 0.55, op.sy || 0.25, op.sz || 0.45])); return g; },
  flowerPatch() { const g = new THREE.Group(); for (let i = 0; i < 14; i += 1) g.add(piece("cube", i % 2 ? C.flowerA : C.flowerB, [Math.sin(i) * 1.15, 0.03, Math.cos(i * 1.7) * 0.75], [0.07, 0.07, 0.07])); return g; }
};
export default class VillageRealismProp extends Domem { type = "villageRealismProp"; constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; } async heescheel(olam) { const kind = this.options.kind || "bench"; this.mesh = (recipes[kind] || recipes.bench)(this.options); this.mesh.name = this.name || `VillageRealismProp_${kind}`; const p = this.position || {}, r = this.rotation || {}; this.mesh.position.set(p.x || 0, p.y || 0, p.z || 0); this.mesh.rotation.set(r.x || 0, r.y || 0, r.z || 0); this.mesh.scale.setScalar(Number(this.options.scale || 1)); mark(this.mesh); await olam.hoyseef(this); this.isReady = true; } }
