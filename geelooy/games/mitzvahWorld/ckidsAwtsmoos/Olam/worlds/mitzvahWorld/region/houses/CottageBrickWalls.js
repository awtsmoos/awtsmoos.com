// B"H
/** Wall layout: forgiving solid outside, truthful doorway, no clip-through. */
import { pos, wallPiece, wallCollider } from "./CottageBrickPrimitives.js";
const WALL_THICK = .92;
const SKIN = .32;
function push(colliders, house, side, name, size, p, extra = {}) {
  colliders.push(wallCollider(house, side, name, size, p, 0, { skin:SKIN, hardStop:true, actualSolidWall:true, ...extra }));
}
function frontWall(group, house, spec, colliders) {
  const { width, depth, height, doorWidth, doorHeight, brick } = spec;
  const z = depth / 2, thick = Math.max(WALL_THICK, brick[2] || 0);
  const sideW = Math.max(.55, (width - doorWidth) / 2), sideX = doorWidth / 2 + sideW / 2;
  const lintelH = Math.max(.5, height - doorHeight), lintelY = doorHeight + lintelH / 2;
  [["left_door_jamb", [sideW, height, brick[2]], pos(-sideX, height / 2, z), [sideW, height, thick]],
   ["right_door_jamb", [sideW, height, brick[2]], pos(sideX, height / 2, z), [sideW, height, thick]],
   ["lintel_wall", [width, lintelH, brick[2]], pos(0, lintelY, z), [width, lintelH, thick]]]
    .forEach(([name, meshSize, p, colSize]) => { wallPiece(group, house, "front", name, meshSize, p); push(colliders, house, "front", name, colSize, p, { doorOpening:true }); });
}
function solidWall(group, house, side, spec, colliders) {
  const { width, depth, height, brick } = spec;
  const left = side === "left", right = side === "right", back = side === "back";
  const x = right ? width / 2 : left ? -width / 2 : 0, z = back ? -depth / 2 : 0;
  const yaw = left || right ? Math.PI / 2 : 0, p = pos(x, height / 2, z), thick = Math.max(WALL_THICK, brick[2] || 0);
  wallPiece(group, house, side, "single_textured_wall", left || right ? [depth, height, brick[2]] : [width, height, brick[2]], p, yaw);
  push(colliders, house, side, "single_wall", left || right ? [thick, height, depth + thick] : [width + thick, height, thick], p);
}
export function addCottageWalls(group, house, spec, colliders) {
  ["front", "back", "left", "right"].forEach(side => side === "front" ? frontWall(group, house, spec, colliders) : solidWall(group, house, side, spec, colliders));
}
