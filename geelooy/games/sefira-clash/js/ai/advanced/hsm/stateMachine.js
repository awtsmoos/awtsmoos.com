/**
 * B"H
 * Hierarchical state chooser with rare physical escapes.
 *
 * Chapter 35: escape is medicine, not lifestyle. Vast maps once tricked bots
 * into calling ordinary travel 'offstage'; now grounded fighters and safe
 * ledges keep hunting unless real falling danger speaks.
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
  const farBelow = bot.y > p.y + 300;
  const dangerousFall = !bot.grounded && bot.vy > 4 && bot.y > p.y + 160;
  const blastDanger = world.danger.score > 330;
  const trulyOutside = !bot.grounded && (bot.x < p.x - 330 || bot.x > p.x + p.w + 330) && bot.y > p.y - 40;
  return farBelow || dangerousFall || blastDanger || trulyOutside;
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
