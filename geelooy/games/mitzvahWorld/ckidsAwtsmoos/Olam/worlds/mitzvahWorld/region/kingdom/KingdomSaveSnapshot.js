// B"H
/** @file KingdomSaveSnapshot.js @description Sleeping kingdom compressed into parser-clear memory. */
function chunksOf(kernel) { return kernel && kernel.chunks && Array.isArray(kernel.chunks.chunks) ? kernel.chunks.chunks : []; }
function eventsOf(kernel) { return kernel && kernel.events && Array.isArray(kernel.events.recent) ? kernel.events.recent : []; }
function clockOf(kernel) { return kernel && kernel.clock ? kernel.clock : {}; }
function compactChunks(chunks) { return chunks.map(c => ({ id:c.id, tier:c.tier, ecologyCells:c.ecologyCells, animals:c.animals, houses:c.houses, npcSchedules:c.npcSchedules })); }
export function createKingdomSaveSnapshot(kernel = {}) { const clock = clockOf(kernel); return { version:"kingdom-save-snapshot-v2-parser-clear", savedAt:Date.now(), clock:{ now:clock.now || 0, day:clock.day || 0, phase:clock.phase || "morning" }, chunks:compactChunks(chunksOf(kernel)), events:eventsOf(kernel).slice(-24), summary:kernel.summary || {} }; }
export function snapshotSummary(snapshot = {}) { const chunks = Array.isArray(snapshot.chunks) ? snapshot.chunks : [], events = Array.isArray(snapshot.events) ? snapshot.events : [], clock = snapshot.clock || {}; return { version:snapshot.version, chunks:chunks.length, events:events.length, phase:clock.phase || "unknown" }; }
