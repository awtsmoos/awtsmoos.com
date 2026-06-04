// B"H
/**
 * @file VillageTreeField.js
 * @description
 * Chapter 377: Orchard crowns become leafy masses, not dead-stick lollipops.
 *
 * The Awtsmoos replaces procedural branch skeletons with a small data orchard:
 * tapered trunks, angled limbs, and many overlapping leaf clusters. It is still
 * instanced and mobile-friendly, but each crown is a real volume cloud.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../terrain/core/TerrainMath.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const rand = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const LEAF_COLORS = [0x2c7a2f, 0x3f9637, 0x4fa43e, 0x246c2b, 0x67ad3f, 0x358338];
function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return n(law.position?.y) + TerrainMath.calculateHeightAt(worldX - n(law.position?.x), worldZ - n(law.position?.z), law.data);
  const ray = new THREE.Ray(new THREE.Vector3(worldX, 500, worldZ), new THREE.Vector3(0, -1, 0));
  const hit = olam?.worldOctree?.rayIntersect?.(ray);
  return Number.isFinite(hit?.position?.y) ? hit.position.y : fallback;
}
function mark(root) { root.traverse(o => Object.assign(o.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true, useAuthoredY: true })); }
function compose(mesh, index, p, q, s) { mesh.setMatrixAt(index, new THREE.Matrix4().compose(p, q, s)); }
function trunkGeometry() { return new THREE.CylinderGeometry(0.34, 0.52, 4.2, 8, 3); }
function limbGeometry() { return new THREE.CylinderGeometry(0.08, 0.16, 1, 7, 1); }
function leafGeometry() { return new THREE.IcosahedronGeometry(0.75, 1); }
function between(a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { mid, q, len: dir.length() };
}
function orchardPoint(i, seed, radius) {
  const angle = i * 2.399963 + seed * 0.77;
  const ring = radius * Math.sqrt(rand(i + seed * 17));
  return { x: Math.cos(angle) * ring, z: Math.sin(angle) * ring * 0.72, angle };
}
function crownLocal(i, c) {
  const angle = c * 1.618 + i * 0.41;
  const ring = c < 3 ? 0.25 : 0.55 + rand(i * 100 + c) * 0.75;
  return new THREE.Vector3(Math.cos(angle) * ring, 3.0 + rand(i * 30 + c) * 1.5, Math.sin(angle) * ring * 0.86);
}
function colorInstance(mesh, index, seed) { mesh.setColorAt(index, new THREE.Color(LEAF_COLORS[index % LEAF_COLORS.length]).offsetHSL(0.01 * rand(seed), -0.04, (rand(seed + 3) - 0.5) * 0.06)); }

export default class VillageTreeField extends Domem {
  type = "villageTreeField";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }

  async heescheel(olam) {
    const count = Math.max(1, Math.floor(n(this.options.count, 44)));
    const radius = n(this.options.radius, 86), seed = n(this.options.seed, 5), origin = this.position || {};
    const trunks = new THREE.InstancedMesh(trunkGeometry(), new THREE.MeshLambertMaterial({ color: 0x5a351d }), count);
    const limbCount = count * 5, leafCount = count * 15;
    const limbs = new THREE.InstancedMesh(limbGeometry(), new THREE.MeshLambertMaterial({ color: 0x4a2d17 }), limbCount);
    const leaves = new THREE.InstancedMesh(leafGeometry(), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: false, vertexColors: true }), leafCount);
    trunks.name = "warm_tapered_orchard_trunks"; limbs.name = "short_visible_living_limbs"; leaves.name = "many_overlapping_leaf_volume_crowns";
    let li = 0, ci = 0;
    for (let i = 0; i < count; i += 1) {
      const pt = orchardPoint(i, seed, radius), sc = 0.78 + rand(i * 9 + seed) * 0.46;
      const worldX = n(origin.x) + pt.x, worldZ = n(origin.z) + pt.z;
      const gy = terrainHeight(olam, worldX, worldZ, n(this.options.groundY, 0));
      const base = new THREE.Vector3(pt.x, gy + 2.1 * sc, pt.z);
      compose(trunks, i, base, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pt.angle, (rand(i) - 0.5) * 0.08)), new THREE.Vector3(sc * 0.9, sc, sc * 0.9));
      const top = new THREE.Vector3(pt.x, gy + 4.05 * sc, pt.z);
      for (let b = 0; b < 5; b += 1) {
        const a = pt.angle + b * 1.256 + rand(i * 19 + b) * 0.35;
        const end = top.clone().add(new THREE.Vector3(Math.cos(a) * sc * (0.8 + rand(b) * 0.6), sc * (0.45 + rand(i + b) * 0.45), Math.sin(a) * sc * (0.8 + rand(b + 2) * 0.6)));
        const seg = between(top.clone().add(new THREE.Vector3(0, -0.28 * sc, 0)), end);
        compose(limbs, li++, seg.mid, seg.q, new THREE.Vector3(sc, seg.len, sc));
      }
      for (let c = 0; c < 15; c += 1) {
        const local = crownLocal(i, c).multiplyScalar(sc);
        const p = new THREE.Vector3(pt.x + local.x, gy + local.y, pt.z + local.z);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(c) * 0.4, pt.angle + c, rand(i + c) * 0.4));
        const sx = (0.65 + rand(i * 50 + c) * 0.45) * sc;
        compose(leaves, ci, p, q, new THREE.Vector3(sx * 1.18, sx * 0.82, sx * 1.02));
        colorInstance(leaves, ci, i * 70 + c);
        ci += 1;
      }
    }
    trunks.instanceMatrix.needsUpdate = limbs.instanceMatrix.needsUpdate = leaves.instanceMatrix.needsUpdate = true;
    leaves.instanceColor.needsUpdate = true;
    [trunks, limbs, leaves].forEach(mesh => {
      mesh.computeBoundingBox?.();
      mesh.computeBoundingSphere?.();
      mesh.frustumCulled = true;
    });
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageTreeField_leafy_volume_orchard";
    this.mesh.position.set(n(origin.x), 0, n(origin.z));
    this.mesh.add(trunks, limbs, leaves);
    Object.assign(this.mesh.userData ||= {}, { useAuthoredY: true, awtsmoosGrounding: { mode: "per-tree-terrain-law" } });
    mark(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
