// B"H
/**
 * B"H
 * The tunnel is not one candle in a websocket wind. It is a minyan of signs:
 * process, workers, queue, journal, and recent acts all testifying that the
 * Awtsmoos still breathes through this local vessel. A stale socket may be a
 * cloud; only many failed witnesses may call night dead.
 */
const DEFAULTS = { staleGraceMs: 180000, deadGraceMs: 900000, recentActionMs: 180000, workerFreshMs: 45000, panicLagMs: 5000 };
function yes(v) { return v === true || v === 'ok' || v === 'healthy'; }
function ageOk(age, limit) { return Number.isFinite(age) && age >= 0 && age <= limit; }
function countActiveWorkers(workers = {}) {
  const active = workers.active || workers.running || workers;
  if (!active || typeof active !== 'object') return 0;
  return Object.values(active).filter(w => !w.finishedAt && w.state !== 'finished' && w.state !== 'completed' && w.state !== 'cancelled').length;
}
function freshestWorkerAge(workers = {}, now = Date.now()) {
  const active = workers.active || workers.running || workers;
  const ages = Object.values(active || {}).map(w => now - Date.parse(w.heartbeatAt || w.startedAt || '')).filter(Number.isFinite);
  return ages.length ? Math.min(...ages) : Infinity;
}
function compileHealth(input = {}) {
  const cfg = { ...DEFAULTS, ...(input.policy || {}) }, now = input.now || Date.now();
  const websocketAgeMs = Number(input.websocketAgeMs ?? Infinity);
  const workers = input.workers || {}, workerCount = countActiveWorkers(workers);
  const workerAgeMs = freshestWorkerAge(workers, now);
  const recentActionAge = Number(input.lastSuccessfulActionAgeMs ?? Infinity);
  const signals = {
    websocketHeartbeat: ageOk(websocketAgeMs, cfg.staleGraceMs),
    localProcessPid: input.pid ? true : yes(input.localProcessPid),
    eventLoopLag: Number(input.eventLoopLagMs || 0) < Number(cfg.panicLagMs || 5000) || ageOk(recentActionAge, cfg.recentActionMs),
    commandWorkerHeartbeat: workerCount > 0 && ageOk(workerAgeMs, cfg.workerFreshMs),
    journalWritable: input.journalWritable !== false,
    registryFresh: workerCount > 0 || input.registryFresh !== false,
    lastSuccessfulAction: ageOk(recentActionAge, cfg.recentActionMs),
    localApiReachable: input.localApiReachable !== false,
    browserBridgeReachable: yes(input.browserBridgeReachable)
  };
  let score = 0;
  for (const [key, value] of Object.entries(signals)) score += value ? weight(key) : 0;
  score = Math.max(0, Math.min(100, score));
  const failed = Object.keys(signals).filter(k => !signals[k]);
  const state = stateFrom({ score, websocketAgeMs, cfg, workerCount, failed, recentActionAge });
  return { score, state, signals, failed, workerCount, workerAgeMs: Number.isFinite(workerAgeMs) ? workerAgeMs : null };
}
function weight(key) {
  return ({ websocketHeartbeat:20, localProcessPid:15, eventLoopLag:10, commandWorkerHeartbeat:15, journalWritable:10, registryFresh:10, lastSuccessfulAction:10, localApiReachable:5, browserBridgeReachable:5 })[key] || 0;
}
function stateFrom({ score, websocketAgeMs, cfg, workerCount, failed, recentActionAge }) {
  if (score >= 80) return 'healthy';
  if (workerCount > 0 && score >= 40) return 'degraded';
  if (recentActionAge <= cfg.recentActionMs && score >= 35) return 'recovering';
  if (websocketAgeMs <= cfg.deadGraceMs && score >= 30) return 'recovering';
  if (score >= 25 && failed.length < 6) return 'stale';
  return 'dead';
}
module.exports = { DEFAULTS, compileHealth, countActiveWorkers, freshestWorkerAge };
