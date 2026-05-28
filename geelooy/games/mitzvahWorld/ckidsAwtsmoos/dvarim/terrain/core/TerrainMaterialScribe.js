// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 6: Small desert texture, no mipmap burden.
 *
 * The desert keeps visible sand grain through one tiny repeated DataTexture.
 * Mipmaps are disabled so older GPUs do not have to allocate extra Texture2D
 * chains during the already-busy Level 1 boot.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { GRASS_TERRAIN_SNIPPETS } from './TerrainShaderSnippets.js';

const DARK = [176, 145, 80];
const LIGHT = [236, 218, 158];

function grain(x, y) {
  const n = Math.sin((x * 127.1) + (y * 311.7)) * 43758.5453123;
  return n - Math.floor(n);
}

function sandTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const t = (grain(x, y) * 0.7) + (((Math.sin((x + y) * 0.16) + 1) * 0.5) * 0.3);
      data[i] = Math.round(DARK[0] + (LIGHT[0] - DARK[0]) * t);
      data[i + 1] = Math.round(DARK[1] + (LIGHT[1] - DARK[1]) * t);
      data[i + 2] = Math.round(DARK[2] + (LIGHT[2] - DARK[2]) * t);
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
      const map = sandTexture(64);
      map.repeat.set(Math.max(6, data.width / 10), Math.max(6, data.depth / 10));
      return new THREE.MeshLambertMaterial({ color: 0xffffff, map, side: THREE.DoubleSide });
    }

    const grassTex = await loadGrassTexture(data, olam);
    if (typeof nivra.createMaterial === 'function') {
      return nivra.createMaterial('Lambert', { color: 0xffffff, map: grassTex, side: THREE.DoubleSide }, GRASS_TERRAIN_SNIPPETS);
    }
    return new THREE.MeshLambertMaterial({ color: 0x44aa44, map: grassTex, side: THREE.DoubleSide });
  }
}

async function loadGrassTexture(data, olam) {
  if (!olam || typeof olam.loadTexture !== 'function') return null;
  try {
    return await olam.loadTexture({
      url: 'awtsmoostex://' + (data.textureType || 'safegrass'),
      shouldRepeat: true,
      repeatX: data.width / 20,
      repeatY: data.depth / 20
    });
  } catch (error) {
    console.warn("B\"H - [TerrainMaterialScribe] Texture loading failed:", error?.message || error);
    return null;
  }
}
