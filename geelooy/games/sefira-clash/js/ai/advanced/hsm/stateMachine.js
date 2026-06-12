/**
 * B"H
 * Hierarchical state chooser with rare physical escapes.
 *
 * Chapter 242: escape is medicine, not lifestyle. Wall and stall signals no
 * longer exile the bot from combat unless the body is truly trapped. Otherwise
 * the fighter chases, climbs, drops, and keeps the fire pointed at the target.
 */
export function chooseState(bot, world, stuck) {
  const offstage = isOffstage(bot, world);
  const routeNeeded = world.route.found && world.current.id !== world.goal.id;
  if (offstage) return setState(bot, recoverKind(bot, world));
  if (world.combat.canHitNow) return setState(bot, 'Attack');
  if (stuck.kind === 'ledge') return setState(bot, 'EscapeLedge');
  if (stuck.kind === 'wall') return setState(bot, 'EscapeWall');
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

function isOffstage(bot, world) {
  const p = world.current.p;
  const farBelow = bot.y > p.y + 260;
  const farSide = bot.x < p.x - 230 || bot.x > p.x + p.w + 230;
  return farBelow || farSide || world.danger.score > 305;
}

function recoverKind(bot, world) {
  if (bot.y < world.current.p.y - 170) return 'RecoverHigh';
  return 'RecoverLow';
}

function navKind(world) {
  if (world.step?.action === 'jump') return 'PlatformAscend';
  if (world.step?.action === 'drop') return 'PlatformDescend';
  return 'Chase';
}

function chaseKind(world) {
  if (world.combat.aboveLane) return 'PlatformAscend';
  if (world.combat.belowLane) return 'PlatformDescend';
  return 'Chase';
}
