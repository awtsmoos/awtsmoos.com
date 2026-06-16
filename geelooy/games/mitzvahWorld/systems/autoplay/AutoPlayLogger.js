// B"H
/** Quiet structured logs: only milestones, warnings, errors, and assertions. */
export function createAutoPlayLogger(jobId, limit = 220) {
  const entries = [];
  const startedAt = Date.now();

  function push(level, event, data = {}) {
    const entry = { t: Date.now() - startedAt, level, event, data: safe(data) };
    entries.push(entry);
    while (entries.length > limit) entries.shift();
    if (level === 'error') console.error('[autoplay]', event, data);
    if (level === 'warn') console.warn('[autoplay]', event, data);
    return entry;
  }

  function safe(value) {
    try { return JSON.parse(JSON.stringify(value, replacer)); }
    catch { return String(value); }
  }

  function replacer(key, value) {
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (value instanceof Error) return { name: value.name, message: value.message, stack: String(value.stack || '').slice(0, 1200) };
    if (value && typeof value === 'object' && value.nodeType) return `[Node ${value.nodeName}]`;
    return value;
  }

  return {
    jobId,
    entries,
    info: (event, data) => push('info', event, data),
    warn: (event, data) => push('warn', event, data),
    error: (event, data) => push('error', event, data),
    snapshot: () => ({ jobId, startedAt, elapsedMs: Date.now() - startedAt, entries: [...entries] })
  };
}
