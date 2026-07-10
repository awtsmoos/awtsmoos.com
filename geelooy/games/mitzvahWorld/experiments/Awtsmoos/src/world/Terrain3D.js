// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';

const HALF = 'https://Awtsmoos-docs-base.web.app/half-resolution/';
const FULL = 'https://Awtsmoos-docs-base.web.app/full-resolution/';
export const GRASS_URLS = [`${FULL}grass%201.png`, `${HALF}grass%201.png`];
export const DIRT_URLS = [`${HALF}dirt%20grass%202.png`, `${HALF}dirt%201.png`, `${HALF}dirt%20grass%201.png`];
export const REAL_GRASS_URL = GRASS_URLS[0];

/** Terrain3D: a high-res blended eretz canvas plus shader dirt breathing. */
export function createTerrainPackage(obstacles, grassImage, dirtImage) {
  const terrain = terrainData(); const obstacleColliders = obstacles.flatMap(primitiveColliders); const group = new Group();
  const blended = blendTerrainTexture(grassImage, dirtImage); group.name = 'Awtsmoos_Eretz_3D_mixed_grass_dirt_world'; group.add(groundMesh(terrain, blended, dirtImage));
  for (const def of obstacles) { group.add(createPrimitiveMesh(def)); group.add(createEdgeOverlay(def)); }
  return { group, colliders: [...terrain.colliders, ...obstacleColliders], heightAt, stats: { terrainTriangles: terrain.colliders.length, obstacleTriangles: obstacleColliders.length, obstacles: obstacles.length, proceduralSource: PROCEDURAL_SOURCE, edges: true, hills: true, grassUrl: grassImage?.src || null, dirtUrl: dirtImage?.src || null, blendedTexture: !!blended, blendedSize: blended ? `${blended.width}x${blended.height}` : null, grassRepeat: [3.2, 3.2], dirtRepeat: [4.5, 4.5], mixedShader: true } };
}
export function heightAt(x, z) { return Math.sin(x * .23) * .22 + Math.cos(z * .19) * .18 + Math.sin((x + z) * .11) * .12; }
function terrainData(size = 72, steps = 48) { const vertices = [], uvs = [], indices = [], half = size / 2; for (let iz = 0; iz <= steps; iz++) for (let ix = 0; ix <= steps; ix++) { const x = -half + size * ix / steps, z = -half + size * iz / steps; vertices.push(v(x, heightAt(x, z), z)); uvs.push(ix / steps, iz / steps); } for (let iz = 0; iz < steps; iz++) for (let ix = 0; ix < steps; ix++) { const a = iz * (steps + 1) + ix, b = a + 1, c = a + steps + 1, d = c + 1; indices.push(a, c, b, b, c, d); } return { vertices, uvs, indices, colliders: colliderList(vertices, indices) }; }
function colliderList(vertices, indices) { const out = []; for (let i = 0; i < indices.length; i += 3) out.push(new TriangleCollider(vertices[indices[i]], vertices[indices[i + 1]], vertices[indices[i + 2]], { kind: 'terrain', solid: true, floor: true })); return out; }
function groundMesh(data, terrainImage, dirtImage) { const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(data.vertices.flatMap(p => [p.x, p.y, p.z])), 3)); g.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals(data.vertices, data.indices)), 3)); g.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2)); g.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1)); const mat = new MeshStandardMaterial({ name: 'Awtsmoos-highres-grass-dirt-blend', color: [0.9, 0.98, 0.84, 1] }); Object.assign(mat, { mapImage: terrainImage, mixImage: dirtImage, mapRepeat: [3.2, 3.2], mixRepeat: [4.5, 4.5], mixStrength: .20, textureUrl: terrainImage?.dataset?.url || terrainImage?.src || REAL_GRASS_URL, mixTextureUrl: dirtImage?.src || DIRT_URLS[0], anisotropy: true }); const mesh = new Mesh(g, mat); mesh.name = 'eretz-highres-mixed-grass-dirt-hill-mesh'; mesh.setBaseTransform(); return mesh; }
function blendTerrainTexture(grass, dirt) { if (!grass) return null; const c = document.createElement('canvas'); c.width = 2048; c.height = 2048; c.dataset.url = `generated-blend:${grass.src || 'grass'}+${dirt?.src || 'no-dirt'}`; const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; tile(ctx, grass, 0, 0, c.width, c.height, 1); if (dirt) dirtPatches(ctx, dirt, c.width, c.height); return c; }
function tile(ctx, img, x, y, w, h, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; const size = 512; for (let yy = y; yy < y + h; yy += size) for (let xx = x; xx < x + w; xx += size) ctx.drawImage(img, xx, yy, size, size); ctx.restore(); }
function dirtPatches(ctx, dirt, w, h) {
  const pts = [[.24,.62,.24],[.47,.48,.18],[.62,.33,.14],[.76,.70,.20],[.37,.22,.16]];
  for (const [x, y, r] of pts) {
    const temp = document.createElement('canvas'); temp.width = w; temp.height = h;
    const t = temp.getContext('2d'); t.imageSmoothingEnabled = true; t.imageSmoothingQuality = 'high';
    t.drawImage(dirt, (x-r)*w, (y-r)*h, r*2*w, r*2*h);
    t.globalCompositeOperation = 'destination-in';
    const g = t.createRadialGradient(x*w, y*h, 0, x*w, y*h, r*w);
    g.addColorStop(0, 'rgba(255,255,255,.72)'); g.addColorStop(.58, 'rgba(255,255,255,.34)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    t.fillStyle = g; t.fillRect(0, 0, w, h);
    ctx.drawImage(temp, 0, 0);
  }
}
function vertexNormals(vertices, indices) { const out = new Array(vertices.length).fill(0).map(() => v()); for (let i = 0; i < indices.length; i += 3) { const a = indices[i], b = indices[i + 1], c = indices[i + 2], n = triangleNormal(vertices[a], vertices[b], vertices[c]); for (const k of [a, b, c]) { out[k].x += n.x; out[k].y += n.y; out[k].z += n.z; } } return out.flatMap(n => { const l = Math.hypot(n.x, n.y, n.z) || 1; return [n.x / l, n.y / l, n.z / l]; }); }
