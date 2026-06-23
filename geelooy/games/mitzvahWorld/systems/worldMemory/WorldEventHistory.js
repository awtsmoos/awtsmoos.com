// B"H
/** @file WorldEventHistory.js @description Compact event log for consequence-driven realism. */
export function createWorldEventHistory(limit = 500) {
  const events = [];
  function record(type, payload = {}) {
    const event = { id:payload.id || `${type}-${Date.now()}-${events.length}`, type, at:Date.now(), ...payload };
    events.push(event);
    while (events.length > limit) events.shift();
    return event;
  }
  function recent(type, count = 20) {
    const list = type ? events.filter(e => e.type === type) : events;
    return list.slice(-count);
  }
  function since(zman = 0) { return events.filter(e => e.at >= zman); }
  function report() {
    const byType = {};
    for (const event of events) byType[event.type] = (byType[event.type] || 0) + 1;
    return { events:events.length, byType };
  }
  return { record, recent, since, report, events };
}
export default createWorldEventHistory;
