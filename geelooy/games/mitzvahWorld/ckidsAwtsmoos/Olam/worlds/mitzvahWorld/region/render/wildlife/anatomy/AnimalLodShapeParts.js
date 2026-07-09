// B"H
/**
 * B"H
 *
 * LOD shape parts are the tiny bones of distant animals. They are deliberately
 * primitive and cached, but each part carries species meaning so distance does
 * not erase the creature's identity.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { animalMaterial } from "./AnimalMaterialPalette.js?compact=true&v=animal-realism-split-20260705-bh1";

function mark(mesh) {
  Object.assign(mesh.userData ||= {}, { animalLodVisual:true, wildlifeActor:true, skipRaycast:true, skipOctree:true, noOctree:true });
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}
export function sphere(name, color, scale, pos) {
  const mesh = mark(new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 8), animalMaterial(color)));
  mesh.name = name; mesh.scale.set(...scale); mesh.position.set(...pos); return mesh;
}
export function box(name, color, scale, pos) {
  const mesh = mark(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), animalMaterial(color)));
  mesh.name = name; mesh.scale.set(...scale); mesh.position.set(...pos); return mesh;
}
export function cone(name, color, radius, height, pos, rot = [0, 0, 0]) {
  const mesh = mark(new THREE.Mesh(new THREE.ConeGeometry(radius, height, 8), animalMaterial(color)));
  mesh.name = name; mesh.position.set(...pos); mesh.rotation.set(...rot); return mesh;
}
export function addLodLegs(root, s, tier) {
  const leg = s.legs;
  if (!leg) return;
  const zRows = (leg.count || 4) === 2 ? [leg.stanceZ || .08] : [leg.stanceZ || .24, -(leg.stanceZ || .24)];
  for (const side of [-1, 1]) for (const z of zRows) {
    const hind = z < 0 && leg.hindScale;
    const scale = [leg.scale[0] * (tier === "far" ? 1.2 : 1), leg.scale[1] * (hind ? leg.hindScale : 1), leg.scale[2]];
    root.add(box(`${tier}_leg_${side}_${z}`, s.dark || s.color, scale, [side * (leg.stanceX || .2), scale[1] * .52, z]));
  }
}
export function addLodHeadDetails(root, s, tier) {
  const y = s.low ? .22 : .54, z = .34;
  if (s.snout) root.add(box(`${tier}_snout`, s.accent || s.color, s.snout, [0, y - .02, z + .15]));
  if (s.ears) {
    const e = s.ears.scale || [.05,.2,.035];
    if (s.ears.kind === "triangle") { root.add(cone(`${tier}_ear_l`, s.color, e[0], e[1], [-.09, y + .23, z], [0, 0, -.18])); root.add(cone(`${tier}_ear_r`, s.color, e[0], e[1], [.09, y + .23, z], [0, 0, .18])); }
    else { root.add(box(`${tier}_ear_l`, s.color, e, [-.09, y + .22, z])); root.add(box(`${tier}_ear_r`, s.color, e, [.09, y + .22, z])); }
  }
  if (s.horns) {
    const h = s.horns.scale || [.04,.2,.035];
    root.add(cone(`${tier}_horn_l`, 0xeee0b7, h[0], h[1], [-.11, y + .24, z], [0, 0, -.25]));
    root.add(cone(`${tier}_horn_r`, 0xeee0b7, h[0], h[1], [.11, y + .24, z], [0, 0, .25]));
    if (s.horns.kind === "antlers") root.add(box(`${tier}_antler_bar`, 0xeee0b7, [.28,.035,.035], [0, y + .36, z - .03]));
  }
  if (s.eyes) { root.add(sphere(`${tier}_eye_l`, s.dark || 0x050505, s.eyes.scale, [-.08, y + .06, z + .1])); root.add(sphere(`${tier}_eye_r`, s.dark || 0x050505, s.eyes.scale, [.08, y + .06, z + .1])); }
}
export function addLodTailAndWings(root, s, tier) {
  if (s.tail) { const tail = box(`${tier}_tail_${s.tail.kind}`, s.tail.kind === "flag" ? (s.accent || s.color) : s.color, s.tail.scale, [0, (s.low ? .17 : .34) + (s.tail.lift || 0), -.44]); tail.rotation.x = s.tail.kind === "bushy" ? -.22 : 0; root.add(tail); }
  if (s.wings) { root.add(box(`${tier}_wing_l`, s.color, s.wings.scale, [-.28, .4, 0])); root.add(box(`${tier}_wing_r`, s.color, s.wings.scale, [.28, .4, 0])); root.add(box(`${tier}_tail_feathers`, s.accent || s.color, [.16,.035,.18], [0, .32, -.28])); }
}
export function addLodMarkings(root, s, tier) {
  if (s.marks?.includes("whiteChest") || s.marks?.includes("softBelly") || s.marks?.includes("whiteBelly")) root.add(sphere(`${tier}_light_chest_mark`, s.accent || 0xf0e2c6, [s.chest?.[0] || .18, .035, s.chest?.[2] || .12], [0, .38, .18]));
  if (s.marks?.includes("hidePatches") || s.marks?.includes("frogSpots") || s.marks?.includes("spots")) { root.add(sphere(`${tier}_species_spot_mark`, s.dark || 0x222222, [.08,.025,.08], [-.12, s.low ? .23 : .48, .02])); root.add(sphere(`${tier}_species_spot_mark_b`, s.accent || s.dark || 0xffffff, [.07,.022,.07], [.14, s.low ? .24 : .5, -.14])); }
  if (s.marks?.includes("beak")) root.add(cone(`${tier}_beak`, 0xe1a32f, .04, .14, [0, .49, .43], [Math.PI / 2, 0, 0]));
}
