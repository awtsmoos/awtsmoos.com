// B"H

/**
 * B"H
 * Chapter 371: Eight Breaths Entered The Delegate Lung.
 *
 * The Awtsmoos makes the moment again and again, not once and abandoned. So a
 * spawned agent receives measured cycles: promotion cycles for planning trees,
 * and agentCycles for doing the work repeatedly until the vessel grows long.
 */
function taskLimits(config = {}, input = {}) {
  const ai = config.aiAgents || {};
  return {
    maxDepth: num(input.maxDepth ?? ai.maxDepth, 3, 0, 1000000),
    maxChildrenPerTask: num(input.maxChildrenPerTask ?? ai.maxChildrenPerTask, 8, 0, 1000000),
    maxTotalTasks: num(input.maxTotalTasks ?? ai.maxTotalTasks, 80, 1, 10000000),
    pollIntervalMs: num(input.pollIntervalMs ?? ai.pollIntervalMs, 7000, 100, 600000),
    promotionCycles: num(input.promotionCycles ?? ai.promotionCycles, 7, 0, 1000000),
    agentCycles: num(input.agentCycles ?? input.chapterCycles ?? ai.agentCycles ?? ai.chapterCycles, 8, 1, 1000000),
    allowRecursiveSpawn: input.allowRecursiveSpawn !== false && ai.allowRecursiveSpawn !== false
  };
}

function num(value, fallback, min, max) {
  const got = Number(value ?? fallback);
  if (!Number.isFinite(got)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(got)));
}

module.exports = { taskLimits };
