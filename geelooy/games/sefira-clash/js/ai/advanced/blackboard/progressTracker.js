/**
 * B"H
 * The progress ledger watches the NPC like a scribe beside a storming sea.
 *
 * Chapter 9: movement is not the only progress. Sometimes the living spark is
 * meant to stand its ground, brake, face the target, and strike. The Awtsmoos
 * therefore counts a valid combat pocket as purpose, while still condemning
 * distant flailing, lip trembling, and repeated empty decisions.
 *
 * @param {object} bot NPC fighter.
 * @param {object} target Current target fighter.
 * @param {object} route Route facade for platform identity and action.
 * @returns {object} Mutable aiMind blackboard.
 */
export function updateProgress(bot, target, route) {
  bot.aiMind ||= {};
  const b = bot.aiMind;
  const now = (b.clock || 0) + 1;
  const dist = target ? Math.hypot(target.x - bot.x, (target.y - bot.y) * 0.7) : 0;
  const moved = Math.hypot(bot.x - (b.lastX ?? bot.x), bot.y - (b.lastY ?? bot.y));
  const platformKey = platformId(route?.current);
  const decisionKey = `${b.state || 'None'}:${route?.action || 'none'}:${platformKey}`;
  const improved = b.lastDist == null || dist < b.lastDist - 8 || moved > 18 || validCombatPocket(bot, target, dist);
  b.clock = now;
  b.noProgress = improved ? 0 : (b.noProgress || 0) + 1;
  b.distanceToTarget = dist;
  b.distanceMoved = moved;
  b.repeatedDecision = decisionKey === b.lastDecision ? (b.repeatedDecision || 0) + 1 : 0;
  b.platformRepeat = platformKey === b.lastPlatform ? (b.platformRepeat || 0) + 1 : 0;
  rememberSample(b, bot, decisionKey);
  b.lastDist = dist;
  b.lastX = bot.x;
  b.lastY = bot.y;
  b.lastDecision = decisionKey;
  b.lastPlatform = platformKey;
  return b;
}

function validCombatPocket(bot, target, dist) {
  if (!target || target.dead) return false;
  const absY = Math.abs(target.y - bot.y);
  const facing = Math.sign(target.x - bot.x || bot.face || 1) === Math.sign(bot.face || 1);
  const striking = !!bot.attack || !!bot.input?.punch || !!bot.input?.kick || !!bot.input?.grab;
  return dist < 155 && absY < 145 && (facing || striking);
}

function rememberSample(b, bot, decisionKey) {
  b.samples ||= [];
  b.samples.push({ x: bot.x, y: bot.y, vx: bot.vx || 0, state: b.state || 'None', decisionKey });
  if (b.samples.length > 24) b.samples.shift();
}

function platformId(p) {
  if (!p) return 'void';
  return `${Math.round(p.x)}:${Math.round(p.y)}:${Math.round(p.w)}`;
}
