/**
 * B"H
 * Threat vision.
 *
 * Chapter 151: a real fighter feels danger from enemy hands and from the arena
 * itself. Hazard circles now bend the same instinct that dodges a charged fist.
 */
export function threatVision(bot, world) {
  const t = world.target;
  const dx = t.x - bot.x;
  const dy = t.y - bot.y;
  const facingDanger = Math.sign(dx || 1) === (t.face || 1) ? chargeDanger(t) : 0;
  const attackDanger = t.attack || t.rapidAttack ? 55 : 0;
  const hazardDanger = world.hazard?.danger || 0;
  const close = Math.max(0, 220 - Math.abs(dx)) * 0.22 + Math.max(0, 160 - Math.abs(dy)) * 0.18;
  const front = dx * (bot.face || 1) > 0 ? close + attackDanger + facingDanger : close * 0.45;
  const behind = dx * (bot.face || 1) < 0 ? close + attackDanger * 0.35 : close * 0.25;
  const above = dy < -45 ? close + Math.abs(t.vy || 0) * 7 : 0;
  const below = dy > 55 ? close * 0.45 + Math.abs(t.vy || 0) * 2 : 0;
  const safestX = hazardDanger > 10 ? hazardEscape(bot, world) : safestSide(front, behind, dx, bot.face || 1);
  return { front, behind, above, below, hazard: hazardDanger, charge: facingDanger, attack: attackDanger, panic: Math.max(front, behind, above, hazardDanger) > 95, safestX };
}

function hazardEscape(bot, world) {
  const h = world.hazard;
  return Math.sign(bot.x - h.x || world.target.x - bot.x || 1);
}

function chargeDanger(f) {
  const punch = f.charge?.punch || 0;
  const kick = f.charge?.kick || 0;
  const glow = (f.chargeGlow || 0) * 80;
  return Math.max(punch, kick, glow) * 1.9;
}

function safestSide(front, behind, dx, face) {
  if (front > behind + 22) return -face;
  if (behind > front + 22) return face;
  return -Math.sign(dx || face || 1);
}
