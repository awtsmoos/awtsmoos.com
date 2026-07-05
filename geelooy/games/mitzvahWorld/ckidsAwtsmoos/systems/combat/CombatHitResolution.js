// B"H
/** @file CombatHitResolution.js @description Deterministic-ish proofable hit windows. */
export function resolveRetaliationHit(target, rule, distance) {
  const range = Number(rule?.range || 2.5);
  const inRange = Number(distance) <= range;
  const seed = String(target?.name || target?.mesh?.name || "").length + Number(target?.userData?.motion?.seed || 0);
  const dodged = Boolean(rule?.canDodge && seed % 5 === 0);
  return { inRange, dodged, range, damage:inRange && !dodged ? Number(rule?.damage || 0) : 0 };
}

export default { resolveRetaliationHit };
