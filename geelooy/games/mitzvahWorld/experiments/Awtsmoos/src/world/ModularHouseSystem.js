// B"H
import { createDoorWallSet } from './DoorWallSystem.js';

export const DEFAULT_HOUSE_SPEC = Object.freeze({ id: 'Awtsmoos-main-big-house', x: 18, z: -20.5, yaw: -.16, floorY: .62, width: 17.8, depth: 14.4, wallH: 5.9, wallT: .58, doorW: 2.45, doorH: 2.75, roofRise: 2.75, roofOver: 1.15 });

/** ModularHouseSystem: all walls, floor, stairs, roof, and door share one geometry covenant. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s = houseSpec(spec), mats = houseMaterials(assets), front = frontDoorSet(assets, s).wall;
  return [
    manual(`${s.id}-foundation-full-stone-slab`, mats.stone, s, foundationMesh(s), true),
    manual(`${s.id}-complete-stone-first-floor`, mats.stone, s, floorMesh(s), true),
    manual(`${s.id}-white-brick-back-left-right-walls`, mats.whiteBrick, s, sideBackWalls(s), false),
    front,
    manual(`${s.id}-bright-wood-roof-one-piece`, mats.roof, s, roofMesh(s), false),
    ...stoneStairs(s, mats.stone)
  ];
}
export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) { return frontDoorSet(assets, houseSpec(spec)).door; }
export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec), p = localToWorld(s, 0, s.depth / 2 + 4.35); return { x: p.x, z: p.z }; }
export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec); return localToWorld(s, 0, s.depth / 2 - s.wallT / 2); }
function frontDoorSet(assets, s) { const p = modularHouseDoorWorld(s), mats = houseMaterials(assets); return createDoorWallSet({ id: `${s.id}-front`, wallId: `${s.id}-front-white-brick-boolean-door-wall`, doorId: `${s.id}-front-perfect-fit-wood-door`, x: p.x, z: p.z, floorY: s.floorY, yaw: s.yaw, wallW: s.width, wallH: s.wallH, wallT: s.wallT, doorW: s.doorW, doorH: s.doorH, doorThickness: .22, panelGap: .08, wallColor: '#eee8d9', doorColor: '#9a5827' }, { ...mats.whiteBrick, doorMaterial: mats.door }); }
function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o, y: 0 }; }
function houseMaterials(assets) { return { whiteBrick: tex('#eee8d9', assets.whiteBrickImage || assets.brickImage, [5.6, 2.9]), stone: tex('#c6bca6', assets.stoneImage, [4.4, 4.4]), door: tex('#a56432', assets.woodImage, [1.2, 1.9]), roof: tex('#b38355', assets.woodImage, [3.2, 2.0]) }; }
function tex(color, image, repeat) { return { color, mapImage: image || null, textureUrl: image?.dataset?.url || image?.src || null, mapRepeat: repeat }; }
function manual(id, material, spec, data, walkable) { return { id, shape: 'manual', solid: true, walkable, ...material, position: { x: spec.x, y: 0, z: spec.z }, vertices: data.vertices, faces: data.faces, rotation: { y: spec.yaw }, yaw: spec.yaw }; }
function foundationMesh(s) { return cuboidMesh(-s.width/2, .02, -s.depth/2, s.width/2, s.floorY, s.depth/2); }
function floorMesh(s) { const inset = s.wallT * .85; return cuboidMesh(-s.width/2+inset, s.floorY-.10, -s.depth/2+inset, s.width/2-inset, s.floorY+.06, s.depth/2-inset); }
function sideBackWalls(s) { const m = mesh(), t = s.wallT, w = s.width/2, d = s.depth/2, y0 = s.floorY, y1 = s.floorY + s.wallH; cuboid(m, -w, y0, -d, w, y1, -d + t); cuboid(m, -w, y0, -d + t, -w + t, y1, d - t); cuboid(m, w - t, y0, -d + t, w, y1, d - t); cuboid(m, -w, y1 - .16, -d, w, y1 + .10, d); return m; }
function roofMesh(s) { const hx = s.width/2 + s.roofOver, hz = s.depth/2 + s.roofOver, r = s.roofRise, y = s.floorY + s.wallH; return { vertices: [[-hx,y,hz],[hx,y,hz],[0,y+r,hz],[-hx,y,-hz],[hx,y,-hz],[0,y+r,-hz],[-hx+.55,y-.16,hz-.44],[hx-.55,y-.16,hz-.44],[-hx+.55,y-.16,-hz+.44],[hx-.55,y-.16,-hz+.44]], faces: [[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function stoneStairs(s, mat) { const out = [], n = Math.max(3, Math.ceil(s.floorY / .18)), d = s.depth / 2, stepZ = .68, w = s.doorW + 1.25; out.push(stairBox(`${s.id}-door-stone-landing`, s, mat, 0, s.floorY - .11, d + .56, w + .5, .22, .92)); for (let i = 0; i < n; i++) { const top = s.floorY * (n - i) / (n + 1), z = d + 1.08 + i * stepZ; out.push(stairBox(`${s.id}-auto-stone-step-${i + 1}`, s, mat, 0, top/2, z, w, top, stepZ)); } return out; }
function stairBox(id, s, mat, lx, cy, lz, sx, sy, sz) { const p = localToWorld(s, lx, lz); return { id, shape: 'box', solid: true, walkable: true, ...mat, position: { x: p.x, y: cy, z: p.z }, size: { x: sx, y: sy, z: sz }, rotation: { y: s.yaw } }; }
function localToWorld(s, x, z) { const c = Math.cos(s.yaw), q = Math.sin(s.yaw); return { x: s.x + x*c - z*q, z: s.z + x*q + z*c }; }
function cuboidMesh(x0,y0,z0,x1,y1,z1) { const m = mesh(); cuboid(m,x0,y0,z0,x1,y1,z1); return m; }
function mesh() { return { vertices: [], faces: [] }; }
function cuboid(m, x0, y0, z0, x1, y1, z1) { const i = m.vertices.length; m.vertices.push([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]); m.faces.push([i,i+1,i+2,i+3], [i+4,i+5,i+6,i+7], [i+5,i,i+3,i+6], [i+1,i+4,i+7,i+2], [i+3,i+2,i+7,i+6], [i+5,i+4,i+1,i]); }
