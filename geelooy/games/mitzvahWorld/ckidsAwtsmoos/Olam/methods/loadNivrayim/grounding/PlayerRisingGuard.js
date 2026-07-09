// B"H
/**
 * @file PlayerRisingGuard.js
 * @description Runtime grounding must not crush the jump arc before real landing.
 */
const MIN_JUMP_AIR_MS = 420;

export function hardGroundSkipReason(entity) {
  const vy = Number(entity?.velocity?.y || 0);
  if (vy > 0.05) return "ascending";
  if (Date.now() < Number(entity?.__jumpAirborneUntil || 0)) return "airborne-lock";
  if (entity?.jumped && Date.now() - Number(entity.__jumpStartedAt || 0) < MIN_JUMP_AIR_MS) return "fresh-jump";
  if (entity?.jumped && !entity?.onFloor && vy > -0.35) return "jump-crest";
  return null;
}

export function isRisingEntity(entity) {
  return Boolean(hardGroundSkipReason(entity));
}
