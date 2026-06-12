// B"H
/**
 * @file KingdomEventBus.js
 * @description Events are sparks: bounded, remembered, and never allowed to burn the frame.
 */
const LIMIT = 96;

export function createKingdomEventBus(limit = LIMIT) {
  return { version: "kingdom-event-bus-v1", limit, recent: [] };
}

export function kingdomEmit(bus, type, payload = {}, time = Date.now()) {
  const event = { id: `${type}:${time}:${bus.recent.length}`, type, payload, time };
  const recent = [...bus.recent, event].slice(-bus.limit);
  return { ...bus, recent };
}

export function eventBusSummary(bus) {
  const byType = {};
  for (const e of bus.recent || []) byType[e.type] = (byType[e.type] || 0) + 1;
  return { events: bus.recent?.length || 0, byType };
}
