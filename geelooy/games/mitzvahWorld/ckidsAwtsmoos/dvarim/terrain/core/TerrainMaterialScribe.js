// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 353: The earth stops turning black.
 *
 * The previous shader was too ambitious for the current mobile/browser path and
 * produced black wedges plus striped green bands. The Awtsmoos returns the earth
 * to a humble generated DataTexture: smooth-filtered, mipmapped, non-pixelated,
 * and ordinary MeshLambertMaterial so lighting and WebGL behave.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
function hash(x, y, s = 1) { const v = Math.sin(x * 127.1 + y * 311.7 + s * 91.3) * 43758.5453; return v - Math.floor(v); }
function noise(x, y, s = 1) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  return lerp(lerp(hash(ix, iy, s), hash(ix + 1, iy, s), fx), lerp(hash(ix, iy + 1, s), hash(ix + 1, iy + 1, s), fx), fy);
}
function fbm(x, y, s) { return noise(x, y, s) * 0.55 + noise(x * 2.05, y * 2.05, s + 11) * 0.3 + noise(x * 4.1, y * 4.1, s + 23) * 0.15; }
function put(data, i, r, g, b) { data[i] = clamp(r); data[i + 1] = clamp(g); data[i + 2] = clamp(b); data[i + 3] = 255; }

function makeTexture(size = 512) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const nx = x / size, ny = y / size;
    const broad = fbm(nx * 8, ny * 8, 40);
    const fine = fbm(nx * 42, ny * 42, 91);
    const dirt = smooth(Math.max(0, fbm(nx * 5 + 8, ny * 5 - 3, 12) - 0.48) / 0.34);
    const stone = smooth(Math.max(0, fbm(nx * 12 - 2, ny * 12 + 5, 76) - 0.72) / 0.22);
    let r = lerp(69, 125, broad * 0.7 + fine * 0.3);
    let g = lerp(128, 185, broad * 0.75 + fine * 0.25);
    let b = lerp(57, 82, broad);
    r = lerp(r, 142 + fine * 44, dirt * 0.5);
    g = lerp(g, 103 + fine * 32, dirt * 0.5);
    b = lerp(b, 55 + fine * 20, dirt * 0.5);
    r = lerp(r, 128 + fine * 48, stone * 0.18);
    g = lerp(g, 124 + fine * 42, stone * 0.18);
    b = lerp(b, 106 + fine * 38, stone * 0.18);
    put(data, (y * size + x) * 4, r, g, b);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

export default class TerrainMaterialScribe {
  /** @returns {THREE.MeshLambertMaterial} safe smooth non-shader terrain material. */
  static async scribe(data = {}) {
    const size = Math.max(256, Math.min(1024, Number(data.textureSize || 512)));
    return new THREE.MeshLambertMaterial({ color: 0xffffff, map: makeTexture(size), side: THREE.DoubleSide });
  }
}
