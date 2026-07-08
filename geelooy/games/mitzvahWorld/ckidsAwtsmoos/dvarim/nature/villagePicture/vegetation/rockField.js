// B"H
/** @file rockField.js @description Decorative instanced rocks, parser-clear and non-colliding. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { geometry, material } from "../geometryKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { PICTURE_COLORS as C } from "../palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const pulse = i => Math.abs(Math.sin(i * 71.17 + 3.13));
function mark(mesh) { if (!mesh.userData) mesh.userData = {}; Object.assign(mesh.userData, { rockFieldVisualOnly:true, physics:"none", skipOctree:true, noOctree:true, skipRaycast:true }); }
export function instancedRockField(options = {}) { const count = Math.max(1, Math.floor(n(options.count, 36))), radius = n(options.radius, 5.2), seed = n(options.seed, 2); const mesh = new THREE.InstancedMesh(geometry("icosphere"), material(C.rock, { textureMode:"stone" }), count); mesh.name = "instanced_rock_field_visual_only"; for (let i = 0; i < count; i++) { const a = i * 2.17 + seed, r = radius * Math.sqrt(pulse(i + seed)); const p = new THREE.Vector3(Math.cos(a) * r, .08, Math.sin(a) * r * .78); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pulse(i) * .5, a, pulse(i + 4) * .35)); const s = .12 + pulse(i + 8) * .28; const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(s * 1.4, s * .55, s)); mesh.setMatrixAt(i, m); } mesh.instanceMatrix.needsUpdate = true; mark(mesh); const group = new THREE.Group(); group.add(mesh); return group; }
