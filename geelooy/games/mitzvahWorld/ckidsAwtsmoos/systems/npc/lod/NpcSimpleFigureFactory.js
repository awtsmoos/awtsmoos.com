// B"H
/**
 * B"H
 *
 * The simple NPC figure is a respectful shadow of the real chossid GLB.
 * It is not a replacement for the player's own model; it is a promise that the
 * village can speak immediately, then clothe the speaker in the full vessel
 * when nearness asks for it.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const mats = {
  coat:new THREE.MeshLambertMaterial({ color:0x171717 }),
  shirt:new THREE.MeshLambertMaterial({ color:0xf4efe2 }),
  skin:new THREE.MeshLambertMaterial({ color:0xd9a36b }),
  beard:new THREE.MeshLambertMaterial({ color:0x5b402c }),
  hat:new THREE.MeshLambertMaterial({ color:0x0b0b0b }),
  glow:new THREE.MeshBasicMaterial({ color:0xffdf7a, transparent:true, opacity:.28, depthWrite:false })
};

function part(geo, mat, name, pos, scale = 1) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.scale.setScalar(scale);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, { npcVisualLodPart:true, skipOctree:true, noOctree:true, skipRaycast:true });
  return mesh;
}

export function createNpcMidSimple(name = "npc") {
  const root = new THREE.Group();
  root.name = `${name}_npc_mid_simple_lod`;
  root.add(
    part(new THREE.CapsuleGeometry(.34, 1.25, 4, 8), mats.coat, "mid_chossid_coat", [0, 1.03, 0]),
    part(new THREE.SphereGeometry(.24, 10, 8), mats.skin, "mid_chossid_head", [0, 1.92, 0]),
    part(new THREE.CylinderGeometry(.26, .29, .24, 10), mats.hat, "mid_chossid_hat", [0, 2.18, 0]),
    part(new THREE.CylinderGeometry(.16, .22, .22, 8), mats.beard, "mid_chossid_beard", [0, 1.76, .18]),
    part(new THREE.BoxGeometry(.22, .82, .2), mats.coat, "mid_chossid_left_arm", [-.42, 1.08, 0]),
    part(new THREE.BoxGeometry(.22, .82, .2), mats.coat, "mid_chossid_right_arm", [.42, 1.08, 0])
  );
  root.userData.npcVisualTier = "mid";
  return root;
}

export function createNpcFarBlob(name = "npc") {
  const root = new THREE.Group();
  root.name = `${name}_npc_far_blob_lod`;
  root.add(
    part(new THREE.CapsuleGeometry(.22, .72, 3, 7), mats.coat, "far_chossid_body_blob", [0, .76, 0]),
    part(new THREE.SphereGeometry(.16, 8, 6), mats.skin, "far_chossid_head_blob", [0, 1.33, 0]),
    part(new THREE.CylinderGeometry(.18, .2, .12, 8), mats.hat, "far_chossid_hat_blob", [0, 1.48, 0]),
    part(new THREE.RingGeometry(.34, .42, 16), mats.glow, "far_chossid_soft_target_ring", [0, .08, 0])
  );
  root.children[root.children.length - 1].rotation.x = -Math.PI / 2;
  root.userData.npcVisualTier = "far";
  return root;
}

export default { createNpcMidSimple, createNpcFarBlob };
