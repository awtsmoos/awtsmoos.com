// B"H
/**
 * @module SolidBlock
 * @description
 * Chapter 97: not every visible stone must become a collision decree. The
 * Awtsmoos now lets blocks be decorative, so village houses and signs can exist
 * without filling the octree and choking every player step.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

const cache = new Map();
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const rgb = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
function hashText(text = "") { let h = 2166136261; for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; }
function noise(x, y, seed) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.011) * 43758.5453; return n - Math.floor(n); }
function styleFor(seed = "") { if (/MEZUZAH|CYAN/i.test(seed)) return "cyanGlass"; if (/GOLD|CROWN|LINTEL/i.test(seed)) return "goldCarve"; if (/DOOR|PANEL|BROWN|WOOD/i.test(seed)) return "woodBrick"; return "sandstone"; }
function shadeFor(style, x, y, h) {
  const brickW = style === "goldCarve" ? 8 : 16, brickH = style === "goldCarve" ? 4 : 8;
  const row = Math.floor(y / brickH), offset = row % 2 ? brickW / 2 : 0;
  const mortar = ((x + offset) % brickW) < 1.2 || (y % brickH) < 1.1;
  const grain = (noise(x * .7, y * .7, h) - .5) * 38;
  const chip = noise(x, y, h) > .925 ? -36 : 0;
  const ridge = style === "goldCarve" && (x % 8 === 0 || y % 8 === 0) ? 38 : 0;
  const glass = style === "cyanGlass" ? Math.sin((x + y) * .35) * 28 : 0;
  return (mortar ? -58 : grain + chip) + ridge + glass;
}
function makeTexture(seed, baseHex) {
  const key = `${seed}:${baseHex}`;
  if (cache.has(key)) return cache.get(key).clone();
  const size = 64, h = hashText(seed), base = rgb(baseHex || 0xc6aa62), style = styleFor(seed);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4, s = shadeFor(style, x, y, h), edge = x < 2 || y < 2 || x > 61 || y > 61 ? -24 : 0;
    data[i] = clamp(base[0] + s + edge + (style === "cyanGlass" ? -18 : 8));
    data[i + 1] = clamp(base[1] + s + edge + (style === "goldCarve" ? 18 : 4));
    data[i + 2] = clamp(base[2] + s + edge + (style === "cyanGlass" ? 38 : -6));
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.repeat.set(3.5 + (h % 2), 3.2 + ((h >> 3) % 2)); tex.needsUpdate = true;
  cache.set(key, tex); return tex.clone();
}

export default class SolidBlock extends Domem {
  type = "solidBlock";
  constructor(op = {}, olam) {
    super(op, olam);
    this.width = op.width || 1; this.height = op.height || 1; this.depth = op.depth || 1;
    this.color = op.color || 0xc6aa62; this.textureSeed = op.textureSeed || op.name || "platform";
    this.isSolid = op.isSolid !== false;
  }
  async heescheel(olam) {
    this.olam = olam;
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: makeTexture(this.textureSeed, this.color) });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name; this.mesh.nivraAwtsmoos = this; this.mesh.visible = true; this.mesh.frustumCulled = true;
    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData ||= {};
    this.mesh.userData.isSolid = this.isSolid;
    if (!this.isSolid) { this.mesh.userData.skipOctree = true; this.mesh.userData.noOctree = true; }
    await olam.hoyseef(this);
    if (this.isSolid) olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }
}
