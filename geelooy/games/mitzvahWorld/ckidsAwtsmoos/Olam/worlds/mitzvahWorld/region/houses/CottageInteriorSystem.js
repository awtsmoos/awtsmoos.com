// B"H
/** @file CottageInteriorSystem.js @description Visible rooms, floor, partitions, and walkable openings. */
import * as THREE from "/games/scripts/build/three.module.js";

const mat = color => new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true });
const PARTITION_THICK = 0.16;

function box(name, size, position, color, data = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, data, { cottageInterior:true, opacitySealed:true });
  return mesh;
}

function collider(colliders, house, id, position, size, extra = {}) {
  colliders.push({
    id:`${house.id}_${id}_collider`,
    category:"cottage-room-wall",
    owner:house.id,
    position,
    size,
    yaw:0,
    solid:true,
    static:true,
    skin:0.08,
    interiorPartition:true,
    ...extra
  });
}

function partitionAcrossWidth(group, house, spec, colliders) {
  const w = spec.width, h = spec.height, z = -spec.depth * 0.12, gap = Math.max(1.55, spec.doorWidth * 0.96);
  const sideW = (w - gap) / 2 - 0.28;
  const y = h / 2;
  const leftX = -gap / 2 - sideW / 2;
  const rightX = gap / 2 + sideW / 2;
  group.add(box(`${house.id}_room_partition_left`, [sideW, h - 0.42, PARTITION_THICK], [leftX, y, z], 0xd8b680, { interiorWall:true, visibleRoomWall:true }));
  group.add(box(`${house.id}_room_partition_right`, [sideW, h - 0.42, PARTITION_THICK], [rightX, y, z], 0xd8b680, { interiorWall:true, visibleRoomWall:true }));
  collider(colliders, house, "room_partition_left", [leftX, y, z], [sideW, h - 0.42, PARTITION_THICK]);
  collider(colliders, house, "room_partition_right", [rightX, y, z], [sideW, h - 0.42, PARTITION_THICK]);
}

function partitionDepth(group, house, spec, colliders) {
  const d = spec.depth, h = spec.height, x = spec.width * 0.22, gap = 1.55;
  const frontLen = d * 0.36, backLen = d * 0.28;
  const y = h / 2;
  const frontZ = d * 0.19;
  const backZ = -d * 0.34;
  group.add(box(`${house.id}_side_room_front_partition`, [PARTITION_THICK, h - 0.55, frontLen], [x, y, frontZ], 0xcfaa74, { interiorWall:true, visibleRoomWall:true }));
  group.add(box(`${house.id}_side_room_back_partition`, [PARTITION_THICK, h - 0.55, backLen], [x, y, backZ], 0xcfaa74, { interiorWall:true, visibleRoomWall:true }));
  collider(colliders, house, "side_room_front_partition", [x, y, frontZ], [PARTITION_THICK, h - 0.55, frontLen]);
  collider(colliders, house, "side_room_back_partition", [x, y, backZ], [PARTITION_THICK, h - 0.55, backLen], { interiorDoorGap:gap });
}

function props(group, id) {
  group.add(box(`cottage_${id}_inner_table`, [1.35, .2, .85], [-1.85, .86, -1.35], 0x7a4b25, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_table_leg_a`, [.14, .72, .14], [-2.35, .43, -1.67], 0x5b351a, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_table_leg_b`, [.14, .72, .14], [-1.35, .43, -1.03], 0x5b351a, { visualOnly:true }));
  group.add(box(`cottage_${id}_bed`, [1.75, .35, 1.05], [-3.05, .25, -2.75], 0x6f4826, { visualOnly:true }));
  group.add(box(`cottage_${id}_bed_roll`, [1.55, .18, .8], [-3.05, .55, -2.75], 0x4f8fb6, { visualOnly:true }));
  group.add(box(`cottage_${id}_storage_chest`, [1.05, .55, .58], [2.95, .34, -2.85], 0x6b3f1d, { visualOnly:true }));
}

export function addCottageInterior(group, house = {}, spec = {}, colliders = []) {
  const w = spec.width || 10, d = spec.depth || 8, h = spec.height || 4, id = house.id || "house";
  group.add(box(`cottage_${id}_interior_floor`, [w - .42, .14, d - .42], [0, .07, 0], 0xb78958, { cottageInteriorFloor:true, floorSurface:true, visualOnly:true }));
  group.add(box(`cottage_${id}_inner_back_finish`, [w - .58, h - .5, .08], [0, h / 2, -d / 2 + .22], 0xf0d7aa, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_left_finish`, [.08, h - .5, d - .58], [-w / 2 + .22, h / 2, 0], 0xe9c999, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_right_finish`, [.08, h - .5, d - .58], [w / 2 - .22, h / 2, 0], 0xe9c999, { visualOnly:true }));
  partitionAcrossWidth(group, house, { ...spec, width:w, depth:d, height:h }, colliders);
  partitionDepth(group, house, { ...spec, width:w, depth:d, height:h }, colliders);
  props(group, id);
  colliders.push({ id:`${id}_interior_floor_collider`, category:"cottage-floor", owner:id, position:[0, .06, 0], size:[w - .42, .12, d - .42], yaw:0, solid:false, floor:true, octreeFloorProxy:true });
}

export default addCottageInterior;
