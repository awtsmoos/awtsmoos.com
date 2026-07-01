// B"H
import { GROUNDING_SYSTEM, numberOr } from "./FootGroundConstants.js?v=player-visible-above-ground-20260701-bh5";
import { playerVisualRoots, sealLowestVisibleToWorldY, targetModelLocalY } from "./ModelFootProbe.js?v=player-visible-above-ground-20260701-bh5";
import { enforceCapsuleFootContract } from "./CapsuleFootContract.js?v=player-visible-above-ground-20260701-bh5";
import { buildPlayerGroundingDiagnostic } from "./PlayerGroundingDiagnostics.js?v=player-visible-above-ground-20260701-bh5";
/**
 * Purpose: bind the capsule foot, moving root, and rendered soles to one height.
 * Owner: live Chossid physics.js wrapper.
 * Inputs: player collider, ground hit, visual model root.
 * Outputs: synced root/model transforms and grounding diagnostics.
 * Runtime authority: final visible-player Y writer after physics each frame.
 * Update order: capsule contract -> root sync -> model placement -> live sole seal.
 * Callers: VisualGroundClamp from physics.js and split visual runtime.
 * Invariants: rendered lowest visible point must equal capsule foot Y.
 * Failure modes: missing geometry waits without inventing offsets.
 */
function currentGroundY(player) {
  const hit = player?.__meshGroundAuthority || player?.groundHitResult || null;
  const y = hit?.groundY ?? hit?.position?.y ?? hit?.point?.y;
  return Number.isFinite(Number(y)) ? Number(y) : null;
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
  const seal = sealLowestVisibleToWorldY(root, player.mesh.position.y);
  root.userData.visualGroundOffsetY = root.parent === player.mesh ? root.position.y : root.position.y - player.mesh.position.y;
  root.userData.latestVisibleGroundSeal = seal;
  player.__lastWriterOfModelY = GROUNDING_SYSTEM;
}
export function applyPlayerFootGrounding(player) {
  if (!player?.mesh?.position) return { lifted:false, lift:0, targets:0 };
  enforceCapsuleFootContract(player, currentGroundY(player));
  syncRoot(player);
  const roots = playerVisualRoots(player);
  roots.forEach(root => syncModel(player, root));
  player.emptyCopy?.position?.copy?.(player.mesh.position);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh.position);
  player.__lastVisualGroundClamp = buildPlayerGroundingDiagnostic(player);
  return { lifted:false, lift:0, targets:roots.length, diagnostic:player.__lastVisualGroundClamp };
}
