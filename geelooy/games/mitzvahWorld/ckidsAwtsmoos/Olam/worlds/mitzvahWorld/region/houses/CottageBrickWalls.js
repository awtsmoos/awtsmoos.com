// B"H
/** Wall layout: the door gap is collision truth, not decorative fiction. */
import { pos, wallPiece, wallCollider } from "./CottageBrickPrimitives.js";
function frontWall(group, house, spec, colliders) {
  const { width, depth, height, doorWidth, doorHeight, brick } = spec, z = depth / 2, thick = brick[2];
  const sideW = Math.max(.2, (width - doorWidth) / 2), sideX = doorWidth / 2 + sideW / 2, lintelH = Math.max(.2, height - doorHeight), lintelY = doorHeight + lintelH / 2;
  [["left_door_jamb", [sideW, doorHeight, thick], pos(-sideX, doorHeight / 2, z)], ["right_door_jamb", [sideW, doorHeight, thick], pos(sideX, doorHeight / 2, z)], ["lintel_wall", [width, lintelH, thick], pos(0, lintelY, z)]].forEach(([name, size, p]) => { wallPiece(group, house, "front", name, size, p); colliders.push(wallCollider(house, "front", name, size, p, 0, { doorOpening:true })); });
}
function solidWall(group, house, side, spec, colliders) {
  const { width, depth, height, brick } = spec, left = side === "left", right = side === "right", back = side === "back";
  const x = right ? width / 2 : left ? -width / 2 : 0, z = back ? -depth / 2 : 0, yaw = left || right ? Math.PI / 2 : 0, p = pos(x, height / 2, z);
  wallPiece(group, house, side, "single_textured_wall", left || right ? [depth, height, brick[2]] : [width, height, brick[2]], p, yaw);
  colliders.push(wallCollider(house, side, "single_wall", left || right ? [.32, height, depth] : [width, height, .32], p, yaw));
}
export function addCottageWalls(group, house, spec, colliders) { ["front", "back", "left", "right"].forEach(side => side === "front" ? frontWall(group, house, spec, colliders) : solidWall(group, house, side, spec, colliders)); }
