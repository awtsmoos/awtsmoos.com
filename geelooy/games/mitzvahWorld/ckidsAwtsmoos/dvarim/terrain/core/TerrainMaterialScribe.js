// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 32: The sand receives layered grain and stone breath.
 *
 * The Awtsmoos gives the desert a stronger procedural floor: dunes, cracked
 * speckles, and slight stone noise in one tiny repeating DataTexture. No image
 * fetches, no mipmap burden, just readable ground under Level 1.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { GRASS_TERRAIN_SNIPPETS } from './TerrainShaderSnippets.js';

const DARK = [155, 126, 68];
const MID = [202, 174, 106];
const LIGHT = [242, 226, 164];
const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
function noise(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.13) * 43758.5453123;
  return n - Math.floor(n);
}
function mix(a, b, t) { return a + (b - a) * t; }
function sandTexture(size = 96) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const dune = (Math.sin((x * 0.17) + (y * 0.09)) + 1) * 0.5;
      const grain = noise(x, y) * 0.48 + noise(x * 0.45, y * 0.45, 3) * 0.32;
      const crack = (noise(Math.floor(x / 3), Math.floor(y / 3), 8) > 0.86 && noise(x, y, 9) > 0.58) ? -38 : 0;
      const stone = noise(Math.floor(x / 5), Math.floor(y / 5), 13) > 0.9 ? 22 : 0;
      const t = Math.max(0, Math.min(1, grain * 0.72 + dune * 0.28));
      const lo = dune > 0.52 ? MID : DARK;
      data[i] = clamp(mix(lo[0], LIGHT[0], t) + crack + stone);
      data[i + 1] = clamp(mix(lo[1], LIGHT[1], t) + crack + stone);
      data[i + 2] = clamp(mix(lo[2], LIGHT[2], t) + crack + stone * 0.5);
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export default class TerrainMaterialScribe {
  static async scribe(data, olam, nivra) {
    if (data.textureType === "sand" || data.textureType === "desert") {
      const map = sandTexture(96);
      map.repeat.set(Math.max(8, data.width / 8), Math.max(8, data.depth / 8));
      return new THREE.MeshLambertMaterial({ color: 0xffffff, map, side: THREE.DoubleSide });
    }
    const grassTex = await loadGrassTexture(data, olam);
    if (typeof nivra.createMaterial === 'function') return nivra.createMaterial('Lambert', { color: 0xffffff, map: grassTex, side: THREE.DoubleSide }, GRASS_TERRAIN_SNIPPETS);
    return new THREE.MeshLambertMaterial({ color: 0x44aa44, map: grassTex, side: THREE.DoubleSide });
  }
}
async function loadGrassTexture(data, olam) {
  if (!olam || typeof olam.loadTexture !== 'function') return null;
  try {
    return await olam.loadTexture({ url: 'awtsmoostex://' + (data.textureType || 'safegrass'), shouldRepeat: true, repeatX: data.width / 20, repeatY: data.depth / 20 });
  } catch (error) {
    console.warn("B\"H - [TerrainMaterialScribe] Texture loading failed:", error?.message || error);
    return null;
  }
}
