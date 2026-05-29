// B"H
/**
 * @module SolidBlock
 * @description
 * Chapter 32: Platforms become readable brick stones without texture loaders.
 *
 * The Awtsmoos paints every slab with a tiny procedural brick-grain texture:
 * mortar lines, warm stone noise, and edge variation. It is still a single small
 * DataTexture per seed, so mobile performance stays light while the level stops
 * looking like flat beige monitor light.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

function hashText(text = "") {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const colorTriplet = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
function noise(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.013) * 43758.5453123;
  return n - Math.floor(n);
}
function brickTexture(seed, baseHex) {
  const size = 64;
  const h = hashText(seed);
  const base = colorTriplet(baseHex || 0xc6aa62);
  const data = new Uint8Array(size * size * 4);
  const brickW = 16;
  const brickH = 8;
  for (let y = 0; y < size; y += 1) {
    const row = Math.floor(y / brickH);
    const offset = row % 2 ? brickW / 2 : 0;
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const bx = (x + offset) % brickW;
      const by = y % brickH;
      const mortar = bx < 1.4 || by < 1.2;
      const chip = noise(x, y, h) > 0.92 ? -32 : 0;
      const grain = (noise(x * 0.7, y * 0.7, h) - 0.5) * 34;
      const rowShade = ((row % 3) - 1) * 8;
      const shade = mortar ? -56 : grain + rowShade + chip;
      data[i] = clamp(base[0] + shade + 10);
      data[i + 1] = clamp(base[1] + shade + 6);
      data[i + 2] = clamp(base[2] + shade - 8);
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8 + (h % 3) * 0.7, 2.8 + ((h >> 3) % 3) * 0.7);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export default class SolidBlock extends Domem {
  type = "solidBlock";

  constructor(op = {}, olam) {
    super(op, olam);
    this.width = op.width || 1;
    this.height = op.height || 1;
    this.depth = op.depth || 1;
    this.color = op.color || 0xc6aa62;
    this.textureSeed = op.textureSeed || op.name || "platform";
  }

  async heescheel(olam) {
    this.olam = olam;
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: brickTexture(this.textureSeed, this.color)
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name;
    this.mesh.nivraAwtsmoos = this;
    this.mesh.visible = true;
    this.mesh.frustumCulled = true;
    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.isSolid = true;
    await olam.hoyseef(this);
    olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }
}
