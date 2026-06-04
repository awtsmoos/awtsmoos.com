// B"H
/**
 * @file heroTree.js
 * @description
 * Chapter 24: The Awtsmoos teaches one great tree to become many worlds.
 * This reusable generator makes a WebGL-safe Lambert hero tree from data: trunk,
 * limbs, fine twigs, clustered leaf cards, and color variation. It is not tied
 * to Mitzvah World; every future geelooy scene may call it.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance, segmentBetween } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";
import { lambertBark, lambertLeaf } from "../lambert.js";

const trunkGeo = h => new THREE.CylinderGeometry(0.72, 1.16, h, 14, 6);
const limbGeo = () => new THREE.CylinderGeometry(0.07, 0.2, 1, 8, 1);
const leafGeo = () => { const g = new THREE.PlaneGeometry(0.58, 0.82); g.translate(0, 0.3, 0); return g; };

function crownPoint(i, op) {
  const a = i * 2.399963 + hash(i, 4, 8) * 0.55;
  const r = finite(op.crownRadius, 5.4) * Math.sqrt(hash(i, 2, 7));
  const y = finite(op.trunkHeight, 7.5) * 0.68 + hash(i, 4, 8) * finite(op.crownHeight, 3.8);
  return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r * 0.74);
}

function placeLimb(mesh, i, h) {
  const a = i * 2.399963 + hash(i, 1, 1);
  const start = new THREE.Vector3(0, h * (0.42 + hash(i, 2, 2) * 0.42), 0);
  const end = start.clone().add(new THREE.Vector3(Math.cos(a) * (2 + hash(i, 3, 3) * 3.4), 0.5 + hash(i, 4, 4) * 1.8, Math.sin(a) * (1.4 + hash(i, 5, 5) * 2.7)));
  const seg = segmentBetween(start, end);
  setInstance(mesh, i, seg.mid, seg.q, new THREE.Vector3(0.85, seg.length, 0.85));
}

function placeLeaf(mesh, i, op) {
  const p = crownPoint(i, op);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i, 9, 1) - 0.5) * 0.85, hash(i, 9, 2) * Math.PI * 2, (hash(i, 9, 3) - 0.5) * 0.9));
  const s = new THREE.Vector3(0.65 + hash(i, 3, 1) * 1.45, 0.7 + hash(i, 3, 2) * 1.05, 1);
  setInstance(mesh, i, p, q, s);
}

/**
 * Build a complete decorative hero tree group.
 * @param {Object} op Authored tree options.
 * @returns {THREE.Group} Visual-only group.
 */
export function createHeroTree(op = {}) {
  const h = finite(op.trunkHeight, 7.5);
  const limbsN = Math.max(8, Math.floor(finite(op.limbCount, 30)));
  const leavesN = Math.max(90, Math.floor(finite(op.leafCount, 480)));
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosHeroTree_reusable_lambert";
  const trunk = new THREE.Mesh(trunkGeo(h), lambertBark(finite(op.barkColor, 0x5a351d)));
  const limbs = new THREE.InstancedMesh(limbGeo(), lambertBark(finite(op.branchColor, 0x4d2d19)), limbsN);
  const leaves = new THREE.InstancedMesh(leafGeo(), lambertLeaf(finite(op.leafColor, 0x4f9f36)), leavesN);
  trunk.position.y = h / 2;
  for (let i = 0; i < limbsN; i += 1) placeLimb(limbs, i, h);
  for (let i = 0; i < leavesN; i += 1) placeLeaf(leaves, i, op);
  finishInstanced([limbs, leaves]);
  group.add(trunk, limbs, leaves);
  group.position.set(finite(op.position?.x), finite(op.position?.y), finite(op.position?.z));
  group.rotation.y = finite(op.rotationY, 0);
  group.scale.setScalar(finite(op.scale, 1));
  return markDecorative(group);
}
