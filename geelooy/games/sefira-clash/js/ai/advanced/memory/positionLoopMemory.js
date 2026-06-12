/**
 * B"H
 * Position loop memory.
 *
 * Chapter 135: loops must be true loops, not innocent proximity to an edge.
 * Edge bounce now requires edge-near frames with jump pressure or repeated tiny
 * reversal near the lip; fighting near a ledge is not automatically stupidity.
 */
export function updatePositionLoopMemory(bot, world = null) {
  bot.aiMind ||= {};
  bot.aiMind.positionLoop ||= freshLoop();
  const loop = bot.aiMind.positionLoop;
  const region = regionKey(bot.x, bot.y);
  const nearEnemy = world ? Math.abs(world.target.x - bot.x) < 210 && Math.abs(world.target.y - bot.y) < 175 : false;
  const attacking = !!(bot.attack || bot.rapidAttack || bot.input?.punch || bot.input?.kick || bot.input?.grab || bot.input?.rapidPunch);
  const edgeNear = nearEdge(bot, world);
  const entry = { region, x: bot.x, y: bot.y, jump: !!bot.input?.jump, nearEnemy, attacking, edgeNear, vx: bot.vx || 0, inputX: bot.input?.x || 0 };
  loop.history.push(entry);
  if (loop.history.length > 360) loop.history.shift();
  loop.sameRegionFrames = sameRegionFrames(loop.history, region);
  loop.ababFrames = detectAbab(loop.history);
  loop.jumpLoopFrames = jumpLoop(loop.history);
  loop.edgeBounceFrames = edgeBounceLoop(loop.history);
  loop.idleNearEnemyFrames = idleNearEnemy(loop.history);
  loop.microWalkFrames = microWalkLoop(loop.history);
  loop.loopDetected = loop.sameRegionFrames > 520 || loop.ababFrames > 140 || loop.jumpLoopFrames > 170 || loop.edgeBounceFrames > 150 || loop.idleNearEnemyFrames > 90 || loop.microWalkFrames > 210;
  if (loop.loopDetected) loop.triggers++;
  return loop;
}

export function loopPenalty(bot, opportunityName) {
  const loop = bot.aiMind?.positionLoop;
  if (!loop?.loopDetected) return 0;
  if (opportunityName === 'GuaranteedAttack') return 0;
  if (opportunityName === 'Chase') return 0;
  return loop.sameRegionFrames > 520 || loop.edgeBounceFrames > 150 ? 70 : 45;
}

function sameRegionFrames(history, region) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].region !== region || history[i].attacking) break;
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
    if (history[i].attacking || a === b) break;
    if (history[i - 2].region !== a || history[i - 3].region !== b) break;
    count += 4;
  }
  return count;
}

function jumpLoop(history) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].attacking) break;
    if (!history[i].jump && i < history.length - 18) break;
    if (history[i].jump) count += 12;
  }
  return count;
}

function edgeBounceLoop(history) {
  let count = 0;
  let reversals = 0;
  let lastDir = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i];
    if (!e.edgeNear || e.attacking) break;
    const dir = Math.sign(e.inputX || e.vx || 0);
    if (dir && lastDir && dir !== lastDir) reversals++;
    if (dir) lastDir = dir;
    if (e.jump || Math.abs(e.vx) < 0.35 || reversals >= 3) count++;
    else if (i < history.length - 24) break;
  }
  return count;
}

function idleNearEnemy(history) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (!entry.nearEnemy || entry.attacking || Math.abs(entry.vx) > 0.35) break;
    count++;
  }
  return count;
}

function microWalkLoop(history) {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].attacking) break;
    if (Math.abs(history[i].vx) > 1.4) break;
    count++;
  }
  return count;
}

function nearEdge(bot, world) {
  const p = world?.current?.p || bot.currentPlatform;
  if (!p) return false;
  return Math.min(Math.abs(bot.x - p.x), Math.abs(bot.x - (p.x + p.w))) < 95;
}

function regionKey(x, y) {
  return `${Math.floor(x / 250)}:${Math.floor(y / 250)}`;
}

function freshLoop() {
  return { history: [], sameRegionFrames: 0, ababFrames: 0, jumpLoopFrames: 0, edgeBounceFrames: 0, idleNearEnemyFrames: 0, microWalkFrames: 0, loopDetected: false, triggers: 0 };
}
