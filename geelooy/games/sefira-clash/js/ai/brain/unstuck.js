/**
 * B"H
 * Final NPC self-preservation locomotive with unconditional lip rescue.
 *
 * Chapter 290: the ledge is now treated as fire. If a bot is slow beside any
 * platform lip, it does not matter whether it is attacking, choosing, waiting,
 * or confused. The attack is cancelled, a rescue mode is chosen, and the body
 * is forced into jump/drop/repath until the lip no longer holds it.
 */
export function applyUnstuckLocomotion(bot, world, out, intent) {
  bot.ai.escape ||= emptyEscape();
  tickEscape(bot.ai.escape);
  const lip = lipJam(bot, world);
  if (lip) cancelLedgeAttack(bot);
  if (bot.ai.escape.t <= 0 && shouldStartEscape(bot, world, out, intent, lip)) bot.ai.escape = chooseEscape(bot, world, intent, lip);
  if (bot.ai.escape.t > 0) driveEscape(bot, world, out);
  else guaranteeUsefulMotion(bot, world, out, intent, lip);
  rememberOutput(bot, out);
  return out;
}

function shouldStartEscape(bot, world, out, intent, lip) {
  if (bot.grabbedBy || bot.stun > 0) return false;
  if (lip) return true;
  if (ledgeTrap(bot, world) || wallBlocked(bot, world)) return true;
  if (idleWhileUseful(bot, out)) return true;
  return bot.ai.stuck > 14 || bot.ai.dither > 8 || bot.ai.routeFail > 24 || intent === 'route' && bot.ai.zeroOutput > 5;
}

function chooseEscape(bot, world, intent, lip) {
  if (lip) return escapeLip(bot, lip);
  const ledge = ledgeTrap(bot, world);
  const below = ledge ? safePlatformBelow(bot, world) : null;
  if (ledge && below) return { t: 58, mode: 'drop', dir: toward(below.x + below.w / 2, bot.x), jumpAt: 0, dropAt: 1, airJumpAt: 0 };
  if (ledge) return { t: 70, mode: 'jump', dir: inwardDirection(bot, world), jumpAt: 1, dropAt: 0, airJumpAt: 16 };
  if (wallBlocked(bot, world)) return { t: 78, mode: 'wall', dir: toward(world.wall.escapeX, bot.x), jumpAt: world.wall.escapeY < bot.y - 80 ? 2 : 0, dropAt: 0, airJumpAt: 18 };
  return escapeRoute(bot, world);
}

function escapeLip(bot, lip) {
  if (lip.kind === 'topEdge' && lip.safeBelow) return { t: 46, mode: 'lipDrop', dir: lip.dropDir, jumpAt: 0, dropAt: 1, airJumpAt: 0, lip };
  return { t: 82, mode: 'lipClimb', dir: lip.climbDir, jumpAt: 1, dropAt: 0, airJumpAt: 12, lip };
}

function escapeRoute(bot, world) {
  const dir = world.route?.targetX !== undefined ? toward(world.route.targetX, bot.x) : bot.ai.laneBias || 1;
  return { t: 54, mode: 'route', dir, jumpAt: world.route?.needsJump ? 2 : 0, dropAt: world.route?.needsDrop ? 2 : 0, airJumpAt: world.route?.needsJump ? 18 : 0 };
}

function driveEscape(bot, world, out) {
  const e = bot.ai.escape;
  clearFight(out);
  out.x = e.dir;
  out.aimX = e.dir;
  out.aimY = 0;
  out.y = 0;
  if (e.mode === 'drop' || e.mode === 'lipDrop') out.x = e.dir * 0.18;
  if (e.mode === 'jump' && world.safety?.inward) out.x = out.aimX = world.safety.inward;
  if (e.mode === 'lipClimb') driveLipClimb(bot, e, out);
  pulseDrop(e, out);
  pulseJump(e, out, bot);
}

function driveLipClimb(bot, e, out) {
  out.x = e.dir;
  out.aimX = e.dir;
  out.aimY = -1;
  out.y = -1;
  if (!bot.grounded && e.t % 14 === 7 && canAskJump(bot)) {
    resetJumpMemory(bot);
    out.jump = true;
  }
}

function guaranteeUsefulMotion(bot, world, out, intent, lip) {
  if (hasUsefulAction(out)) return;
  if (!bot.grounded && Math.abs(bot.vx || 0) > 0.5) return;
  clearFight(out);
  out.x = lip ? lip.climbDir : world.safety?.danger ? inwardDirection(bot, world) : fallbackDirection(bot, world, intent);
  out.aimX = Math.sign(out.x) || 1;
  if ((lip || ledgeTrap(bot, world)) && canAskJump(bot)) {
    out.jump = true;
    out.y = -1;
    resetJumpMemory(bot);
  }
}

function lipJam(bot, world) {
  const platforms = world.platforms || world.map?.platforms || [];
  let best = null;
  for (const p of platforms) {
    best = betterLip(best, lipCandidate(bot, p, -1));
    best = betterLip(best, lipCandidate(bot, p, 1));
  }
  if (!best) return null;
  const slow = Math.abs(bot.vx || 0) < 4.2;
  const stalled = bot.ai.stuck > 2 || bot.ai.edgeHover > 2 || bot.ai.dither > 4 || bot.ai.zeroOutput > 2 || Math.abs(bot.ai.lastOutputX || 0) < 0.1;
  return slow && stalled ? best : null;
}

function lipCandidate(bot, p, side) {
  const edgeX = side < 0 ? p.x : p.x + p.w;
  const dx = Math.abs(bot.x - edgeX);
  if (dx > 92) return null;
  const vertical = bot.y - p.y;
  const nearTop = vertical > -34 && vertical < 38;
  const sideFace = vertical > 20 && vertical < 230;
  const belowLip = vertical > 75 && vertical < 340;
  if (!nearTop && !sideFace && !belowLip) return null;
  const center = p.x + p.w / 2;
  const climbDir = toward(center, bot.x);
  const safeBelow = nearTop && sideSafeBelow(bot, p);
  const dropDir = side < 0 ? -1 : 1;
  const kind = nearTop ? 'topEdge' : 'sideLip';
  return { p, edgeX, dx, vertical, side, kind, climbDir, dropDir, safeBelow, score: dx + Math.abs(vertical - 35) * 0.25 };
}

function betterLip(a, b) {
  if (!b) return a;
  return !a || b.score < a.score ? b : a;
}

function sideSafeBelow(bot, p) {
  return bot.y < p.y + 42 && (bot.x < p.x + 75 || bot.x > p.x + p.w - 75);
}

function ledgeTrap(bot, world) {
  const slow = Math.abs(bot.vx || 0) < 3.3;
  const edgeDanger = !!world.safety?.danger || !!world.edge?.off || world.danger?.label === 'edge';
  return slow && edgeDanger && ((bot.ai.stuck || 0) > 4 || (bot.ai.edgeHover || 0) > 4 || Math.abs(bot.ai.lastOutputX || 0) < 0.1);
}

function safePlatformBelow(bot, world) {
  const platforms = world.platforms || world.map?.platforms || [];
  let best = null;
  for (const p of platforms) {
    const below = p.y > bot.y + 45 && p.y < bot.y + 560;
    const reachable = bot.x > p.x - 120 && bot.x < p.x + p.w + 120;
    if (below && reachable && (!best || p.y < best.y)) best = p;
  }
  return best;
}

function cancelLedgeAttack(bot) {
  bot.attack = null;
  bot.attackFrame = 0;
  bot.ai.chargePlan = null;
  bot.ai.attackCooldown = 0;
}

function pulseJump(e, out, bot) {
  if (out.jump) return;
  if (e.jumpAt > 0) {
    e.jumpAt--;
    if (e.jumpAt === 0 && canAskJump(bot)) { resetJumpMemory(bot); out.jump = true; out.y = -1; }
  }
  if (e.airJumpAt > 0) {
    e.airJumpAt--;
    if (e.airJumpAt === 0 && canAskJump(bot)) { resetJumpMemory(bot); out.jump = true; out.y = -1; }
  }
}

function pulseDrop(e, out) {
  out.down = false;
  if (e.dropAt > 0) {
    e.dropAt--;
    if (e.dropAt === 0) { out.down = true; out.y = 1; }
  }
}

function inwardDirection(bot, world) {
  if (world.safety?.inward) return world.safety.inward;
  if (world.route?.current) return toward(world.route.current.x + world.route.current.w / 2, bot.x);
  return bot.ai.laneBias || 1;
}

function fallbackDirection(bot, world, intent) {
  if (wallBlocked(bot, world)) return toward(world.wall.escapeX, bot.x);
  if (intent === 'route' && world.route?.targetX !== undefined) return toward(world.route.targetX, bot.x);
  if (world.danger?.inward) return world.danger.inward;
  return bot.ai.laneBias || 1;
}

function wallBlocked(bot, world) { return !!world.wall?.blocked && Math.abs((world.wall.escapeX ?? bot.x) - bot.x) > 36; }
function clearFight(out) { out.punch = false; out.kick = false; out.grab = false; out.special = false; out.shield = false; }
function idleWhileUseful(bot, out) { return !bot.attack && Math.abs(out.x || 0) < 0.08 && !out.jump && !out.down && !out.punch && !out.kick && !out.grab && !out.special && !out.shield; }
function hasUsefulAction(out) { return Math.abs(out.x || 0) > 0.08 || out.jump || out.down || out.punch || out.kick || out.grab || out.special || out.shield; }
function canAskJump(bot) { return bot.grounded || (bot.jumpsUsed || 0) < 2 + (bot.buffs?.doubleJump ? 1 : 0) + (bot.hatStats?.extraJump ? 1 : 0); }
function resetJumpMemory(bot) { bot.jumpMemory ||= { wasJumping: false, hold: 0 }; bot.jumpMemory.wasJumping = false; bot.jumpMemory.hold = 0; }
function rememberOutput(bot, out) { bot.ai.lastOutputX = out.x || 0; if (Math.abs(out.x || 0) > 0.1) bot.ai.laneBias = Math.sign(out.x); }
function tickEscape(e) { if (e.t > 0) e.t--; }
function toward(goal, x) { return Math.sign(goal - x) || 1; }
function emptyEscape() { return { t: 0, mode: '', dir: 1, jumpAt: 0, dropAt: 0, airJumpAt: 0 }; }
