// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 172: Desert levels stop becoming a white sheet.
 *
 * Village grass remains readable and light, but lava/desert terrain is now a
 * warm muted stone-sand texture. The old sand map pushed values near white and
 * ACES/mobile exposure made the entire lava level glow. Future AI: keep desert
 * terrain muted; do not make pale sand again.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
const mix = (a, b, t) => a + (b - a) * t;
function noise(x, y, seed = 0) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.13) * 43758.5453123; return n - Math.floor(n); }
function makeTexture(size, dark, light, repeatX, repeatY, bladeScale = 1) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const t = Math.max(0, Math.min(1, noise(x, y) * 0.55 + noise(x * 0.28, y * 0.28, 4) * 0.45));
    const blade = Math.sin(x * 0.8 + y * 0.12) > 0.72 ? 16 * bladeScale : 0;
    data[i] = clamp(mix(dark[0], light[0], t) + blade * 0.25);
    data[i + 1] = clamp(mix(dark[1], light[1], t) + blade);
    data[i + 2] = clamp(mix(dark[2], light[2], t) + blade * 0.2);
    data[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
  return texture;
}

export default class TerrainMaterialScribe {
  static async scribe(data) {
    const isSand = data.textureType === "sand" || data.textureType === "desert";
    if (isSand) {
      const map = makeTexture(96, [92, 66, 35], [164, 126, 68], Math.max(8, data.width / 8), Math.max(8, data.depth / 8), 0.18);
      return new THREE.MeshLambertMaterial({ color: 0xc08a48, map, side: THREE.DoubleSide });
    }
    const map = makeTexture(96, [38, 122, 42], [126, 218, 105], Math.max(4, data.width / 9), Math.max(4, data.depth / 9), 1);
    return new THREE.MeshLambertMaterial({ color: 0xe6ffe0, map, side: THREE.DoubleSide });
  }
}
