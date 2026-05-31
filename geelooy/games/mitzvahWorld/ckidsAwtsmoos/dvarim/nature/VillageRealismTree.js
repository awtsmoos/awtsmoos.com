// B"H
/**
 * @file VillageRealismTree.js
 * @description
 * Chapter 98: the tree stops being a storm of square leaves and becomes a
 * single disciplined revelation. The Awtsmoos draws trunk and canopy from the
 * procedural-core tree generator, then seals every leaf away from octree,
 * collision, and raycast so beauty may bloom without choking the phone.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { TreeGenerator } from "../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js";

const DEFAULT_CANOPY = Object.freeze({ r: 0.21, g: 0.48, b: 0.18, a: 1 });

/** @param {Array<number>} values Flat geometry values. @param {number} itemSize Attribute width. */
function attribute(values, itemSize) {
  return new THREE.BufferAttribute(new Float32Array(values), itemSize);
}

/** @param {Array<number>} values RGBA values from the library. @returns {Array<number>} RGB values. */
function rgbColors(values = []) {
  const out = [];
  for (let i = 0; i < values.length; i += 4) out.push(values[i], values[i + 1], values[i + 2]);
  return out;
}

/** @param {Array<number>} indices Index values. */
function indexAttribute(indices) {
  const max = Math.max(...indices);
  return new THREE.BufferAttribute(max > 65535 ? new Uint32Array(indices) : new Uint16Array(indices), 1);
}

/**
 * Builds a finite BufferGeometry from procedural render data.
 *
 * @param {object} data
 * Geometry object with verts, normals, uvs, indices, and optional colors.
 *
 * @param {boolean} colors
 * Whether color attribute should be attached.
 *
 * @returns {THREE.BufferGeometry}
 * Safe geometry for one mesh.
 */
function geometryFrom(data, colors = false) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", attribute(data.verts || [], 3));
  if (data.normals?.length) geo.setAttribute("normal", attribute(data.normals, 3));
  if (data.uvs?.length) geo.setAttribute("uv", attribute(data.uvs, 2));
  if (colors && data.colors?.length) geo.setAttribute("color", attribute(rgbColors(data.colors), 3));
  if (data.indices?.length) geo.setIndex(indexAttribute(data.indices));
  if (!data.normals?.length) geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/** @param {THREE.Object3D} root Root object. */
function markAsOnlyVision(root) {
  root.traverse?.(child => {
    child.userData ||= {};
    child.userData.skipOctree = true;
    child.userData.noOctree = true;
    child.userData.skipRaycast = true;
    child.userData.villageDecor = true;
  });
}

/** @param {object} op Tree options. @returns {object} Tree generator config. */
function configFor(op = {}) {
  const leaf = op.leafColor || DEFAULT_CANOPY;
  const s = Number(op.seed || 91773);
  return {
    name: op.name || "village_realism_tree",
    seed: s,
    type: "deciduous",
    bark: { type: "oak", tint: 0xffffff },
    branch: {
      levels: 3,
      angle: { 1: 52, 2: 47, 3: 34 },
      children: { 0: 4, 1: 3, 2: 2 },
      force: { direction: { x: 0.04, y: 1, z: 0.02 }, strength: -0.006 },
      gnarliness: { 0: 0.05, 1: 0.14, 2: 0.22, 3: 0.08 },
      length: { 0: 8.6, 1: 4.1, 2: 2.2, 3: 1.1 },
      radius: { 0: 0.7, 1: 0.32, 2: 0.14, 3: 0.055 },
      sections: { 0: 8, 1: 7, 2: 5, 3: 4 },
      segments: { 0: 6, 1: 5, 2: 4, 3: 3 },
      start: { 1: 0.38, 2: 0.2, 3: 0.1 },
      taper: { 0: 0.66, 1: 0.62, 2: 0.58, 3: 0.5 },
      twist: { 0: -0.05, 1: 0.08, 2: 0.14, 3: 0 }
    },
    leaves: { type: "leaf_oak", count: Number(op.leafCount || 12), size: Number(op.leafSize || 0.62), sizeVariance: 0.45, tint: [leaf.r, leaf.g, leaf.b, leaf.a] }
  };
}

export default class VillageRealismTree extends Domem {
  type = "villageRealismTree";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.scaleValue = Number(op.scale || 1);
  }

  async heescheel(olam) {
    this.olam = olam;
    const generated = new TreeGenerator(configFor(this.options)).generate();
    const barkMat = new THREE.MeshLambertMaterial({ color: this.options.barkColor || 0x5b331d });
    const leafMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.94, depthWrite: false });
    const branchMesh = new THREE.Mesh(geometryFrom(generated.branches), barkMat);
    const leafMesh = new THREE.Mesh(geometryFrom(generated.leaves, true), leafMat);
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageRealismTree";
    this.mesh.add(branchMesh, leafMesh);
    this.mesh.scale.setScalar(this.scaleValue);
    const p = this.position || {};
    this.mesh.position.set(p.x || 0, p.y || 0, p.z || 0);
    markAsOnlyVision(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
