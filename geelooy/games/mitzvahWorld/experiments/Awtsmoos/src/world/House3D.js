// B"H
/** House3D: three walls, a pitched roof, and triangle gables fitted to the roof. */
export function createHouseDefs() {
  const x = 15.4, z = -20.4, yaw = -.18;
  return [
    wall('Awtsmoos-house-back-wall', x, 1.35, z - 2.6, 6.2, 2.7, .35, yaw),
    wall('Awtsmoos-house-left-wall', x - 3.1, 1.35, z, .35, 2.7, 5.4, yaw),
    wall('Awtsmoos-house-right-wall', x + 3.1, 1.35, z, .35, 2.7, 5.4, yaw),
    roof('Awtsmoos-house-roof-left-slope', x - 1.55, 3.15, z, 3.55, .30, 6.05, yaw, .55),
    roof('Awtsmoos-house-roof-right-slope', x + 1.55, 3.15, z, 3.55, .30, 6.05, yaw, -.55),
    gable('Awtsmoos-house-front-roof-triangle', x, 3.02, z + 2.88, 6.25, 1.35, .30, yaw),
    gable('Awtsmoos-house-back-roof-triangle', x, 3.02, z - 2.88, 6.25, 1.35, .30, yaw),
  ];
}
function wall(id, x, y, z, sx, sy, sz, yaw) { return box(id, '#6b4630', x, y, z, sx, sy, sz, yaw, {}, false); }
function roof(id, x, y, z, sx, sy, sz, yaw, roll) { return box(id, '#8a552b', x, y, z, sx, sy, sz, yaw, { z: roll }, false); }
function gable(id, x, y, z, sx, sy, sz, yaw) { return { id, shape: 'triPrism', solid: true, walkable: false, color: '#7a4823', position: { x, y, z }, size: { x: sx, y: sy, z: sz }, yaw, rotation: { y: yaw } }; }
function box(id, color, x, y, z, sx, sy, sz, yaw = 0, rotation = {}, walkable = false) { return { id, shape: 'box', solid: true, walkable, color, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, yaw, rotation: { y: yaw, ...rotation } }; }
