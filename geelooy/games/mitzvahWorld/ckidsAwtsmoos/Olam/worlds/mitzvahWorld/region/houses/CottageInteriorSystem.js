// B"H
/**
 * Interior geometry: visible floor, visible room, no fake wall-collider trap.
 *
 * The Awtsmoos lets the cottage have an inside without letting the floor be
 * mistaken for a horizontal wall that pushes the player away from the door.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const mat = color => new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true });
function box(name, size, pos, color, data = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, data, { cottageInterior:true, opacitySealed:true });
  return mesh;
}
export function addCottageInterior(group, house = {}, spec = {}, colliders = []) {
  const w = spec.width || 6.2, d = spec.depth || 5.4, h = spec.height || 3.2, id = house.id || "house";
  group.add(box(`cottage_${id}_interior_floor`, [w - .36, .12, d - .36], [0, .07, 0], 0xb78958, { cottageInteriorFloor:true, floorSurface:true, visualOnly:true }));
  group.add(box(`cottage_${id}_interior_back_wall`, [w - .42, h - .42, .08], [0, h / 2, -d / 2 + .18], 0xf0d7aa, { visualOnly:true }));
  group.add(box(`cottage_${id}_interior_left_wall`, [.08, h - .42, d - .42], [-w / 2 + .18, h / 2, 0], 0xe9c999, { visualOnly:true }));
  group.add(box(`cottage_${id}_interior_right_wall`, [.08, h - .42, d - .42], [w / 2 - .18, h / 2, 0], 0xe9c999, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_table`, [1.15, .18, .72], [-1.25, .84, -.9], 0x7a4b25, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_table_leg_a`, [.13, .72, .13], [-1.68, .42, -1.16], 0x5b351a, { visualOnly:true }));
  group.add(box(`cottage_${id}_inner_table_leg_b`, [.13, .72, .13], [-.82, .42, -.64], 0x5b351a, { visualOnly:true }));
  colliders.push({ id:`${id}_interior_floor_collider`, category:"cottage-floor", owner:id, position:[0, .06, 0], size:[w - .36, .12, d - .36], yaw:0, solid:false, floor:true });
}
export default addCottageInterior;
