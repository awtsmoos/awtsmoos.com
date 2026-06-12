// B"H
/**
 * @file cottageRecipe.js
 * @description Chapter 995: houses become instant Android vessels, not shader stalls.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const mats = new Map();
function mat(color) { if (!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({ color })); return mats.get(color); }
function box(group, color, pos, scale, rot = [0, 0, 0], name = "cottage_piece") {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat(color));
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, { villageDecor: true, skipOctree: true, noOctree: true, skipRaycast: true, fastCottage: true });
  group.add(mesh); return mesh;
}
function seal(group) {
  Object.assign(group.userData ||= {}, { cottageVisualOnly: true, colliderOwner: "VillageHouseCollider", androidSafeHouseRecipe: true, shaderlessBootSafe: true });
  group.traverse(c => Object.assign(c.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true }));
  return group;
}
function body(group) {
  box(group, 0xd9c7a3, [0, 1.06, 0], [6.3, 2.1, 4.25], [0, 0, 0], "fast_plaster_body");
  box(group, 0x5f3b20, [-3.25, 1.16, 0], [.14, 2.3, 4.45], [0, 0, 0], "left_beam");
  box(group, 0x5f3b20, [3.25, 1.16, 0], [.14, 2.3, 4.45], [0, 0, 0], "right_beam");
  box(group, 0x5f3b20, [0, 2.18, 2.24], [6.45, .16, .16], [0, 0, 0], "front_beam");
}
function roof(group) {
  box(group, 0x7f2f24, [-1.72, 2.72, 0], [3.8, .14, 4.85], [0, 0, .58], "left_roof_plane");
  box(group, 0x7f2f24, [1.72, 2.72, 0], [3.8, .14, 4.85], [0, 0, -.58], "right_roof_plane");
  box(group, 0x4a2c18, [0, 3.55, 0], [.2, .2, 4.95], [0, 0, 0], "ridge_beam");
}
function front(group) {
  box(group, 0x6b3f22, [0, .86, 2.32], [.9, 1.5, .1], [0, 0, 0], "warm_door");
  box(group, 0xbdb092, [0, .06, 2.58], [1.22, .08, .42], [0, 0, 0], "stone_threshold");
  box(group, 0x94c8ef, [-2.08, 1.34, 2.34], [.72, .62, .07], [0, 0, 0], "left_window");
  box(group, 0x94c8ef, [2.08, 1.34, 2.34], [.72, .62, .07], [0, 0, 0], "right_window");
}
function interior(group) {
  box(group, 0x8a552b, [-1.35, .55, -.85], [1.35, .16, .74], [0, 0, 0], "visible_table_inside");
  box(group, 0x74482a, [1.88, .42, -1.18], [1.45, .32, .82], [0, 0, 0], "visible_bed_inside");
  box(group, 0x7b4e2d, [-2.7, 1.02, -1.72], [.12, 1.0, 1.18], [0, 0, 0], "wall_shelf_inside");
}
export function gableHouse() {
  const group = new THREE.Group(); group.name = "gableHouse_fast_shaderless_lived_in_cottage";
  body(group); roof(group); front(group); interior(group); return seal(group);
}
