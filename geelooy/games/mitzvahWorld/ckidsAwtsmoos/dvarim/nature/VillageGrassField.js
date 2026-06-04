// B"H
/**
 * @file VillageGrassField.js
 * @description
 * Chapter 391: Lawns become fields of many real blades.
 *
 * The village needs lawns, not a texture accident. This module builds multiple
 * instanced meshes: short meadow blades, taller tufts, clover flecks, and pale
 * seed stems. Everything samples the terrain law per instance and remains purely
 * decorative, never an octree collider.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../terrain/core/TerrainMath.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hash = (x, z, seed = 1) => { const h = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453; return h - Math.floor(h); };
function bladeGeometry(height = 0.24, width = 0.028) {
  const geo = new THREE.BufferGeometry();
  const p = [-width, 0, 0, width, 0, 0, width * 0.25, height, 0.012, 0, 0, -width, width, 0, 0.006, -width * 0.2, height * 0.9, 0];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5]), 1));
  geo.computeVertexNormals();
  return geo;
}
function fleckGeometry() { return new THREE.CircleGeometry(0.035, 6); }
function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return n(law.position?.y) + TerrainMath.calculateHeightAt(worldX - n(law.position?.x), worldZ - n(law.position?.z), law.data);
  const ray = new THREE.Ray(new THREE.Vector3(worldX, 200, worldZ), new THREE.Vector3(0, -1, 0));
  const hit = olam?.worldOctree?.rayIntersect?.(ray);
  return Number.isFinite(hit?.position?.y) ? hit.position.y : fallback;
}
function patchPoint(patch, seed, i) {
  const angle = hash(i, seed, seed) * Math.PI * 2;
  const radius = n(patch.radius, 10) * Math.sqrt(hash(i + 11, seed + 7, seed));
  return { x: n(patch.x) + Math.cos(angle) * radius, z: n(patch.z) + Math.sin(angle) * radius, edge: radius / Math.max(0.01, n(patch.radius, 10)) };
}
function choosePatch(patches, seed, i, fallbackRadius) { return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x: 0, z: 0, radius: fallbackRadius }; }
function mark(root) { root.traverse(child => Object.assign(child.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true, grassVisualOnly: true, useAuthoredY: true })); }
function placeGrass(mesh, i, point, y, seed, hScale = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i, seed, 21) - 0.5) * 0.13, hash(i, seed, 2) * Math.PI * 2, (hash(i, seed, 3) - 0.5) * 0.18));
  const s = new THREE.Vector3(0.75 + hash(i, seed, 9) * 0.75, (0.65 + hash(i, seed, 12) * 1.05) * hScale, 0.75 + hash(i, seed, 15) * 0.75);
  mesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(point.x, y, point.z), q, s));
}
function placeFleck(mesh, i, point, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, hash(i, seed, 31) * Math.PI * 2));
  const s = new THREE.Vector3(0.8 + hash(i, seed, 34) * 1.1, 0.8 + hash(i, seed, 35) * 1.1, 1);
  mesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(point.x, y + 0.012, point.z), q, s));
}

export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }

  async heescheel(olam) {
    const patches = this.options.patches || [];
    const baseCount = Math.max(1, Math.floor(n(this.options.count, 1800)));
    const seed = n(this.options.seed, 778);
    const short = new THREE.InstancedMesh(bladeGeometry(0.22, 0.026), new THREE.MeshLambertMaterial({ color: 0x4caf50, side: THREE.DoubleSide }), baseCount);
    const tallCount = Math.floor(baseCount * 0.38);
    const tall = new THREE.InstancedMesh(bladeGeometry(0.42, 0.022), new THREE.MeshLambertMaterial({ color: 0x2f9b45, side: THREE.DoubleSide }), tallCount);
    const fleckCount = Math.floor(baseCount * 0.28);
    const flecks = new THREE.InstancedMesh(fleckGeometry(), new THREE.MeshBasicMaterial({ color: 0x8fdc68, side: THREE.DoubleSide }), fleckCount);
    const fallbackRadius = n(this.options.radius, 60);
    for (let i = 0; i < baseCount; i += 1) {
      const p = patchPoint(choosePatch(patches, seed, i, fallbackRadius), seed, i);
      const y = terrainHeight(olam, p.x, p.z, n(this.options.groundY, 0)) + n(this.options.groundLift, 0.012);
      placeGrass(short, i, p, y, seed, 0.82);
    }
    for (let i = 0; i < tallCount; i += 1) {
      const p = patchPoint(choosePatch(patches, seed + 43, i, fallbackRadius), seed + 43, i);
      const y = terrainHeight(olam, p.x, p.z, n(this.options.groundY, 0)) + n(this.options.groundLift, 0.014);
      placeGrass(tall, i, p, y, seed + 43, 1.1);
    }
    for (let i = 0; i < fleckCount; i += 1) {
      const p = patchPoint(choosePatch(patches, seed + 91, i, fallbackRadius), seed + 91, i);
      const y = terrainHeight(olam, p.x, p.z, n(this.options.groundY, 0)) + n(this.options.groundLift, 0.018);
      placeFleck(flecks, i, p, y, seed + 91);
    }
    [short, tall, flecks].forEach(mesh => { mesh.instanceMatrix.needsUpdate = true; mesh.frustumCulled = false; });
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageGrassField_lawn_many_real_blades";
    Object.assign(this.mesh.userData ||= {}, { useAuthoredY: true });
    this.mesh.add(short, tall, flecks);
    mark(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
