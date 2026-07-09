// B"H
/**
 * Real gameplay terrain material: zero network, zero shader, zero async.
 * This is copied from the passing terrain ladder's visible green plane idea.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=real-gameplay-solid-grass-20260708-bh2";

export const TERRAIN_TEXTURE_URLS = Object.freeze([
  "https://awtsmoos-docs-base.web.app/full-resolution/grass%201.png"
]);

const GREEN = 0x2d9d32;
const DARK = 0x15551f;
const LIGHT = 0x7ed957;

function post(stage, data = {}) {
  const payload = { stage, at:Date.now(), cacheKind:"real-gameplay-solid-grass", ...data };
  globalThis.__AWTSMOOS_TERRAIN_TEXTURE_PROOF__ = payload;
  globalThis.postMessage?.({ type:"worker_progress", ...payload });
}

function tune(texture, repeat) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.flipY = true;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function grassDataTexture(repeat) {
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
  return tune(new THREE.DataTexture(data, size, size, THREE.RGBAFormat), repeat);
}

export default class TerrainMaterialScribe {
  static async scribe(data = {}) {
    const repeat = Math.max(10, Number(data.textureRepeat || data.repeat || 30));
    const mat = new THREE.MeshBasicMaterial({
      color:0xffffff,
      map:grassDataTexture(repeat),
      side:THREE.DoubleSide,
      transparent:false,
      opacity:1,
      depthWrite:true,
      depthTest:true
    });
    mat.visible = true;
    mat.userData = {
      terrainExampleCopied:true,
      realGameplaySolidGrass:true,
      noNetwork:true,
      noShader:true,
      repeat
    };
    post("texture:terrain:solid-grass-ready", { repeat, material:mat.type });
    return mat;
  }
}
