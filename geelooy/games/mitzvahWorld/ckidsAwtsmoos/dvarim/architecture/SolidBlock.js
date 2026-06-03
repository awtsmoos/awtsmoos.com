// B"H
/**
 * @module SolidBlock
 * @description
 * Chapter 179: the lava path stops screaming white.
 *
 * The Awtsmoos showed the phone screen: pale platform colors were becoming a
 * white sheet under mobile exposure. This block material keeps the same stone
 * identity but clamps sandstone into readable ochre, darkens mortar, and keeps
 * procedural brick texture visible. Future AI: never restore flat bright blocks
 * in lava levels.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

const cache = new Map();
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const rgb = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

function hashText(text = "") {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function noise(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.011) * 43758.5453;
  return n - Math.floor(n);
}

function styleFor(seed = "") {
  if (/MEZUZAH|CYAN/i.test(seed)) return "cyanGlass";
  if (/GOLD|CROWN|LINTEL/i.test(seed)) return "goldCarve";
  if (/DOOR|PANEL|BROWN|WOOD/i.test(seed)) return "woodBrick";
  return "sandstone";
}

function readableBase(hex, style) {
  const [r, g, b] = rgb(hex || 0xc6aa62);
  if (style === "cyanGlass") return [42, 146, 162];
  if (style === "goldCarve") return [156, 118, 42];
  if (style === "woodBrick") return [112, 66, 32];
  const warm = [(r * 0.45 + 126 * 0.55), (g * 0.42 + 92 * 0.58), (b * 0.35 + 38 * 0.65)];
  return warm.map(v => Math.min(170, v));
}

function shadeFor(style, x, y, h) {
  const brickW = style === "goldCarve" ? 8 : 16;
  const brickH = style === "goldCarve" ? 4 : 8;
  const row = Math.floor(y / brickH);
  const offset = row % 2 ? brickW / 2 : 0;
  const mortar = ((x + offset) % brickW) < 1.2 || (y % brickH) < 1.1;
  const grain = (noise(x * 0.7, y * 0.7, h) - 0.5) * 42;
  const chip = noise(x, y, h) > 0.925 ? -44 : 0;
  const ridge = style === "goldCarve" && (x % 8 === 0 || y % 8 === 0) ? 24 : 0;
  const glass = style === "cyanGlass" ? Math.sin((x + y) * 0.35) * 20 : 0;
  return (mortar ? -70 : grain + chip) + ridge + glass;
}

function makeTexture(seed, baseHex) {
  const style = styleFor(seed);
  const key = `${seed}:${baseHex}:${style}:readable`;
  if (cache.has(key)) return cache.get(key).clone();
  const size = 64;
  const h = hashText(seed);
  const base = readableBase(baseHex, style);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const s = shadeFor(style, x, y, h);
    const edge = x < 2 || y < 2 || x > 61 || y > 61 ? -28 : 0;
    data[i] = clamp(base[0] + s + edge);
    data[i + 1] = clamp(base[1] + s + edge);
    data[i + 2] = clamp(base[2] + s * 0.65 + edge);
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.repeat.set(3.5 + (h % 2), 3.2 + ((h >> 3) % 2));
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex.clone();
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
    this.isSolid = op.isSolid !== false;
  }

  async heescheel(olam) {
    this.olam = olam;
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: makeTexture(this.textureSeed, this.color) });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name;
    this.mesh.nivraAwtsmoos = this;
    this.mesh.visible = true;
    this.mesh.frustumCulled = true;
    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData ||= {};
    this.mesh.userData.isSolid = this.isSolid;
    if (!this.isSolid) {
      this.mesh.userData.skipOctree = true;
      this.mesh.userData.noOctree = true;
    }
    await olam.hoyseef(this);
    if (this.isSolid) olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }
}
