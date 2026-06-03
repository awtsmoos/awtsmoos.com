// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 234: Grass, dirt, and stone are woven as pure DataTexture bytes.
 * The village gets richer earth from generated RGBA arrays alone, suited to
 * mobile and the reference countryside mood. Lava terrain brightness is untouched.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
const mix = (a, b, t) => a + (b - a) * t;
const noise = (x, y, seed = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.13) * 43758.5453123; return n - Math.floor(n); };
const palette = { grassA: [34, 105, 39], grassB: [118, 190, 92], dirtA: [91, 61, 33], dirtB: [154, 105, 55], rockA: [112, 106, 92], rockB: [184, 174, 145] };

function chooseColor(x, y, type) {
  const low = noise(x * 0.2, y * 0.2, 9), speck = noise(x, y, 4), road = noise(x * 0.08, y * 0.08, 12);
  let a = palette.grassA, b = palette.grassB;
  if (type === "sand" || type === "desert") { a = [44, 31, 17]; b = [104, 76, 38]; }
  else if (road > 0.66) { a = palette.dirtA; b = palette.dirtB; }
  else if (low < 0.12) { a = palette.rockA; b = palette.rockB; }
  const t = Math.max(0, Math.min(1, low * 0.75 + speck * 0.25));
  return [clamp(mix(a[0], b[0], t)), clamp(mix(a[1], b[1], t)), clamp(mix(a[2], b[2], t))];
}
function makeTexture(data) {
  const size = Number(data.textureSize || 128), bytes = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4, c = chooseColor(x, y, data.textureType);
    const blade = Math.sin(x * 0.9 + y * 0.17) > 0.78 && data.textureType !== "desert" ? 16 : 0;
    bytes[i] = c[0]; bytes[i + 1] = clamp(c[1] + blade); bytes[i + 2] = c[2]; bytes[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false; tex.repeat.set(Math.max(8, data.width / 8), Math.max(8, data.depth / 8)); tex.needsUpdate = true;
  return tex;
}

export default class TerrainMaterialScribe {
  static async scribe(data) {
    const map = makeTexture(data);
    const color = data.textureType === "desert" || data.textureType === "sand" ? 0xc2a270 : 0xffffff;
    return new THREE.MeshLambertMaterial({ color, map, side: THREE.DoubleSide });
  }
}
