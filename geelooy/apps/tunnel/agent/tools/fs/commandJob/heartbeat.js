// B"H
/**
 * B"H
 * A heartbeat is a small poem every second: still here, still separate,
 * still serving the original action without freezing the kingly event loop.
 */
function startHeartbeat({ config, jobId, live, Meta, payload = {} }) {
  const timer = setInterval(() => heartbeat(config, jobId, live, Meta), heartbeatMs(payload));
  timer.unref?.();
  live.heartbeatTimer = timer;
  return timer;
}

function touch(live) {
  if (!live?.meta?.worker) return '';
  const at = new Date().toISOString();
  live.meta.worker.heartbeatAt = at;
  live.registry?.updateWorker(live.meta.worker.workerId, { heartbeatAt: at, state: live.meta.status || 'running' });
  return at;
}

async function heartbeat(config, jobId, live, Meta) {
  touch(live);
  live.heartbeatWrites = Number(live.heartbeatWrites || 0) + 1;
  if (live.heartbeatWrites % 2 === 0) await Meta.write(config, jobId, live.meta).catch(() => {});
}

function stop(live) {
  if (live?.heartbeatTimer) clearInterval(live.heartbeatTimer);
  touch(live);
}

function heartbeatMs(payload = {}) {
  return Math.max(250, Math.min(Number(payload.heartbeatMs || 1000), 5000));
}

module.exports = { startHeartbeat, touch, stop, heartbeatMs };
