// B"H
/**
 * @file CottageBrickWalls.js
 * @description Sealed cottage wall shell. The doorway alone is open; the attic,
 * side edges, front gable, and back gable are real visible wall meshes. No roof
 * fix can hide a missing wall, so the wall builder itself creates the gables.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=door-wall-source-fix-20260708-bh4";
import { pos, wallPiece, wallCollider, wallMaterial } from "./CottageBrickPrimitives.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const WALL_THICK = .72;
const SKIN = .18;
function push(colliders, house, side, name, size, p, yaw = 0, extra = {}) {
  colliders.push(wallCollider(house, side, name, size, p, yaw, { skin:SKIN, hardStop:true, actualSolidWall:true, ...extra }));
}
function piece(group, colliders, house, side, name, meshSize, p, colliderSize, yaw = 0, extra = {}) {
  const mesh = wallPiece(group, house, side, name, meshSize, p, yaw);
  Object.assign(mesh.userData ||= {}, extra, { sealedHouseWall:true });
  push(colliders, house, side, name, colliderSize, p, yaw, extra);
  return mesh;
}
function gable(group, house, side, name, width, rise, z, y, yaw = 0, data = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, rise);
  shape.lineTo(width / 2, 0);
  shape.lineTo(-width / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth:.34, bevelEnabled:false });
  geo.translate(0, 0, -.17);
  const mesh = new THREE.Mesh(geo, wallMaterial());
  mesh.name = `cottage_${house.id}_${side}_${name}`;
  mesh.position.set(0, y, z);
  mesh.rotation.y = yaw;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, data, {
    cottageWallSection:true,
    sealedHouseWall:true,
    sealedGableWall:true,
    texturedBrickWall:true,
    houseId:house.id,
    side,
    opacitySealed:true
  });
  group.add(mesh);
  return mesh;
}
function cap(group, house, side, name, size, p, yaw = 0, data = {}) {
  const mesh = wallPiece(group, house, side, name, size, p, yaw);
  Object.assign(mesh.userData ||= {}, data, { sealedHouseWall:true, upperWallCap:true, opacitySealed:true });
  return mesh;
}
function frontWall(group, house, spec, colliders) {
  const { width, depth, height, doorWidth, doorHeight, brick } = spec;
  const z = depth / 2;
  const thick = Math.max(WALL_THICK, brick[2] || 0);
  const sideW = Math.max(.9, (width - doorWidth) / 2);
  const sideX = doorWidth / 2 + sideW / 2;
  const lintelH = Math.max(.92, height - doorHeight + .25);
  const lintelY = doorHeight + lintelH / 2;
  piece(group, colliders, house, "front", "left_door_jamb", [sideW, height, brick[2]], pos(-sideX, height / 2, z), [sideW, height, thick], 0, { doorwaySide:"left" });
  piece(group, colliders, house, "front", "right_door_jamb", [sideW, height, brick[2]], pos(sideX, height / 2, z), [sideW, height, thick], 0, { doorwaySide:"right" });
  piece(group, colliders, house, "front", "solid_door_lintel_and_attic_band", [width, lintelH, brick[2]], pos(0, lintelY, z), [width, lintelH, thick], 0, { doorLintel:true, sealedUpperFront:true });
  gable(group, house, "front", "real_triangle_gable_wall", width + .18, Math.max(1.35, width * .28), z + .04, height - .03, 0, { frontGableWall:true, noOpenRoofEdge:true });
  cap(group, house, "front", "top_wall_ring", [width + .18, .34, brick[2] * 1.35], pos(0, height + .04, z), 0, { topWallRing:true });
}
function backWall(group, house, spec, colliders) {
  const { width, depth, height, brick } = spec;
  const z = -depth / 2;
  piece(group, colliders, house, "back", "full_outer_wall", [width, height, brick[2]], pos(0, height / 2, z), [width + WALL_THICK, height, WALL_THICK]);
  gable(group, house, "back", "real_triangle_gable_wall", width + .18, Math.max(1.35, width * .28), z - .04, height - .03, 0, { backGableWall:true, noOpenRoofEdge:true });
  cap(group, house, "back", "top_wall_ring", [width + .18, .34, brick[2] * 1.35], pos(0, height + .04, z), 0, { topWallRing:true });
}
function sideWall(group, house, side, spec, colliders) {
  const { width, depth, height, brick } = spec;
  const x = side === "right" ? width / 2 : -width / 2;
  const yaw = Math.PI / 2;
  piece(group, colliders, house, side, "full_outer_wall", [depth, height, brick[2]], pos(x, height / 2, 0), [WALL_THICK, height, depth + WALL_THICK], yaw, { sideWall:true });
  cap(group, house, side, "high_side_eave_fill", [depth + .18, .82, brick[2] * 1.35], pos(x, height + .35, 0), yaw, { sealedSideEdge:true, noOpenRoofEdge:true });
  cap(group, house, side, "top_side_wall_ring", [depth + .28, .34, brick[2] * 1.35], pos(x, height + .05, 0), yaw, { topWallRing:true });
}
export function addCottageWalls(group, house, spec, colliders) {
  frontWall(group, house, spec, colliders);
  backWall(group, house, spec, colliders);
  sideWall(group, house, "left", spec, colliders);
  sideWall(group, house, "right", spec, colliders);
  Object.assign(group.userData ||= {}, {
    sealedUpperShell:true,
    noOpenRoofEdge:true,
    realGableWalls:true,
    sourceSeal:"cottage-wall-gables-source-fix-20260708-bh4"
  });
}
export default addCottageWalls;
