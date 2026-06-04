// B"H
/**
 * @module TerrainMaterialScribe
 * @description
 * Chapter 424: The earth remembered the roads beneath the grass.
 *
 * A village floor cannot be one green shout. It needs dusty paths, crushed
 * pebbles, clover flashes, and broad mossy breath. This scribe bakes those
 * signs from the same level data that shapes the terrain, so the player sees
 * paths where the terrain already walks.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

/**
 * Stable hash noise for generated texture detail.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} seed Noise seed.
 * @returns {number} Value in the range [0, 1).
 */
function hash(x, y, seed = 1) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Smooth value noise.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} seed Noise seed.
 * @returns {number} Smoothed value in the range [0, 1).
 */
function noise(x, y, seed = 1) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  return lerp(
    lerp(hash(ix, iy, seed), hash(ix + 1, iy, seed), fx),
    lerp(hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed), fx),
    fy
  );
}

/**
 * Fractal noise for organic color breakup.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {number} seed Noise seed.
 * @returns {number} Layered noise value.
 */
function fbm(x, y, seed) {
  return noise(x, y, seed) * 0.52
    + noise(x * 2.07, y * 2.07, seed + 11) * 0.31
    + noise(x * 4.13, y * 4.13, seed + 29) * 0.17;
}

/**
 * Returns distance from a point to a segment.
 *
 * @param {number} px Point X.
 * @param {number} pz Point Z.
 * @param {number[]} a Segment start [x, z].
 * @param {number[]} b Segment end [x, z].
 * @returns {number} Distance in terrain units.
 */
function segmentDistance(px, pz, a, b) {
  const ax = Number(a?.[0] || 0);
  const az = Number(a?.[1] || 0);
  const bx = Number(b?.[0] || 0);
  const bz = Number(b?.[1] || 0);
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSq = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lengthSq));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

/**
 * Computes authored road influence at a terrain coordinate.
 *
 * @param {number} x Terrain-local X.
 * @param {number} z Terrain-local Z.
 * @param {object[]} roads Authored road descriptions.
 * @returns {number} Dirt-road influence.
 */
function roadMask(x, z, roads = []) {
  let mask = 0;
  for (const road of roads) {
    const points = road?.points || [];
    for (let i = 1; i < points.length; i += 1) {
      const distance = segmentDistance(x, z, points[i - 1], points[i]);
      const width = Number(road.width || 9) * 0.5;
      const feather = Number(road.feather || 8);
      const influence = 1 - smooth(Math.max(0, distance - width) / Math.max(0.001, feather));
      mask = Math.max(mask, influence);
    }
  }
  return Math.max(0, Math.min(1, mask));
}

/**
 * Writes one RGBA pixel.
 *
 * @param {Uint8Array} data Pixel buffer.
 * @param {number} index Pixel start index.
 * @param {number} r Red channel.
 * @param {number} g Green channel.
 * @param {number} b Blue channel.
 * @returns {void}
 */
function put(data, index, r, g, b) {
  data[index] = clamp(r);
  data[index + 1] = clamp(g);
  data[index + 2] = clamp(b);
  data[index + 3] = 255;
}

/**
 * Synthesizes the terrain material texture.
 *
 * @param {object} terrain Terrain data.
 * @param {number} size Texture dimension.
 * @returns {THREE.DataTexture} Generated texture.
 */
function makeTexture(terrain = {}, size = 768) {
  const data = new Uint8Array(size * size * 4);
  const width = Number(terrain.width || 320);
  const depth = Number(terrain.depth || 300);
  const roads = terrain.roads || [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const wx = (u - 0.5) * width;
      const wz = (v - 0.5) * depth;
      const broad = fbm(u * 9.2, v * 9.2, 40);
      const fine = fbm(u * 48, v * 48, 91);
      const road = roadMask(wx, wz, roads);
      const stone = smooth(Math.max(0, fbm(u * 22 - 2, v * 22 + 5, 76) - 0.7) / 0.23);
      const flower = hash(Math.floor(u * 130), Math.floor(v * 130), 601) > 0.986 ? 1 : 0;
      const clover = hash(Math.floor(u * 92), Math.floor(v * 92), 811) > 0.965 ? 1 : 0;

      let r = lerp(61, 121, broad * 0.72 + fine * 0.28);
      let g = lerp(117, 178, broad * 0.78 + fine * 0.22);
      let b = lerp(48, 76, broad);

      r = lerp(r, 141 + fine * 35, road);
      g = lerp(g, 96 + fine * 28, road);
      b = lerp(b, 51 + fine * 16, road);
      r = lerp(r, 136 + fine * 42, stone * (1 - road * 0.5));
      g = lerp(g, 132 + fine * 38, stone * (1 - road * 0.5));
      b = lerp(b, 112 + fine * 34, stone * (1 - road * 0.5));

      if (clover && road < 0.35) { r += 18; g += 40; b += 8; }
      if (flower && road < 0.2) { r += 86; g += 38; b += hash(x, y, 77) > 0.5 ? 90 : -12; }

      put(data, (y * size + x) * 4, r, g, b);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export default class TerrainMaterialScribe {
  /**
   * Creates a safe, road-aware material for the terrain mesh.
   *
   * @param {object} data Terrain authoring data.
   * @returns {THREE.MeshLambertMaterial} Generated terrain material.
   */
  static async scribe(data = {}) {
    const size = Math.max(384, Math.min(1024, Number(data.textureSize || 768)));
    return new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: makeTexture(data, size),
      side: THREE.DoubleSide
    });
  }
}

