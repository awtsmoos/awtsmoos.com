// B"H
/** @file CottageBrickWalls.js @description Large cottage shell with a real open doorway. */
import { pos, wallPiece, wallCollider } from "./CottageBrickPrimitives.js";

const WALL_THICK = 0.72;
const SKIN = 0.18;

function push(colliders, house, side, name, size, p, extra = {}) {
  colliders.push(wallCollider(house, side, name, size, p, 0, {
    skin:SKIN,
    hardStop:true,
    actualSolidWall:true,
    ...extra
  }));
}

function piece(group, colliders, house, side, name, meshSize, p, colliderSize, extra = {}) {
  wallPiece(group, house, side, name, meshSize, p);
  push(colliders, house, side, name, colliderSize, p, extra);
}

function frontWall(group, house, spec, colliders) {
  const { width, depth, height, doorWidth, doorHeight, brick } = spec;
  const z = depth / 2;
  const thick = Math.max(WALL_THICK, brick[2] || 0);
  const sideW = Math.max(0.9, (width - doorWidth) / 2);
  const sideX = doorWidth / 2 + sideW / 2;
  const lintelH = Math.max(0.65, height - doorHeight);
  const lintelY = doorHeight + lintelH / 2;
  piece(group, colliders, house, "front", "left_door_jamb", [sideW, height, brick[2]], pos(-sideX, height / 2, z), [sideW, height, thick], { doorwaySide:"left" });
  piece(group, colliders, house, "front", "right_door_jamb", [sideW, height, brick[2]], pos(sideX, height / 2, z), [sideW, height, thick], { doorwaySide:"right" });
  piece(group, colliders, house, "front", "door_lintel", [width, lintelH, brick[2]], pos(0, lintelY, z), [width, lintelH, thick], { doorLintel:true });
}

function solidWall(group, house, side, spec, colliders) {
  const { width, depth, height, brick } = spec;
  const sideWall = side === "left" || side === "right";
  const x = side === "right" ? width / 2 : side === "left" ? -width / 2 : 0;
  const z = side === "back" ? -depth / 2 : 0;
  const yaw = sideWall ? Math.PI / 2 : 0;
  const p = pos(x, height / 2, z);
  const meshSize = sideWall ? [depth, height, brick[2]] : [width, height, brick[2]];
  const colliderSize = sideWall ? [WALL_THICK, height, depth + WALL_THICK] : [width + WALL_THICK, height, WALL_THICK];
  wallPiece(group, house, side, "full_outer_wall", meshSize, p, yaw);
  push(colliders, house, side, "full_outer_wall", colliderSize, p);
}

/** Adds only the outer shell. Interior partitions live in CottageInteriorSystem. */
export function addCottageWalls(group, house, spec, colliders) {
  frontWall(group, house, spec, colliders);
  solidWall(group, house, "back", spec, colliders);
  solidWall(group, house, "left", spec, colliders);
  solidWall(group, house, "right", spec, colliders);
}

export default addCottageWalls;
