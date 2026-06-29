//B"H
/**
 * Events are sparks leaving footprints. The Awtsmoos speaks once, and every
 * notification, audit, and future mobile push hears the same utterance.
 */
const listeners = new Map();
function on(eventType, handler) {
  const list = listeners.get(eventType) || [];
  list.push(handler);
  listeners.set(eventType, list);
  return () => listeners.set(eventType, list.filter(item => item !== handler));
}
async function emit({ $i, type, payload = {} }) {
  const event = { id: `BH_evt_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, payload, createdAt: Date.now() };
  const all = [...(listeners.get(type) || []), ...(listeners.get('*') || [])];
  for (const handler of all) await handler(event, $i);
  return event;
}
function clearListeners() { listeners.clear(); }
module.exports = { on, emit, clearListeners };
