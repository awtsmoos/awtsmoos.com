// B"H
/** House3D: every wall/door/roof shares one exact coordinate covenant. */
const HOUSE = { x: 18, y: 0, z: -20, yaw: -.16, w: 12.4, d: 9.4, h: 4.35, wall: .55, doorW: 2.45, doorH: 2.75 };
const HW = HOUSE.w / 2, HD = HOUSE.d / 2, FRONT_Z = HD + HOUSE.wall / 2;

export function createHouseDefs(assets = {}) {
  const { x, y, z, yaw } = HOUSE, brick = textured('#f1a07a', assets.brickImage, [4.4, 2.8]), wood = textured('#a56432', assets.woodImage, [2.2, 1.6]);
  return [
    manual('Awtsmoos-big-brick-back-and-side-walls', brick, { x, y, z }, yaw, rearAndSideWalls()),
    manual('Awtsmoos-big-brick-exact-front-door-wall', brick, { x, y, z }, yaw, exactFrontWall()),
    manual('Awtsmoos-big-house-one-piece-triangle-roof', wood, { x, y: y + HOUSE.h, z }, yaw, roofMesh(), false),
    manual('Awtsmoos-big-house-brick-walk-floor', textured('#e6a06e', assets.brickImage, [3.8, 3.8]), { x, y: y + .08, z }, yaw, floorMesh(), true),
  ];
}
export function houseDoorDef(assets = {}) {
  return { id: 'Awtsmoos-house-front-wood-door', width: HOUSE.doorW - .10, height: HOUSE.doorH - .10, thickness: .20, centerY: (HOUSE.doorH - .10) / 2, depth: HOUSE.wall / 2 + .04, yaw: HOUSE.yaw, position: { x: HOUSE.x, y: 0, z: HOUSE.z + FRONT_Z }, opening: { width: HOUSE.doorW, height: HOUSE.doorH, wall: 'Awtsmoos-big-brick-exact-front-door-wall' }, color: '#9a5827', mapImage: assets.woodImage || null, textureUrl: assets.woodImage?.dataset?.url || assets.woodImage?.src || null, mapRepeat: [1.2, 1.8] };
}
export function manualShape(id, material, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
function manual(id, material, position, yaw, data, walkable = false) { return manualShape(id, material, position, data.vertices, data.faces, { yaw, walkable, solid: true }); }
function textured(color, image, repeat) { return { color, mapImage: image || null, textureUrl: image?.dataset?.url || image?.src || null, mapRepeat: repeat }; }
function rearAndSideWalls() { const m = mesh(), t = HOUSE.wall; cuboid(m, -HW, 0, -HD, HW, HOUSE.h, -HD + t); cuboid(m, -HW, 0, -HD + t, -HW + t, HOUSE.h, HD); cuboid(m, HW - t, 0, -HD + t, HW, HOUSE.h, HD); cuboid(m, -HW, HOUSE.h - .20, -HD, HW, HOUSE.h + .12, HD); return m; }
function exactFrontWall() { const m = mesh(), t = HOUSE.wall, z0 = HD, z1 = HD + t, dx = HOUSE.doorW / 2, dh = HOUSE.doorH; cuboid(m, -HW, 0, z0, -dx, HOUSE.h, z1); cuboid(m, dx, 0, z0, HW, HOUSE.h, z1); cuboid(m, -dx, dh, z0, dx, HOUSE.h, z1); return m; }
function roofMesh() { const hx = HW + .72, hz = HD + .78, rise = 2.25; return { vertices: [[-hx,0,hz],[hx,0,hz],[0,rise,hz],[-hx,0,-hz],[hx,0,-hz],[0,rise,-hz],[-hx+.55,-.22,hz-.44],[hx-.55,-.22,hz-.44],[-hx+.55,-.22,-hz+.44],[hx-.55,-.22,-hz+.44]], faces: [[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function floorMesh() { const hx = HW - .78, hz = HD - .78; return { vertices: [[-hx,0,hz],[hx,0,hz],[hx,0,-hz],[-hx,0,-hz],[-hx,-.16,hz],[hx,-.16,hz],[hx,-.16,-hz],[-hx,-.16,-hz]], faces: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]] }; }
function mesh() { return { vertices: [], faces: [] }; }
function cuboid(m, x0, y0, z0, x1, y1, z1) { const i = m.vertices.length; m.vertices.push([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]); m.faces.push([i,i+1,i+2,i+3], [i+4,i+5,i+6,i+7], [i+5,i,i+3,i+6], [i+1,i+4,i+7,i+2], [i+3,i+2,i+7,i+6], [i+5,i+4,i+1,i]); }
