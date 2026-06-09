// B"H
/**
 * @module SolidBlock
 * @description Chapter 521: Solid blocks now preserve Emerald performance
 * metadata on their render mesh, while retaining the darker readable sandstone
 * texture system.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
const cache = new Map();
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const rgb = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
function hashText(text = "") { let h = 2166136261; for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; }
function noise(x, y, seed) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.011) * 43758.5453; return n - Math.floor(n); }
function styleFor(seed = "") { if (/MEZUZAH|CYAN/i.test(seed)) return "cyanGlass"; if (/GOLD|CROWN|LINTEL/i.test(seed)) return "goldCarve"; if (/DOOR|PANEL|BROWN|WOOD/i.test(seed)) return "woodBrick"; return "sandstone"; }
function readableBase(hex, style) { const [r, g, b] = rgb(hex || 0xc6aa62); if (style === "cyanGlass") return [34, 112, 128]; if (style === "goldCarve") return [132, 92, 30]; if (style === "woodBrick") return [88, 49, 24]; return [(r * 0.32 + 82 * 0.68), (g * 0.3 + 58 * 0.7), (b * 0.25 + 28 * 0.75)].map(v => Math.min(126, v)); }
function shadeFor(style, x, y, h) { const brickW = style === "goldCarve" ? 8 : 16, brickH = style === "goldCarve" ? 4 : 8, row = Math.floor(y / brickH), offset = row % 2 ? brickW / 2 : 0; const mortar = ((x + offset) % brickW) < 1.2 || (y % brickH) < 1.1, grain = (noise(x * 0.7, y * 0.7, h) - 0.5) * 30, chip = noise(x, y, h) > 0.925 ? -35 : 0, ridge = style === "goldCarve" && (x % 8 === 0 || y % 8 === 0) ? 14 : 0, glass = style === "cyanGlass" ? Math.sin((x + y) * 0.35) * 12 : 0; return (mortar ? -46 : grain + chip) + ridge + glass; }
function makeTexture(seed, baseHex) {
  const style = styleFor(seed), key = `${seed}:${baseHex}:${style}:dimmed`; if (cache.has(key)) return cache.get(key).clone();
  const size = 64, h = hashText(seed), base = readableBase(baseHex, style), data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) { const i = (y * size + x) * 4, s = shadeFor(style, x, y, h), edge = x < 2 || y < 2 || x > 61 || y > 61 ? -22 : 0; data[i] = clamp(base[0] + s + edge); data[i + 1] = clamp(base[1] + s + edge); data[i + 2] = clamp(base[2] + s * 0.55 + edge); data[i + 3] = 255; }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType); tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.repeat.set(3.5 + (h % 2), 3.2 + ((h >> 3) % 2)); tex.needsUpdate = true; cache.set(key, tex); return tex.clone();
}
export default class SolidBlock extends Domem {
  type = "solidBlock";
  constructor(op = {}, olam) { super(op, olam); this.width = op.width || 1; this.height = op.height || 1; this.depth = op.depth || 1; this.color = op.color || 0xc6aa62; this.textureSeed = op.textureSeed || op.name || "platform"; this.isSolid = op.isSolid !== false; }
  async heescheel(olam) {
    this.olam = olam; const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth); const material = new THREE.MeshLambertMaterial({ color: 0xd0b890, map: makeTexture(this.textureSeed, this.color) });
    this.mesh = new THREE.Mesh(geometry, material); this.mesh.name = this.name; this.mesh.nivraAwtsmoos = this; this.mesh.visible = true; this.mesh.frustumCulled = true; if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0); this.mesh.updateMatrixWorld(true); this.mesh.userData ||= {}; this.mesh.userData.isSolid = this.isSolid; this.applyPerformanceUserData?.(this.mesh);
    if (!this.isSolid) { this.mesh.userData.skipOctree = true; this.mesh.userData.noOctree = true; }
    await olam.hoyseef(this); if (this.isSolid) olam.worldOctree?.addObject(this.mesh); this.isReady = true;
  }
}
