// B"H
/**
 * A command object is a vessel, not disposable dust.
 * Reuse is counted when an old vessel is drawn from the pool, before it is
 * reset for new speech, so evidence matches the actual memory river.
 */
export function createCommandPool(limit = 4096) {
  const free = [];
  let created = 0, reused = 0;
  function take(op, base, meta = {}) {
    const old = free.pop();
    const c = old || {};
    if (old) reused++; else created++;
    reset(c); Object.assign(c, base, meta, { op });
    return c;
  }
  function releaseMany(items) {
    for (let i = 0; i < items.length && free.length < limit; i++) free.push(reset(items[i]));
    items.length = 0;
  }
  function stats() { return { pooled: free.length, created, reused }; }
  return { take, releaseMany, stats };
}

export function reset(c) {
  for (const k in c) delete c[k];
  return c;
}
