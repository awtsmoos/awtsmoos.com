// B"H
// Replay records only seeds of action; the world can bloom again from them.
export function createReplay() {
  const events = []; const start = Date.now();
  function record(type, data = {}) { events.push({ t: Date.now() - start, type, data }); }
  function dump() { return { start, events: events.slice() }; }
  function clear() { events.length = 0; }
  return { record, dump, clear };
}
