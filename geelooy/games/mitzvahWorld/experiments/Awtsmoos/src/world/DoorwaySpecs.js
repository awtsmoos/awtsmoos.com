// B"H
/** One doorway covenant: wall cutout and living door share exact dimensions. */
export const TALL_DOORWAY_SPEC = Object.freeze({
  id: 'tall-dynamic-doorway-wall', color: '#654538', position: { x: -5.5, y: 2.1, z: -20.6 },
  size: { x: 8.7, y: 4.2, z: .72 }, yaw: .04, door: { x: 2.75, y: 3.08 }, doorThickness: .24,
});
export function tallDoorwayWallDef() {
  const s = TALL_DOORWAY_SPEC;
  return { id: s.id, shape: 'doorway', solid: true, walkable: false, color: s.color, position: { ...s.position }, size: { ...s.size }, door: { ...s.door }, yaw: s.yaw, rotation: { y: s.yaw } };
}
export function tallDoorDef() {
  const s = TALL_DOORWAY_SPEC, floorY = s.position.y - s.size.y / 2;
  return { id: 'tall-hinged-door', position: { x: s.position.x, y: 0, z: s.position.z }, yaw: s.yaw, width: s.door.x, height: s.door.y, thickness: s.doorThickness, centerY: floorY + s.door.y / 2, depth: 0, opening: { width: s.door.x, height: s.door.y, wall: s.id } };
}
