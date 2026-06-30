// B"H
const KEY = 'awtsmoos:desktop:icon-positions:v2';
export function loadPositions() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
export function savePositions(positions) { try { localStorage.setItem(KEY, JSON.stringify(positions || {})); } catch {} }
export function saveIconPosition(id, point) { const all = loadPositions(); all[id] = point; savePositions(all); return all; }
export function clearPositions() { try { localStorage.removeItem(KEY); } catch {} }
/** B"H: Persistence is memory in a small vessel; even a dragged icon remembers. */
