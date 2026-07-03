// B"H
/** @file PlayerCollisionFlags.js @description Explicit flags only; stale test skips cannot erase houses. */
export function collisionFlags(olam) {
  return olam?.baseInfo?.testWorldFlags || olam?.baseInfo || {};
}

export function houseCollisionDisabled(olam) {
  const flags = collisionFlags(olam);
  return flags.skipHouseCollision === true && flags.forceHouseCollision !== true;
}
