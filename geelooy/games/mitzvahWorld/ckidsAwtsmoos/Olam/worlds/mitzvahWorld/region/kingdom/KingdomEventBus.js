// B"H
/** @file KingdomEventBus.js @description Events are bounded sparks remembered without parser-clever syntax. */
const LIMIT = 96;
export function createKingdomEventBus(limit = LIMIT) { return { version:"kingdom-event-bus-v2-parser-clear", limit, recent:[] }; }
export function kingdomEmit(bus, type, payload = {}, time = Date.now()) { const event = { id:`${type}:${time}:${bus.recent.length}`, type, payload, time }; return { ...bus, recent:[...bus.recent, event].slice(-bus.limit) }; }
export function eventBusSummary(bus) { const byType = {}, recent = bus && Array.isArray(bus.recent) ? bus.recent : []; for (const event of recent) byType[event.type] = (byType[event.type] || 0) + 1; return { events:recent.length, byType }; }
