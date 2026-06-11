// B"H
/**
 * @file playerCapsuleBox.js
 * @description Chapter 59: the player's moving-solid body is a tight runtime
 * vessel, not the generous static capsule. This removes invisible shove buffer
 * while preserving stable feet and vertical support.
 */

/** @param {object} player Chossid-like actor. @returns {object|null} Position. */
export function playerPosition(player) {
  return player?.mesh?.position || player?.modelMesh?.position || null;
}

/** @param {object} player Chossid-like actor. @returns {number} Runtime radius. */
export function playerVerticalRadius(player) {
  return Number(player?.radius) || Number(player?.collider?.radius) || 0.45;
}

/** @param {object} player Chossid-like actor. @returns {number} Tight X/Z radius. */
export function playerSolidRadius(player) {
  const authored = Number(player?.dynamicSolidRadius || player?.movingSolidRadius);
  if (Number.isFinite(authored) && authored > 0) return authored;
  return Math.max(0.24, playerVerticalRadius(player) * 0.58);
}

/** @param {object} player Chossid-like actor. @returns {number} Foot Y. */
export function currentFeetY(player) {
  const radius = playerVerticalRadius(player);
  if (player?.collider?.start) return player.collider.start.y - radius;
  return (playerPosition(player)?.y || 0) - radius;
}

/** @param {object} player Chossid-like actor. @returns {object|null} Tight AABB. */
export function playerAabb(player) {
  const pos = playerPosition(player);
  if (!pos) return null;
  const xz = playerSolidRadius(player);
  const yRadius = playerVerticalRadius(player);
  const startY = player?.collider?.start?.y ?? pos.y + yRadius;
  const endY = player?.collider?.end?.y ?? pos.y + Number(player?.height || 1.7);
  return {
    minX: pos.x - xz,
    maxX: pos.x + xz,
    minY: Math.min(startY, endY) - yRadius,
    maxY: Math.max(startY, endY) + yRadius,
    minZ: pos.z - xz,
    maxZ: pos.z + xz
  };
}

/** @param {object} player Chossid-like actor. @param {object} delta Translation. */
export function translatePlayer(player, delta) {
  player?.collider?.start?.add?.(delta);
  player?.collider?.end?.add?.(delta);
}

/** @param {object} player Chossid-like actor. @param {number} topY Target feet Y. */
export function snapFeetToTop(player, topY) {
  const radius = playerVerticalRadius(player);
  if (!player?.collider?.start || !player?.collider?.end) return;
  const lift = topY + radius - player.collider.start.y;
  player.collider.start.y += lift;
  player.collider.end.y += lift;
}

/** @param {object} player Chossid-like actor. */
export function syncPlayerVisuals(player) {
  if (!player?.collider?.start) return;
  const radius = playerVerticalRadius(player);
  player.mesh?.position?.copy?.(player.collider.start);
  if (player.mesh) player.mesh.position.y -= radius;
  if (player.modelMesh && player.mesh) {
    if (player.modelMesh.parent === player.mesh) player.modelMesh.position.set(0, Number(player.modelMesh.userData?.visualGroundOffsetY || 0), 0);
    else player.modelMesh.position.copy(player.mesh.position);
  }
  const visual = player.mesh?.position || player.modelMesh?.position;
  player.emptyCopy?.position?.copy?.(visual);
  player.nonRotatingEmptyForMovement?.position?.copy?.(visual);
}
