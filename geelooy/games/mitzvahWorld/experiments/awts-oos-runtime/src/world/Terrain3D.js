// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';

export const REAL_GRASS_URL = 'https://awtsmoos-docs-base.web.app/half-resolution/grass%201.png';

/** Terrain3D: grass hills, colliders, procedural solids, and readable edge ink. */
export function createTerrainPackage(obstacles, grassImage) {
  const terrain = terrainData(), obstacleColliders = obstacles.flatMap(primitiveColliders), group = new Group();
  group.name = 'AWTS_Eretz_3D_triangle_world'; group.add(groundMesh(terrain, grassImage));
  for (const def of obstacles) { group.add(createPrimitiveMesh(def)); group.add(createEdgeOverlay(def)); }
  return { group, colliders: [...terrain.colliders, ...obstacleColliders], heightAt, stats: { terrainTriangles: terrain.colliders.length, obstacleTriangles: obstacleColliders.length, obstacles: obstacles.length, proceduralSource: PROCEDURAL_SOURCE, edges: true, hills: true } };
}

export function heightAt(x, z) { return Math.sin(x * 0.23) * .22 + Math.cos(z * 0.19) * .18 + Math.sin((x + z) * .11) * .12; }

function terrainData(size = 72, steps = 36) {
  const vertices = [], uvs = [], indices = [], half = size / 2;
  for (let iz = 0; iz <= steps; iz++) for (let ix = 0; ix <= steps; ix++) { const x = -half + size * ix / steps, z = -half + size * iz / steps; vertices.push(v(x, heightAt(x, z), z)); uvs.push(ix / steps, iz / steps); }
  for (let iz = 0; iz < steps; iz++) for (let ix = 0; ix < steps; ix++) { const a = iz * (steps + 1) + ix, b = a + 1, c = a + steps + 1, d = c + 1; indices.push(a, c, b, b, c, d); }
  const colliders = []; for (let i = 0; i < indices.length; i += 3) colliders.push(new TriangleCollider(vertices[indices[i]], vertices[indices[i + 1]], vertices[indices[i + 2]], { kind: 'terrain', solid: true, floor: true }));
  return { vertices, uvs, indices, colliders };
}

function groundMesh(data, grassImage) {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(data.vertices.flatMap((p) => [p.x, p.y, p.z])), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals(data.vertices, data.indices)), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2)); g.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
  const mat = new MeshStandardMaterial({ name: 'awts-real-grass-hills', color: [0.62, 0.95, 0.62, 1] });
  mat.mapImage = grassImage; mat.mapRepeat = [32, 32]; mat.textureUrl = REAL_GRASS_URL;
  const mesh = new Mesh(g, mat); mesh.name = 'eretz-real-grass-hill-mesh'; mesh.setBaseTransform(); return mesh;
}
function vertexNormals(vertices, indices) { const out = new Array(vertices.length).fill(0).map(() => v()); for (let i = 0; i < indices.length; i += 3) { const a = indices[i], b = indices[i + 1], c = indices[i + 2], n = triangleNormal(vertices[a], vertices[b], vertices[c]); for (const k of [a,b,c]) { out[k].x += n.x; out[k].y += n.y; out[k].z += n.z; } } return out.flatMap((n) => { const l = Math.hypot(n.x, n.y, n.z) || 1; return [n.x / l, n.y / l, n.z / l]; }); }
