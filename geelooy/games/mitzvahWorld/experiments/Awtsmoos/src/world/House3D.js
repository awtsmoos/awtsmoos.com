// B"H
import { createDoorWallSet } from './DoorWallSystem.js';

/** House3D: one measured house covenant; doorway wall and door come from one algorithm. */
const HOUSE = Object.freeze({ x: 18, y: 0, z: -20, yaw: -.16, w: 12.4, d: 9.4, h: 4.35, wall: .55, doorW: 2.45, doorH: 2.75 });
const HW = HOUSE.w / 2, HD = HOUSE.d / 2;

export function createHouseDefs(assets = {}) {
  const mats = materials(assets), front = houseFrontDoorSet(assets).wall;
  return [
    manual('Awtsmoos-white-brick-back-and-side-house-shell', mats.whiteBrick, center(), rearAndSideWalls()),
    front,
    manual('Awtsmoos-wood-one-piece-triangle-roof', mats.wood, { x: HOUSE.x, y: HOUSE.y + HOUSE.h, z: HOUSE.z }, roofMesh(), false),
    manual('Awtsmoos-stone-house-floor', mats.stone, { x: HOUSE.x, y: HOUSE.y + .08, z: HOUSE.z }, floorMesh(), true)
  ];
}
export function houseDoorDef(assets = {}) { return houseFrontDoorSet(assets).door; }
export function houseFrontDoorSet(assets = {}) {
  const mats = materials(assets);
  return createDoorWallSet({ id: 'Awtsmoos-house-front', wallId: 'Awtsmoos-white-brick-boolean-front-door-wall', doorId: 'Awtsmoos-house-perfect-fit-wood-door', x: HOUSE.x, z: HOUSE.z + HD + HOUSE.wall / 2, floorY: HOUSE.y, yaw: HOUSE.yaw, wallW: HOUSE.w, wallH: HOUSE.h, wallT: HOUSE.wall, doorW: HOUSE.doorW, doorH: HOUSE.doorH, doorThickness: .22, panelGap: .08, wallColor: '#f1eee5', doorColor: '#9a5827' }, { ...mats.whiteBrick, doorMaterial: mats.wood });
}
export function manualShape(id, material, position, vertices, faces, { yaw = HOUSE.yaw, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
function manual(id, material, position, data, walkable = false) { return manualShape(id, material, position, data.vertices, data.faces, { walkable }); }
function materials(assets) { return { whiteBrick: textured('#f1eee5', assets.whiteBrickImage || assets.brickImage, [3.9, 2.4]), stone: textured('#c8c0ad', assets.stoneImage, [3.2, 3.2]), wood: textured('#a56432', assets.woodImage, [2.1, 1.5]) }; }
function textured(color, image, repeat) { return { color, mapImage: image || null, textureUrl: image?.dataset?.url || image?.src || null, mapRepeat: repeat }; }
function center() { return { x: HOUSE.x, y: HOUSE.y, z: HOUSE.z }; }
function rearAndSideWalls() { const m = mesh(), t = HOUSE.wall; cuboid(m, -HW, 0, -HD, HW, HOUSE.h, -HD + t); cuboid(m, -HW, 0, -HD + t, -HW + t, HOUSE.h, HD); cuboid(m, HW - t, 0, -HD + t, HW, HOUSE.h, HD); cuboid(m, -HW, HOUSE.h - .20, -HD, HW, HOUSE.h + .12, HD); return m; }
function roofMesh() { const hx = HW + .72, hz = HD + .78, rise = 2.25; return { vertices: [[-hx,0,hz],[hx,0,hz],[0,rise,hz],[-hx,0,-hz],[hx,0,-hz],[0,rise,-hz],[-hx+.55,-.22,hz-.44],[hx-.55,-.22,hz-.44],[-hx+.55,-.22,-hz+.44],[hx-.55,-.22,-hz+.44]], faces: [[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function floorMesh() { const hx = HW - .78, hz = HD - .78; return { vertices: [[-hx,0,hz],[hx,0,hz],[hx,0,-hz],[-hx,0,-hz],[-hx,-.16,hz],[hx,-.16,hz],[hx,-.16,-hz],[-hx,-.16,-hz]], faces: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]] }; }
function mesh() { return { vertices: [], faces: [] }; }
function cuboid(m, x0, y0, z0, x1, y1, z1) { const i = m.vertices.length; m.vertices.push([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]); m.faces.push([i,i+1,i+2,i+3], [i+4,i+5,i+6,i+7], [i+5,i,i+3,i+6], [i+1,i+4,i+7,i+2], [i+3,i+2,i+7,i+6], [i+5,i+4,i+1,i]); }
