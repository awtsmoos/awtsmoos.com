// B"H
const Health = require('./health-score.js');
/**
 * B"H
 * The watchdog no longer swings a sword at the first silent heartbeat. It asks
 * the court of signals whether the vessel is merely hidden, recovering, or
 * truly dead. Thus the Awtsmoos is revealed in patience before force.
 */
function inspect({ ws, staleMs, stats, identity, lastSuccessfulActionAt, policy } = {}) {
  const now = Date.now(), s = typeof stats === 'function' ? stats() : (stats || {});
  const health = Health.compileHealth({
    now,
    policy,
    websocketAgeMs: staleMs,
    pid: identity?.pid || process.pid,
    eventLoopLagMs: s.eventLoopLag?.lastMs || 0,
    workers: s.workers || {},
    lastSuccessfulActionAgeMs: lastSuccessfulActionAt ? now - lastSuccessfulActionAt : Infinity,
    localApiReachable: true,
    journalWritable: true,
    registryFresh: true,
    browserBridgeReachable: false
  });
  const socketOpen = !!(ws && ws.opened && !ws.closed);
  const shouldReconnect = !socketOpen || health.state === 'dead';
  return { shouldReconnect, socketOpen, staleMs, health, queueStats: s };
}
module.exports = { inspect };
