// B"H
/**
 * @file MouseRaycastTargets.js
 * @description Explicit interaction target registry. It resolves owners through
 * parent chains and returns only finite proxy leaves, never decorative visuals.
 */
import { collectSafeRaycastLeaves } from "./RaycastSafety.js?v=reality-raycast-20260629-bh1";

export function targetFor(nivra) {
  return nivra?.raycastMesh || nivra?.interactionMesh || nivra?.mesh || nivra?.modelMesh || null;
}

export function ownerFromHit(hit) {
  let cursor = hit?.object || null;
  while (cursor) {
    const data = cursor.userData || {};
    if (cursor.nivraAwtsmoos) return cursor.nivraAwtsmoos;
    if (data.combatTargetOwner) return data.combatTargetOwner;
    if (data.ownerNpc?.nivraAwtsmoos) return data.ownerNpc.nivraAwtsmoos;
    if (data.ownerNpc) return data.ownerNpc;
    cursor = cursor.parent;
  }
  return null;
}

export function finitePayload(payload = {}) {
  const x = payload.clientX ?? payload.x;
  const y = payload.clientY ?? payload.y;
  return Number.isFinite(Number(x)) && Number.isFinite(Number(y));
}

export function raycastTargets(olam, mode = "interaction") {
  const roots = [];
  for (const nivra of olam?.interactableNivrayim || []) {
    const root = targetFor(nivra);
    if (root) roots.push(root);
  }
  return roots.flatMap(root => collectSafeRaycastLeaves(root, mode, true));
}
