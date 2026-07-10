// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';

const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';
export const GRASS_URLS = [`${FULL}grass%201.png`, `${HALF}grass%201.png`];
export const DIRT_URLS = [`${FULL}dirt%20grass%202.png`, `${HALF}dirt%20grass%202.png`, `${HALF}dirt%201.png`, `${HALF}dirt%20grass%201.png`];
export const REAL_GRASS_URL = GRASS_URLS[0];

/** Terrain3D: grass stays grass, shader mix() reveals old dirt texture patches. */
export function createTerrainPackage(obstacles, grassImage, dirtImage) {
  const terrain = terrainData(); const obstacleColliders = obstacles.flatMap(primitiveColliders); const group = new Group();
  group.name = 'Awtsmoos_Eretz_3D_shader_mixed_grass_dirt_world'; group.add(groundMesh(terrain, grassImage, dirtImage));
  for (const def of obstacles) { group.add(createPrimitiveMesh(def)); group.add(createEdgeOverlay(def)); }
  return { group, colliders: [...terrain.colliders, ...obstacleColliders], heightAt, stats: stats(terrain, obstacleColliders, obstacles, grassImage, dirtImage) };
}
export function heightAt(x, z) { return Math.sin(x * .23) * .22 + Math.cos(z * .19) * .18 + Math.sin((x + z) * .11) * .12; }
function stats(terrain, obstacleColliders, obstacles, grassImage, dirtImage) { return { terrainTriangles: terrain.colliders.length, obstacleTriangles: obstacleColliders.length, obstacles: obstacles.length, proceduralSource: PROCEDURAL_SOURCE, edges: true, hills: true, grassUrl: grassImage?.src || null, dirtUrl: dirtImage?.src || null, shaderMixFunction: 'mix(grass,dirt,mask)', mixedShader: true, mixStrength: .78, grassRepeat: [2.7, 2.7], dirtRepeat: [2.2, 2.2] }; }
function terrainData(size = 72, steps = 48) { const vertices = [], uvs = [], indices = [], half = size / 2; for (let iz = 0; iz <= steps; iz++) for (let ix = 0; ix <= steps; ix++) { const x = -half + size * ix / steps, z = -half + size * iz / steps; vertices.push(v(x, heightAt(x, z), z)); uvs.push(ix / steps, iz / steps); } for (let iz = 0; iz < steps; iz++) for (let ix = 0; ix < steps; ix++) { const a = iz * (steps + 1) + ix, b = a + 1, c = a + steps + 1, d = c + 1; indices.push(a, c, b, b, c, d); } return { vertices, uvs, indices, colliders: colliderList(vertices, indices) }; }
function colliderList(vertices, indices) { const out = []; for (let i = 0; i < indices.length; i += 3) out.push(new TriangleCollider(vertices[indices[i]], vertices[indices[i + 1]], vertices[indices[i + 2]], { kind: 'terrain', solid: true, floor: true })); return out; }
function groundMesh(data, grassImage, dirtImage) { const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(data.vertices.flatMap(p => [p.x, p.y, p.z])), 3)); g.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals(data.vertices, data.indices)), 3)); g.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2)); g.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1)); const mat = new MeshStandardMaterial({ name: 'Awtsmoos-shader-mix-grass-dirt', color: [0.92, 0.98, 0.88, 1] }); Object.assign(mat, { mapImage: grassImage, mixImage: dirtImage, mapRepeat: [2.7, 2.7], mixRepeat: [2.2, 2.2], mixStrength: .78, textureUrl: grassImage?.src || REAL_GRASS_URL, mixTextureUrl: dirtImage?.src || DIRT_URLS[0], anisotropy: true }); const mesh = new Mesh(g, mat); mesh.name = 'eretz-visible-shader-mixed-grass-dirt-hill-mesh'; mesh.setBaseTransform(); return mesh; }
function vertexNormals(vertices, indices) { const out = new Array(vertices.length).fill(0).map(() => v()); for (let i = 0; i < indices.length; i += 3) { const a = indices[i], b = indices[i + 1], c = indices[i + 2], n = triangleNormal(vertices[a], vertices[b], vertices[c]); for (const k of [a, b, c]) { out[k].x += n.x; out[k].y += n.y; out[k].z += n.z; } } return out.flatMap(n => { const l = Math.hypot(n.x, n.y, n.z) || 1; return [n.x / l, n.y / l, n.z / l]; }); }
