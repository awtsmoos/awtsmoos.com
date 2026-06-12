/**
 * B"H
 * Hierarchical state chooser with combat interruption.
 *
 * Chapter 7: the bot learns not to flee from a harmless thought while a target
 * stands inside its fist. The Awtsmoos orders the voices: true offstage rescue,
 * true wall or ledge escape, then close combat, then navigation. A stall may no
 * longer steal the body into jumping up and down when the opponent is hittable.
 *
 * @param {object} bot NPC fighter.
 * @param {object} world Current sensed world.
 * @param {object} stuck Stuck diagnosis.
 * @returns {string} State name for command arbitration.
 */
export function chooseState(bot, world, stuck) {
  const offstage = isOffstage(bot, world);
  const routeNeeded = !world.route.found || world.current.id !== world.goal.id;
  if (offstage) return setState(bot, recoverKind(bot, world));
  if (isHardEscape(stuck)) return setState(bot, escapeKind(stuck));
  if (world.wall.blocked) return setState(bot, 'EscapeWall');
  if (world.combat.canHitNow) return setState(bot, 'Attack');
  if (stuck.stuck) return setState(bot, escapeKind(stuck));
  if (routeNeeded) return setState(bot, navKind(world));
  return setState(bot, chaseKind(world));
}

function setState(bot, state) {
  bot.aiMind ||= {};
  if (bot.aiMind.state !== state) {
    bot.aiMind.previousState = bot.aiMind.state || 'None';
    bot.aiMind.state = state;
    bot.aiMind.stateAge = 0;
  } else bot.aiMind.stateAge = (bot.aiMind.stateAge || 0) + 1;
  return state;
}

function isHardEscape(stuck) {
  return stuck.kind === 'ledge' || stuck.kind === 'wall';
}

function isOffstage(bot, world) {
  const p = world.current.p;
  const farBelow = bot.y > p.y + 250;
  const farSide = bot.x < p.x - 210 || bot.x > p.x + p.w + 210;
  return farBelow || farSide || world.danger.score > 285;
}

function recoverKind(bot, world) {
  if (bot.y < world.current.p.y - 170) return 'RecoverHigh';
  return 'RecoverLow';
}

function escapeKind(stuck) {
  if (stuck.kind === 'ledge') return 'EscapeLedge';
  if (stuck.kind === 'wall') return 'EscapeWall';
  return 'EscapeStall';
}

function navKind(world) {
  if (!world.route.found) return 'EscapeStall';
  if (world.step?.action === 'jump') return 'PlatformAscend';
  if (world.step?.action === 'drop') return 'PlatformDescend';
  return 'Chase';
}

function chaseKind(world) {
  if (world.combat.aboveLane) return 'PlatformAscend';
  if (world.combat.belowLane) return 'PlatformDescend';
  return 'Chase';
}
