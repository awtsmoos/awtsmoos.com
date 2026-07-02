// B"H
/** @file ApplyPlayerFootGrounding.js @description Visual grounding that does not cancel real jumps. */
import { GROUNDING_SYSTEM, PLAYER_VISIBLE_BODY_CLEARANCE_Y, numberOr } from "./FootGroundConstants.js?v=no-compact-engine-20260702-bh2";
import { playerVisualRoots, sealLowestVisibleToWorldY, targetModelLocalY } from "./ModelFootProbe.js?v=no-compact-engine-20260702-bh2";
import { enforceCapsuleFootContract } from "./CapsuleFootContract.js?v=no-compact-engine-20260702-bh2";
import { buildPlayerGroundingDiagnostic } from "./PlayerGroundingDiagnostics.js?v=no-compact-engine-20260702-bh2";

function currentGroundY(player) {
  const hit = player?.__meshGroundAuthority || player?.groundHitResult || null;
  const y = hit?.groundY ?? hit?.position?.y ?? hit?.point?.y;
  return Number.isFinite(Number(y)) ? Number(y) : null;
}

function jumpRising(player) {
  const vy = numberOr(player?.velocity?.y, 0);
  return Boolean(player?.moving?.jump) || vy > 0.05 || (player?.jumped && !player?.onFloor && vy > -0.01);
}

function syncRoot(player) {
  if (!player?.mesh || !player?.collider?.start) return;
  const y = numberOr(player.collider.start.y, 0) - numberOr(player.collider.radius ?? player.radius, 0.45);
  player.mesh.position.set(player.collider.start.x, y, player.collider.start.z);
  player.mesh.rotation.y = player.rotation?.y || 0;
  player.__lastWriterOfMeshY = GROUNDING_SYSTEM;
}

function syncModel(player, root) {
  const y = targetModelLocalY(root);
  if (root.parent === player.mesh) root.position.set(0, y, 0);
  else { root.position.copy(player.mesh.position); root.position.y += y; }
  root.updateMatrixWorld?.(true);
  const visualFloor = player.mesh.position.y + PLAYER_VISIBLE_BODY_CLEARANCE_Y;
  const seal = sealLowestVisibleToWorldY(root, visualFloor);
  root.userData.visualGroundOffsetY = root.parent === player.mesh ? root.position.y : root.position.y - player.mesh.position.y;
  root.userData.latestVisibleGroundSeal = seal;
  root.userData.visualBodyClearanceY = PLAYER_VISIBLE_BODY_CLEARANCE_Y;
  player.__lastWriterOfModelY = GROUNDING_SYSTEM;
}

export function applyPlayerFootGrounding(player) {
  if (!player?.mesh?.position) return { lifted:false, lift:0, targets:0 };
  const rising = jumpRising(player);
  if (!rising) enforceCapsuleFootContract(player, currentGroundY(player));
  syncRoot(player);
  const roots = playerVisualRoots(player);
  roots.forEach(root => syncModel(player, root));
  player.emptyCopy?.position?.copy?.(player.mesh.position);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh.position);
  player.__lastVisualGroundClamp = buildPlayerGroundingDiagnostic(player);
  player.__lastVisualGroundClamp.jumpRisingSkippedCapsuleGrounding = rising;
  return { lifted:true, lift:PLAYER_VISIBLE_BODY_CLEARANCE_Y, targets:roots.length, diagnostic:player.__lastVisualGroundClamp };
}
