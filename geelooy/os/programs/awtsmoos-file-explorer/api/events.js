// B"H
export function createExplorerEvents() {
  const listeners = new Map();
  function on(name, handler) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(handler);
    return () => off(name, handler);
  }
  function off(name, handler) {
    listeners.get(name)?.delete(handler);
  }
  function emit(name, payload = {}) {
    for (const handler of listeners.get(name) || []) handler(payload);
    for (const handler of listeners.get('*') || []) handler({ name, payload });
    return payload;
  }
  return { on, off, emit };
}

/** B"H: the explorer has a heartbeat, and every chamber may listen without owning it. */
