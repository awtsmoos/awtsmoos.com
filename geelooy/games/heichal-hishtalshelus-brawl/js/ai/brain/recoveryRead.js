/**
 * B"H
 * Recovery-denial sensor.
 *
 * Chapter 65: the bot learns to smell exile. When an enemy is offstage, low,
 * spent on jumps, or falling, the bot sees a recovery path instead of just a
 * target. That path becomes edge-guarding, ledge trapping, and denial.
 */
export function recoveryRead(target, floor) {
  const offstage = target.x < floor.x + 80 || target.x > floor.x + floor.w - 80 || target.y > floor.y + 70;
  const jumpsMax = 2 + (target.buffs?.doubleJump ? 1 : 0);
  const noJumps = (target.jumpsUsed || 0) >= jumpsMax && !target.grounded;
  const falling = target.vy > 3;
  const low = target.y > floor.y + 120;
  const side = target.x < floor.x + floor.w / 2 ? -1 : 1;
  const ledgeX = side < 0 ? floor.x + 70 : floor.x + floor.w - 70;
  return { offstage, noJumps, falling, low, vulnerable: offstage && (noJumps || falling || low), side, ledgeX, ledgeY: floor.y };
}
