// B"H
/** House3D: bigger brick geometry whose wall, floor, and doorway all agree. */
const HOUSE = { x: 18, y: 0, z: -20, yaw: -.16, w: 12.4, d: 9.4, h: 4.4 };
export function createHouseDefs(assets = {}) {
  const { x, y, z, yaw } = HOUSE, brick = textured('#d19170', assets.brickImage, [4.4, 2.8]), wood = textured('#a56432', assets.woodImage, [2.2, 1.6]);
  return [
    manual('Awtsmoos-big-brick-three-wall-house', brick, { x, y, z }, yaw, wallShell()),
    manual('Awtsmoos-big-house-one-piece-triangle-roof', wood, { x, y: y + HOUSE.h, z }, yaw, roofMesh(), false),
    manual('Awtsmoos-big-house-brick-walk-floor', textured('#c48664', assets.brickImage, [3.8, 3.8]), { x, y: y + .08, z }, yaw, floorMesh(), true),
    doorway('Awtsmoos-house-front-boolean-doorway-wall', brick, x, y + 1.75, z + HOUSE.d / 2 + .42, HOUSE.w + .55, 3.5, .42, yaw, { x: 2.45, y: 2.7 })
  ];
}
export function houseDoorDef(assets = {}) {
  return { id: 'Awtsmoos-house-front-wood-door', width: 2.35, height: 2.62, thickness: .22, centerY: 1.31, depth: .63, yaw: HOUSE.yaw, position: { x: HOUSE.x, y: 0, z: HOUSE.z + HOUSE.d / 2 + .42 }, opening: { width: 2.45, height: 2.7, wall: 'Awtsmoos-house-front-boolean-doorway-wall' }, color: '#9a5827', mapImage: assets.woodImage || null, textureUrl: assets.woodImage?.dataset?.url || assets.woodImage?.src || null, mapRepeat: [1.2, 1.8] };
}
export function manualShape(id, material, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
function manual(id, material, position, yaw, data, walkable = false) { return manualShape(id, material, position, data.vertices, data.faces, { yaw, walkable, solid: true }); }
function textured(color, image, repeat) { return { color, mapImage: image || null, textureUrl: image?.dataset?.url || image?.src || null, mapRepeat: repeat }; }
function wallShell() { const { w, d, h } = HOUSE, m = mesh(), hw = w / 2, hd = d / 2; cuboid(m, -hw, 0, -hd, hw, h, -hd + .55); cuboid(m, -hw, 0, -hd + .55, -hw + .55, h, hd); cuboid(m, hw - .55, 0, -hd + .55, hw, h, hd); cuboid(m, -hw, h - .22, -hd, hw, h + .16, hd); return m; }
function roofMesh() { const { w, d } = HOUSE, hx = w / 2 + .7, hz = d / 2 + .75, rise = 2.35; return { vertices: [[-hx,0,hz],[hx,0,hz],[0,rise,hz],[-hx,0,-hz],[hx,0,-hz],[0,rise,-hz],[-hx+.55,-.24,hz-.45],[hx-.55,-.24,hz-.45],[-hx+.55,-.24,-hz+.45],[hx-.55,-.24,-hz+.45]], faces: [[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function floorMesh() { const { w, d } = HOUSE, hx = w / 2 - .75, hz = d / 2 - .75; return { vertices: [[-hx,0,hz],[hx,0,hz],[hx,0,-hz],[-hx,0,-hz],[-hx,-.16,hz],[hx,-.16,hz],[hx,-.16,-hz],[-hx,-.16,-hz]], faces: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]] }; }
function doorway(id, material, x, y, z, sx, sy, sz, yaw, door) { return { id, shape: 'doorway', solid: true, walkable: false, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, door, yaw, rotation: { y: yaw } }; }
function mesh() { return { vertices: [], faces: [] }; }
function cuboid(m, x0, y0, z0, x1, y1, z1) { const i = m.vertices.length; m.vertices.push([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]); m.faces.push([i,i+1,i+2,i+3], [i+4,i+5,i+6,i+7], [i+5,i,i+3,i+6], [i+1,i+4,i+7,i+2], [i+3,i+2,i+7,i+6], [i+5,i+4,i+1,i]); }
