// B"H
/**
 * B"H
 *
 * Movement proof keeps the player's body honest: Q and E strafe in opposite
 * directions, jump rises cleanly, and snap-down does not steal the ascent.
 */
import { summarizeMovementProof } from "./MitzvahProofDiagnostics.js?v=movement-snap-detector-20260705-bh1";
import { cloneVec, n, player, sleep } from "./ProofCommon.js?v=animal-realism-split-20260705-bh1";

export async function proveMovement(olam) {
  const p = player(olam);
  if (!p?.mesh) return { ok:false, reason:"no-player" };
  const start = cloneVec(p.mesh.position);
  const yaw = n(p.rotation?.y || p.mesh?.rotation?.y);
  const leftAxis = { x:-Math.cos(yaw), z:Math.sin(yaw) };
  function lateralDelta(from, to) { return (to.x - from.x) * leftAxis.x + (to.z - from.z) * leftAxis.z; }
  olam.ayshPeula("keydown", { code:"KeyQ", source:"proof-movement" });
  await sleep(520);
  olam.ayshPeula("keyup", { code:"KeyQ", source:"proof-movement" });
  const afterQ = cloneVec(p.mesh.position);
  await sleep(120);
  olam.ayshPeula("keydown", { code:"KeyE", source:"proof-movement" });
  await sleep(520);
  olam.ayshPeula("keyup", { code:"KeyE", source:"proof-movement" });
  const afterE = cloneVec(p.mesh.position);
  let maxY = n(p.mesh.position.y), samples = [];
  olam.ayshPeula("keydown", { code:"Space", source:"proof-movement" });
  await sleep(80);
  olam.ayshPeula("keyup", { code:"Space", source:"proof-movement" });
  for (let i = 0; i < 12; i++) {
    await sleep(80);
    maxY = Math.max(maxY, n(p.mesh.position.y));
    samples.push({ y:n(p.mesh.position.y), vy:n(p.velocity?.y), onFloor:Boolean(p.onFloor) });
  }
  const qLeft = lateralDelta(start, afterQ);
  const eRight = lateralDelta(afterQ, afterE);
  const jumpRise = maxY - Math.max(n(start.y), n(afterE.y));
  return { ok:qLeft > 0.08 && eRight < -0.08 && jumpRise > 0.35, start, afterQ, afterE, qLeft, eRight, jumpRise, maxY, ...summarizeMovementProof({ qLeft, eRight, jumpRise, samples }), jumpProof:p.__lastJumpProof || null, samples, movementTrace:(olam.__movementTrace || []).slice(-12) };
}

export default proveMovement;
