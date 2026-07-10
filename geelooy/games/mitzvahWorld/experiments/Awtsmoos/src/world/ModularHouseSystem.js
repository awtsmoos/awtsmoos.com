// B"H
import { createDoorWallSet } from './DoorWallSystem.js';

export const DEFAULT_HOUSE_SPEC = Object.freeze({ id: 'Awtsmoos-main-huge-house', x: 48, z: -58, yaw: 0, floorY: 1.05, width: 53.4, depth: 43.2, wallH: 17.7, wallT: .82, doorW: 2.45, doorH: 2.75, roofRise: 8.2, roofOver: 3.2 });

/** ModularHouseSystem: giant house, human door, few measured colliders, every wall exactly matches. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s = houseSpec(spec), mats = houseMaterials(assets), front = frontDoorSet(assets, s).wall;
  return [foundation(s, mats), floor(s, mats), backWall(s, mats), leftWall(s, mats), rightWall(s, mats), front, roof(s, mats), landing(s, mats), ramp(s, mats), stairLip(s, mats, 1), stairLip(s, mats, 2), stairLip(s, mats, 3)];
}
export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) { return frontDoorSet(assets, houseSpec(spec)).door; }
export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec), p = localToWorld(s, 0, s.depth / 2 + 9.6); return { x: p.x, z: p.z }; }
export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec); return localToWorld(s, 0, s.depth / 2 - s.wallT / 2); }
function frontDoorSet(assets, s) { const p = modularHouseDoorWorld(s), mats = houseMaterials(assets); return createDoorWallSet({ id: `${s.id}-front`, wallId: `${s.id}-front-white-brick-door-wall`, doorId: `${s.id}-front-outside-flush-door`, x: p.x, z: p.z, floorY: s.floorY, yaw: s.yaw, wallW: s.width, wallH: s.wallH, wallT: s.wallT, doorW: s.doorW, doorH: s.doorH, doorThickness: .24, panelGap: .08, doorDepth: s.wallT / 2 + .18, openAngle: Math.PI * .54, noEdge: true, wallColor: '#eee8d9', doorColor: '#9a5827' }, { ...mats.whiteBrick, doorMaterial: mats.door }); }
function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o }; }
function houseMaterials(assets) { return { whiteBrick: tex('#eee8d9', assets.whiteBrickImage || assets.brickImage, [12, 6]), stone: tex('#c7bea9', assets.stoneImage, [7, 7]), door: tex('#a56432', assets.woodImage, [1.15, 1.9]), roof: tex('#b88a5d', assets.woodImage, [8, 4]) }; }
function tex(color, image, repeat) { return { color, mapImage: image || null, textureUrl: image?.dataset?.url || image?.src || null, mapRepeat: repeat }; }
function foundation(s, m) { return box(`${s.id}-single-cheap-stone-foundation`, m.stone, s, 0, s.floorY / 2, 0, s.width, s.floorY, s.depth, true, true); }
function floor(s, m) { return box(`${s.id}-complete-walkable-first-floor`, m.stone, s, 0, s.floorY + .06, 0, s.width - s.wallT * 1.8, .16, s.depth - s.wallT * 1.8, true, true); }
function backWall(s, m) { return box(`${s.id}-back-wall-exact`, m.whiteBrick, s, 0, s.floorY + s.wallH / 2, -s.depth / 2 + s.wallT / 2, s.width, s.wallH, s.wallT, false, true); }
function leftWall(s, m) { return box(`${s.id}-left-wall-exact`, m.whiteBrick, s, -s.width / 2 + s.wallT / 2, s.floorY + s.wallH / 2, 0, s.wallT, s.wallH, s.depth - s.wallT * 2, false, true); }
function rightWall(s, m) { return box(`${s.id}-right-wall-exact`, m.whiteBrick, s, s.width / 2 - s.wallT / 2, s.floorY + s.wallH / 2, 0, s.wallT, s.wallH, s.depth - s.wallT * 2, false, true); }
function roof(s, m) { return manual(`${s.id}-huge-bright-gable-roof`, m.roof, s, roofMesh(s), false, true); }
function landing(s, m) { return box(`${s.id}-wide-stone-landing-at-door`, m.stone, s, 0, s.floorY - .08, s.depth / 2 + 1.25, s.doorW + 4.2, .22, 2.45, true, false); }
function ramp(s, m) { return box(`${s.id}-single-smooth-stair-ramp-collider`, m.stone, s, 0, .52, s.depth / 2 + 4.0, s.doorW + 4.5, .38, 5.7, true, false, { x: -.18 }); }
function stairLip(s, m, i) { return box(`${s.id}-visual-low-stone-step-${i}`, m.stone, s, 0, .14 + i * .21, s.depth / 2 + 1.9 + i * .75, s.doorW + 4.4, .16, .22, true, false); }
function box(id, material, s, lx, y, lz, sx, sy, sz, walkable, noEdge, rot = {}) { const p = localToWorld(s, lx, lz); return { id, shape: 'box', solid: true, walkable, noEdge, ...material, position: { x: p.x, y, z: p.z }, size: { x: sx, y: sy, z: sz }, rotation: { y: s.yaw, ...rot } }; }
function manual(id, material, s, data, walkable, noEdge) { return { id, shape: 'manual', solid: true, walkable, noEdge, ...material, position: { x: s.x, y: 0, z: s.z }, vertices: data.vertices, faces: data.faces, rotation: { y: s.yaw }, yaw: s.yaw }; }
function roofMesh(s) { const hx = s.width / 2 + s.roofOver, hz = s.depth / 2 + s.roofOver, y = s.floorY + s.wallH, r = s.roofRise; return { vertices: [[-hx,y,hz],[hx,y,hz],[0,y+r,hz],[-hx,y,-hz],[hx,y,-hz],[0,y+r,-hz],[-hx+.8,y-.22,hz-.7],[hx-.8,y-.22,hz-.7],[-hx+.8,y-.22,-hz+.7],[hx-.8,y-.22,-hz+.7]], faces: [[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function localToWorld(s, x, z) { const c = Math.cos(s.yaw), q = Math.sin(s.yaw); return { x: s.x + x * c - z * q, z: s.z + x * q + z * c }; }
