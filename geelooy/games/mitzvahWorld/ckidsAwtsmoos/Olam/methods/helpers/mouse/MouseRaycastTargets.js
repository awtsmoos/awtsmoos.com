// B"H
/**
 * @file MouseRaycastTargets.js
 * @description
 * Ray target discovery for world interaction. The Awtsmoos gathers clickable
 * vessels without letting camera code know NPC internals.
 */
export function targetFor(nivra) {
  if (!nivra) return null;
  return nivra.raycastMesh
    || nivra.interactionMesh
    || nivra.mesh
    || nivra.modelMesh
    || null;
}

export function ownerFromHit(hit) {
  let cursor = hit?.object;
  while (cursor) {
    if (cursor.nivraAwtsmoos) return cursor.nivraAwtsmoos;
    cursor = cursor.parent;
  }
  return null;
}

export function finitePayload(payload = {}) {
  return Number.isFinite(Number(payload.clientX))
    && Number.isFinite(Number(payload.clientY));
}

export function raycastTargets(olam) {
  return (olam.interactableNivrayim || [])
    .map(targetFor)
    .filter(Boolean)
    .filter(mesh => !mesh.userData?.skipRaycast);
}
