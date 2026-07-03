// B"H
/** @file PlayerRisingGuard.js @description Hard grounding may not crush a real jump. */
export function isRisingEntity(entity) {
  const vy = Number(entity?.velocity?.y || 0);
  return vy > 0.05 || Boolean(entity?.jumped && !entity?.onFloor && vy > -0.01);
}
