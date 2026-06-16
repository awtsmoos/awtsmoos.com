// B"H
/** @file MinimapRuntime.js @description Minimap tracking payload from discoveries, services, corpse, and travel. */
export function minimapPayload(olam) { const p = olam?.player || olam?.chossid || {}; const discovered = Object.keys(p.discoveryState?.landmarks || {}); const corpse = p.deathState?.corpse || null; return { discovered, corpse, hearth:p.hearth || null, tracking:p.minimapTracking || { quests:true, vendors:true, herbs:true, corpse:true } }; }
export function emitMinimap(olam) { const payload = minimapPayload(olam); olam?.ayshPeula?.("ui event", "minimap", payload); return payload; }
export default { minimapPayload, emitMinimap };
