
/**
 * B"H
 * @file ChossidNpcTransform.js
 * @description
 * Applies identity and transform to cloned chossid.glb NPCs.
 */

/**
 * B"H
 * Reads a vec3 array safely.
 *
 * @param {any} value
 * Possible vector array.
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
 * Applies NPC definition to a chossid clone.
 *
 * @param {Object} npc
 * Chossid Object3D clone.
 *
 * @param {Object} def
 * NPC definition.
 *
 * @returns {Object}
 * Same NPC.
 */
export function applyChossidNpcTransform(npc, def) {
  const position = vec3(def.position, [0, 0, 0]);
  const rotation = vec3(def.rotation, [0, 0, 0]);
  const scale = def.scale ?? 1;

  npc.name = def.id || "chossid_npc";

  npc.position.set(
    position[0] ?? 0,
    position[1] ?? 0,
    position[2] ?? 0
  );

  npc.rotation.set(
    rotation[0] ?? 0,
    rotation[1] ?? 0,
    rotation[2] ?? 0
  );

  if (Array.isArray(scale)) {
    npc.scale.set(scale[0] ?? 1, scale[1] ?? 1, scale[2] ?? 1);
  } else {
    npc.scale.setScalar(scale || 1);
  }

  npc.userData.isNpc = true;
  npc.userData.nefeshType = "chossidNpc";
  npc.userData.nefeshId = npc.name;
  npc.userData.displayName = def.displayName || npc.name;
  npc.userData.interactable = true;
  npc.userData.sourceModel = "https://models-3122d.web.app/chossid.glb";

  npc.traverse(child => {
    if (!child) return;
    child.userData.ownerNpc = npc.name;
  });

  return npc;
}
