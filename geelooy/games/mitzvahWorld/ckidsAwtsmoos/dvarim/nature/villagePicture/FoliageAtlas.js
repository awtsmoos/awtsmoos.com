// B"H
/**
 * @file FoliageAtlas.js
 * @description Chapter 711: the forest stopped asking the absent DOM for a body.
 * In a worker-heescheel wilderness there is no `document`, so the Awtsmoos now
 * reveals leaves from raw RGBA speech: bytes become texture, texture becomes
 * canopy, canopy becomes quiet village shade without `ImageLoader` ever calling
 * `createElementNS`.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const textures = new Map();
const materials = new Map();
const geometries = new Map();
const ATLAS_COLUMNS = 4;
const ATLAS_ROWS = 2;
const CELL = 32;
const WIDTH = ATLAS_COLUMNS * CELL;
const HEIGHT = ATLAS_ROWS * CELL;

function colorForFile(file = "") {
  const lower = String(file).toLowerCase();
  if (lower.includes("grass")) return [86, 153, 68];
  if (lower.includes("flower")) return [232, 196, 76];
  if (lower.includes("dry")) return [146, 116, 58];
  return [70, 127, 58];
}

function paintCell(data, cell, base) {
  const col = cell % ATLAS_COLUMNS;
  const row = Math.floor(cell / ATLAS_COLUMNS);
  const cx = col * CELL + CELL / 2;
  const cy = row * CELL + CELL / 2;
  const seed = (cell + 1) * 19;
  for (let y = 0; y < CELL; y += 1) {
    for (let x = 0; x < CELL; x += 1) {
      const px = col * CELL + x;
      const py = row * CELL + y;
      const dx = (x - CELL / 2) / (CELL / 2);
      const dy = (y - CELL / 2) / (CELL / 2);
      const wobble = Math.sin((x + seed) * 0.41) * 0.13 + Math.cos((y - seed) * 0.37) * 0.11;
      const leaf = Math.abs(dx + wobble) * (1.15 + row * 0.1) + Math.abs(dy) * (0.82 + col * 0.04);
      const vein = Math.abs((px - cx) * 0.18 + Math.sin((py + seed) * 0.2));
      const alpha = leaf < 0.92 || vein < 0.16 ? 245 : 0;
      const shade = Math.max(0.58, Math.min(1.35, 1.05 - dy * 0.28 + Math.sin((px + py + seed) * 0.08) * 0.12));
      const index = (py * WIDTH + px) * 4;
      data[index] = Math.min(255, base[0] * shade + cell * 3);
      data[index + 1] = Math.min(255, base[1] * shade + row * 10);
      data[index + 2] = Math.min(255, base[2] * shade + col * 4);
      data[index + 3] = alpha;
    }
  }
}

function makeProceduralAtlas(file) {
  const data = new Uint8Array(WIDTH * HEIGHT * 4);
  const base = colorForFile(file);
  for (let cell = 0; cell < ATLAS_COLUMNS * ATLAS_ROWS; cell += 1) paintCell(data, cell, base);
  const texture = new THREE.DataTexture(data, WIDTH, HEIGHT, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData.worldPersistentAsset = true;
  texture.userData.awtsmoosNoDocumentTexture = true;
  texture.name = `awtsmoos_procedural_foliage_${file || "atlas"}`;
  return texture;
}

/** @param {string} file Atlas filename. @returns {THREE.Texture} Shared procedural texture. */
export function foliageTexture(file = "grass-atlas.png") {
  if (textures.has(file)) return textures.get(file);
  const texture = makeProceduralAtlas(file);
  textures.set(file, texture);
  return texture;
}

/** @param {object} options Material options. @returns {THREE.MeshLambertMaterial} Shared alpha-tested foliage material. */
export function foliageMaterial(options = {}) {
  const file = options.file || "grass-atlas.png";
  const wind = Number(options.wind || 0);
  const key = `${file}:${wind}:${options.alphaTest || 0.34}:${options.color || 0xffffff}`;
  if (materials.has(key)) return materials.get(key);
  const material = new THREE.MeshLambertMaterial({ map: foliageTexture(file), color: options.color || 0xffffff, side: THREE.DoubleSide, transparent: false, alphaTest: options.alphaTest || 0.34, depthWrite: true, vertexColors: Boolean(options.vertexColors) });
  material.onBeforeCompile = shader => {
    shader.uniforms.awtsTime = { value: 0 };
    shader.vertexShader = `uniform float awtsTime;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
       #ifdef USE_INSTANCING
       float awtsPhase = instanceMatrix[3].x * 0.17 + instanceMatrix[3].z * 0.11;
       transformed.x += sin(awtsTime * 0.9 + awtsPhase + position.y * 1.7) * ${wind.toFixed(4)} * uv.y;
       transformed.z += cos(awtsTime * 0.7 + awtsPhase) * ${(wind * 0.35).toFixed(4)} * uv.y;
       #endif`);
    material.userData.shader = shader;
  };
  material.customProgramCacheKey = () => key;
  material.userData.worldPersistentAsset = true;
  material.userData.awtsmoosProceduralFoliage = true;
  materials.set(key, material);
  return material;
}

/** @param {number} cell Atlas cell. @param {number} planes Crossed planes. @returns {THREE.BufferGeometry} Atlas-clipped geometry. */
export function crossedAtlasGeometry(cell, planes = 2) {
  const key = `${cell}:${planes}`;
  if (geometries.has(key)) return geometries.get(key);
  const col = cell % ATLAS_COLUMNS;
  const row = Math.floor(cell / ATLAS_COLUMNS);
  const inset = 0.004;
  const u0 = col / ATLAS_COLUMNS + inset, u1 = (col + 1) / ATLAS_COLUMNS - inset;
  const v0 = 1 - (row + 1) / ATLAS_ROWS + inset, v1 = 1 - row / ATLAS_ROWS - inset;
  const positions = [], uvs = [], indices = [];
  for (let plane = 0; plane < planes; plane += 1) {
    const angle = plane * Math.PI / planes;
    const dx = Math.cos(angle) * 0.5, dz = Math.sin(angle) * 0.5, base = positions.length / 3;
    positions.push(-dx, 0, -dz, dx, 0, dz, dx, 1, dz, -dx, 1, -dz);
    uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.userData.worldPersistentAsset = true;
  geometries.set(key, geometry);
  return geometry;
}

/** @param {object} options Mesh recipe. @returns {THREE.InstancedMesh} Ready foliage batch. */
export function foliageBatch(options = {}) {
  const mesh = new THREE.InstancedMesh(crossedAtlasGeometry(options.cell || 0, options.planes || 2), foliageMaterial(options), options.count || 1);
  mesh.name = options.name || "atlas_foliage_batch";
  mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = true;
  mesh.onBeforeRender = () => { const shader = mesh.material.userData.shader; if (shader) shader.uniforms.awtsTime.value = (globalThis.performance?.now?.() || Date.now()) * 0.001; };
  Object.assign(mesh.userData, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true, generatedAtlasFoliage: true });
  return mesh;
}

/** @param {THREE.InstancedMesh} mesh Batch. @param {number} index Instance index. @param {THREE.Vector3} position Position. @param {THREE.Euler} rotation Rotation. @param {THREE.Vector3} scale Scale. */
export function setFoliageInstance(mesh, index, position, rotation, scale) {
  const matrix = new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
  mesh.setMatrixAt(index, matrix);
}
