// B"H

const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}

export function emit(event, detail = {}) {
  const payload = { event, detail, timestamp: Date.now() };

  for (const handler of listeners.get(event) || []) {
    try {
      handler(payload);
    } catch (error) {
      console.error(error);
    }
  }

  document.dispatchEvent(new CustomEvent(`awt:${event}`, { detail: payload }));
}
