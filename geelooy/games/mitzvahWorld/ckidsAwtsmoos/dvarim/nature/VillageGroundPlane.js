// B"H
/** Real village ground plane: visible repeated green grass, no external texture path. */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=real-gameplay-solid-grass-20260708-bh2";
import { finite } from "../../../../../libs/awtsmoos3d/math.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const GREEN = 0x2d9d32;
const DARK = 0x15551f;
const LIGHT = 0x7ed957;

function grassTexture(repeatX, repeatY) {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const blade = ((x * 13 + y * 29 + ((x ^ y) * 7)) % 17) / 16;
      const color = blade > .78 ? LIGHT : blade < .23 ? DARK : GREEN;
      data[i] = (color >> 16) & 255;
      data[i + 1] = (color >> 8) & 255;
      data[i + 2] = color & 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function groundMaterial(width, depth) {
  const repeatX = Math.max(12, width / 24);
  const repeatY = Math.max(12, depth / 24);
  const mat = new THREE.MeshBasicMaterial({
    color:0xffffff,
    map:grassTexture(repeatX, repeatY),
    side:THREE.DoubleSide,
    transparent:false,
    opacity:1,
    depthWrite:true,
    depthTest:true
  });
  mat.userData = { realVillageGroundGrass:true, noNetwork:true, repeatX, repeatY };
  return mat;
}

export default class VillageGroundPlane extends Domem {
  type = "villageGroundPlane";
  constructor(op = {}, olam) {
    super({ ...op, isSolid:false, interactable:false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }
  async heescheel(olam) {
    const op = this.options;
    const width = Math.max(finite(op.width, 2600), 520);
    const depth = Math.max(finite(op.depth, 2600), 420);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth, 1, 1), groundMaterial(width, depth));
    mesh.name = op.name || "VillageGroundPlane_visible_repeated_grass";
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(finite(op.x), finite(op.y, -0.035), finite(op.z));
    mesh.frustumCulled = false;
    mesh.visible = true;
    mesh.renderOrder = -90;
    Object.assign(mesh.userData ||= {}, { wideGroundTexture:true, realGameplayVisibleGrass:true, neverHideTerrain:true, neverRuntimeLod:true, forceRuntimeVisible:true, isTerrain:true, walkableGround:true });
    this.mesh = mesh;
    globalThis.__AWTSMOOS_VILLAGE_GROUND_PROOF__ = { at:Date.now(), name:mesh.name, width, depth, material:mesh.material.type };
    globalThis.postMessage?.({ type:"worker_progress", stage:"village-ground-plane:visible-grass-ready", cacheKind:"real-gameplay-ground", ...globalThis.__AWTSMOOS_VILLAGE_GROUND_PROOF__ });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
