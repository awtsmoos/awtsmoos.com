
/**
 * B"H
 * @file ChossidNpcTransform.js
 * @description
 * Applies identity and transform to real chossid.glb NPCs.
 */

/**
 * B"H
 * Gets a vector array safely.
 *
 * @param {any} value
 * Possible vec3.
 *
 * @param {number[]} fallback
 * Fallback.
 *
 * @returns {number[]}
 * Vec3.
 */
function vec3(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

/**
 * B"H
 * Applies transform and userData.
 *
 * @param {any} npc
 * Chossid object.
 *
 * @param {Object} def
 * NPC definition.
 *
 * @returns {any}
 * Same NPC.
 */
export function applyChossidNpcTransform(npc, def) {
  const position = vec3(def.position, [0, 0, 0]);
  const rotation = vec3(def.rotation, [0, 0, 0]);
  const scale = def.scale ?? 1;

  npc.name = def.id || "npc_chossid";

  npc.position.set(position[0] ?? 0, position[1] ?? 0, position[2] ?? 0);
  npc.rotation.set(rotation[0] ?? 0, rotation[1] ?? 0, rotation[2] ?? 0);

  if (Array.isArray(scale)) {
    npc.scale.set(scale[0] ?? 1, scale[1] ?? 1, scale[2] ?? 1);
  } else {
    npc.scale.setScalar(scale || 1);
  }

  npc.userData.mitzvahWorldNpcRoot = true;
  npc.userData.isNpc = true;
  npc.userData.nefeshType = "chossidNpc";
  npc.userData.nefeshId = npc.name;
  npc.userData.displayName = def.displayName || npc.name;
  npc.userData.interactable = true;

  npc.traverse(child => {
    if (!child) return;

    child.userData.ownerNpc = npc.name;

    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.isNpcPart = true;
    }
  });

  return npc;
}
