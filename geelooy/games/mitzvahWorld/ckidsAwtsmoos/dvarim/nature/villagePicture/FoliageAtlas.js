// B"H
/**
 * @file FoliageAtlas.js
 * @description Chapter 710: one painted atlas becomes thousands of light leaves.
 * The Awtsmoos renews every blade while one shared texture, one shader, and a
 * handful of instanced draw calls preserve the frame budget of the village.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const ROOT = "/games/mitzvahWorld/assets/textures/village/";
const textures = new Map();
const materials = new Map();
const geometries = new Map();

/** @param {string} file Atlas filename. @returns {THREE.Texture} Shared texture. */
export function foliageTexture(file) {
  if (textures.has(file)) return textures.get(file);
  const texture = new THREE.TextureLoader().load(ROOT + file);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.userData.worldPersistentAsset = true;
  textures.set(file, texture);
  return texture;
}

/** @param {object} options Material options. @returns {THREE.MeshLambertMaterial} Shared alpha-tested foliage material. */
export function foliageMaterial(options = {}) {
  const file = options.file || "grass-atlas.png";
  const wind = Number(options.wind || 0);
  const key = `${file}:${wind}:${options.alphaTest || 0.34}`;
  if (materials.has(key)) return materials.get(key);
  const material = new THREE.MeshLambertMaterial({
    map: foliageTexture(file), color: options.color || 0xffffff,
    side: THREE.DoubleSide, transparent: false, alphaTest: options.alphaTest || 0.34,
    depthWrite: true, vertexColors: Boolean(options.vertexColors)
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.awtsTime = { value: 0 };
    shader.vertexShader = `uniform float awtsTime;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       #ifdef USE_INSTANCING
       float awtsPhase = instanceMatrix[3].x * 0.17 + instanceMatrix[3].z * 0.11;
       transformed.x += sin(awtsTime * 0.9 + awtsPhase + position.y * 1.7) * ${wind.toFixed(4)} * uv.y;
       transformed.z += cos(awtsTime * 0.7 + awtsPhase) * ${(wind * 0.35).toFixed(4)} * uv.y;
       #endif`
    );
    material.userData.shader = shader;
  };
  material.customProgramCacheKey = () => key;
  material.userData.worldPersistentAsset = true;
  materials.set(key, material);
  return material;
}

/** @param {number} cell Atlas cell. @param {number} planes Crossed planes. @returns {THREE.BufferGeometry} Atlas-clipped geometry. */
export function crossedAtlasGeometry(cell, planes = 2) {
  const key = `${cell}:${planes}`;
  if (geometries.has(key)) return geometries.get(key);
  const col = cell % 4, row = Math.floor(cell / 4);
  const inset = 0.004;
  const u0 = col / 4 + inset, u1 = (col + 1) / 4 - inset;
  const v0 = 1 - (row + 1) / 2 + inset, v1 = 1 - row / 2 - inset;
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
  geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  geometry.userData.worldPersistentAsset = true;
  geometries.set(key, geometry);
  return geometry;
}

/** @param {object} options Mesh recipe. @returns {THREE.InstancedMesh} Ready foliage batch. */
export function foliageBatch(options = {}) {
  const mesh = new THREE.InstancedMesh(crossedAtlasGeometry(options.cell || 0, options.planes || 2), foliageMaterial(options), options.count || 1);
  mesh.name = options.name || "atlas_foliage_batch";
  mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = true;
  mesh.onBeforeRender = () => { const shader = mesh.material.userData.shader; if (shader) shader.uniforms.awtsTime.value = performance.now() * 0.001; };
  Object.assign(mesh.userData, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true, generatedAtlasFoliage: true });
  return mesh;
}

/** @param {THREE.InstancedMesh} mesh Batch. @param {number} index Instance index. @param {THREE.Vector3} position Position. @param {THREE.Euler} rotation Rotation. @param {THREE.Vector3} scale Scale. */
export function setFoliageInstance(mesh, index, position, rotation, scale) {
  const matrix = new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
  mesh.setMatrixAt(index, matrix);
}
