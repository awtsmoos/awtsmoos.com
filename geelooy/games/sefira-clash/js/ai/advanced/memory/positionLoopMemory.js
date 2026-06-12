/**
 * B"H
 * Position loop memory.
 *
 * Chapter 66: the bot may not dance forever in the same square of creation.
 * The Awtsmoos watches regions, A-B-A-B loops, and long local camping, then
 * asks the mind to abandon the stale tactic and return to pursuit or attack.
 */
export function updatePositionLoopMemory(bot) {
  bot.aiMind ||= {};
  bot.aiMind.positionLoop ||= freshLoop();
  const loop = bot.aiMind.positionLoop;
  const region = regionKey(bot.x, bot.y);
  loop.history.push({ region, x: bot.x, y: bot.y, jump: !!bot.input?.jump });
  if (loop.history.length > 300) loop.history.shift();
  loop.sameRegionFrames = sameRegionFrames(loop.history, region);
  loop.ababFrames = detectAbab(loop.history);
  loop.jumpLoopFrames = jumpLoop(loop.history);
  loop.loopDetected = loop.sameRegionFrames > 480 || loop.ababFrames > 120 || loop.jumpLoopFrames > 150;
  if (loop.loopDetected) loop.triggers++;
  return loop;
}

export function loopPenalty(bot, opportunityName) {
  const loop = bot.aiMind?.positionLoop;
  if (!loop?.loopDetected) return 0;
  if (opportunityName === 'GuaranteedAttack') return 0;
  if (opportunityName === 'Chase') return 0;
  return loop.sameRegionFrames > 480 ? 70 : 45;
}

function sameRegionFrames(history, region) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].region !== region) break;
    count++;
  }
  return count;
}

function detectAbab(history) {
  if (history.length < 8) return 0;
  let count = 0;
  for (let i = history.length - 1; i >= 3; i--) {
    const a = history[i].region;
    const b = history[i - 1].region;
    if (a === b) break;
    if (history[i - 2].region !== a || history[i - 3].region !== b) break;
    count += 4;
  }
  return count;
}

function jumpLoop(history) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (!history[i].jump && i < history.length - 18) break;
    if (history[i].jump) count += 12;
  }
  return count;
}

function regionKey(x, y) {
  return `${Math.floor(x / 250)}:${Math.floor(y / 250)}`;
}

function freshLoop() {
  return { history: [], sameRegionFrames: 0, ababFrames: 0, jumpLoopFrames: 0, loopDetected: false, triggers: 0 };
}
