// B"H
/** House3D: an open three-wall house plus one clean hand-authored roof mesh. */
export function createHouseDefs() {
  const base = { x: 15.2, y: 0, z: -20.4 }, yaw = -.16;
  return [
    manual('Awtsmoos-house-three-wall-shell', '#6b4630', base, yaw, wallShell()),
    manual('Awtsmoos-house-single-triangle-roof', '#8a552b', { x: base.x, y: base.y + 2.55, z: base.z }, yaw, roofMesh(), false),
    manual('Awtsmoos-house-open-front-floor', '#8b7355', { x: base.x, y: base.y + .06, z: base.z }, yaw, floorMesh(), true),
  ];
}

export function manualShape(id, color, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) {
  return { id, shape: 'manual', solid, walkable, color, position, vertices, faces, rotation: { y: yaw }, yaw };
}

function manual(id, color, position, yaw, data, walkable = false) { return manualShape(id, color, position, data.vertices, data.faces, { yaw, walkable, solid: true }); }

function wallShell() {
  const m = mesh();
  cuboid(m, -3.05, 0, -2.35, 3.05, 2.5, -1.95);      // back wall
  cuboid(m, -3.05, 0, -1.95, -2.65, 2.5, 2.25);       // left wall
  cuboid(m, 2.65, 0, -1.95, 3.05, 2.5, 2.25);         // right wall
  cuboid(m, -3.05, 2.48, -2.05, 3.05, 2.75, 2.35);    // thin top tie for roof seat
  return m;
}

function roofMesh() {
  const w = 7.35, d = 5.6, h = 1.55, over = .35, y = 0, hx = w / 2, hz = d / 2;
  return { vertices: [[-hx - over, y, hz + over], [hx + over, y, hz + over], [0, h, hz + over], [-hx - over, y, -hz - over], [hx + over, y, -hz - over], [0, h, -hz - over], [-hx + .2, -.18, hz], [hx - .2, -.18, hz], [-hx + .2, -.18, -hz], [hx - .2, -.18, -hz]], faces: [[0, 3, 5, 2], [1, 2, 5, 4], [0, 1, 4, 3], [0, 2, 1], [3, 4, 5], [6, 8, 9, 7]] };
}

function floorMesh() { return { vertices: [[-2.8,0,2.1],[2.8,0,2.1],[2.8,0,-1.9],[-2.8,0,-1.9],[-2.8,-.12,2.1],[2.8,-.12,2.1],[2.8,-.12,-1.9],[-2.8,-.12,-1.9]], faces: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]] }; }

function mesh() { return { vertices: [], faces: [] }; }
function cuboid(m, x0, y0, z0, x1, y1, z1) {
  const i = m.vertices.length, v = [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]];
  m.vertices.push(...v); m.faces.push([i,i+1,i+2,i+3], [i+4,i+5,i+6,i+7], [i+5,i,i+3,i+6], [i+1,i+4,i+7,i+2], [i+3,i+2,i+7,i+6], [i+5,i+4,i+1,i]);
}
