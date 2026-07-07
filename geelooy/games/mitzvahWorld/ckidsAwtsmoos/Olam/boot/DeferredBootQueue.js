// B\"H
/**
 * DeferredBootQueue is a gentle wagon: one nivra at a time, one frame-budgeted
 * sip at a time, so the world opens fast and keeps becoming after playable.
 */
const idle = globalThis.requestIdleCallback || (cb => setTimeout(() => cb({ timeRemaining: () => 8 }), 16));

export function createDeferredBootQueue({ budgetMs = 7, label = 'deferred-boot' } = {}) {
  const tasks = [];
  const state = { label, started: false, done: 0, failed: 0, errors: [] };
  const now = () => globalThis.performance?.now?.() || Date.now();

  async function drain(deadline) {
    const started = now();
    while (tasks.length) {
      if (now() - started >= budgetMs && deadline?.timeRemaining?.() <= 1) break;
      const task = tasks.shift();
      try { await task(); state.done += 1; }
      catch (error) { state.failed += 1; state.errors.push(String(error?.message || error)); }
    }
    if (tasks.length) idle(drain);
    globalThis.__AWTS_DEFERRED_BOOT__ = snapshot();
  }

  function start() {
    if (state.started) return snapshot();
    state.started = true;
    idle(drain);
    return snapshot();
  }

  function snapshot() {
    return { ...state, pending: tasks.length, errors: state.errors.slice(-5) };
  }

  return {
    add(task) { tasks.push(task); globalThis.__AWTS_DEFERRED_BOOT__ = snapshot(); },
    addMany(items, map) { for (const item of items) tasks.push(() => map(item)); },
    start,
    snapshot
  };
}
