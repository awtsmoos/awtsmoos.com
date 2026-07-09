// B"H
/** @file MultiRoomHouseMeshes.js @description Small visual labels/thresholds for real rooms. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const mat = new THREE.MeshLambertMaterial({ color:0x8f6135 });

export function addRoomThresholds(group, house = {}, spec = {}, plan = {}) {
  const d = Number(spec.depth || 8), w = Number(spec.width || 9);
  const thresholdA = new THREE.Mesh(new THREE.BoxGeometry(1.65, .08, .28), mat);
  thresholdA.name = `${house.id || "house"}_interior_doorway_threshold_a`;
  thresholdA.position.set(0, .12, -d * .12);
  const thresholdB = new THREE.Mesh(new THREE.BoxGeometry(.28, .08, 1.45), mat);
  thresholdB.name = `${house.id || "house"}_interior_doorway_threshold_b`;
  thresholdB.position.set(w * .22, .13, d * .02);
  [thresholdA, thresholdB].forEach(mesh => Object.assign(mesh.userData ||= {}, { cottageInterior:true, interiorDoorway:true, visualOnly:true, skipOctree:true, noOctree:true, roomCount:plan.roomCount || 0 }));
  group.add(thresholdA, thresholdB);
}

export default addRoomThresholds;
