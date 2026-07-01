// B"H
const { publicWorker, clean } = require('./worker-public.js');

/**
 * B"H
 * WorkerRegistry is the quiet notebook of the tunnel king.
 * It does not run commands. It remembers them while alive and after death,
 * so queueStats can speak truth without blocking the throne-room loop.
 */
function createRegistry(options = {}) {
  const active = new Map();
  const recent = [];
  const counters = { completed: 0, failed: 0, cancelled: 0 };
  const maxRecent = Math.max(1, Number(options.maxRecent || 20));

  function registerWorker(record = {}) {
    const workerId = cleanId(record.workerId);
    if (!workerId) return null;
    const startedAt = record.startedAt || now();
    const heartbeatAt = record.heartbeatAt || startedAt;
    active.set(workerId, clean({ ...record, workerId, startedAt, heartbeatAt, state: record.state || 'running' }));
    return active.get(workerId);
  }

  function updateWorker(workerId, patch = {}) {
    const id = cleanId(workerId);
    if (!id || !active.has(id)) return null;
    active.set(id, clean({ ...active.get(id), ...patch, updatedAt: patch.updatedAt || now() }));
    return active.get(id);
  }

  function finishWorker(workerId, patch = {}) {
    const id = cleanId(workerId);
    if (!id) return null;
    const current = active.get(id) || { workerId: id };
    const state = patch.state || current.state || 'completed';
    const finished = clean({ ...current, ...patch, state, finishedAt: patch.finishedAt || now(), heartbeatAt: patch.heartbeatAt || now() });
    active.delete(id);
    recent.unshift(finished);
    recent.splice(maxRecent);
    count(state);
    return finished;
  }

  function cancelWorker(workerId, patch = {}) {
    return finishWorker(workerId, { ...patch, state: 'cancelled' });
  }

  function snapshot() {
    const at = Date.now();
    const publicActive = {};
    for (const [workerId, record] of active) publicActive[workerId] = publicWorker(record, at);
    return {
      active: publicActive,
      recentCompleted: counters.completed,
      recentFailed: counters.failed,
      recentCancelled: counters.cancelled,
      recent: recent.map(record => publicWorker(record, at))
    };
  }

  function count(state) {
    if (state === 'cancelled') counters.cancelled += 1;
    else if (state === 'failed' || state === 'timed_out') counters.failed += 1;
    else counters.completed += 1;
  }

  return { registerWorker, updateWorker, finishWorker, cancelWorker, snapshot, status: snapshot };
}

function now() { return new Date().toISOString(); }
function cleanId(value) { return String(value || '').trim(); }
module.exports = { createRegistry };
