// B"H
const KEY = 'awtsmoos:desktop:icon-positions:v2';
const MOBILE_KEY = 'awtsmoos:desktop:icon-positions:phone:v1';
export function loadPositions(mobile = false) { try { return JSON.parse(localStorage.getItem(mobile ? MOBILE_KEY : KEY) || '{}'); } catch { return {}; } }
export function savePositions(positions, mobile = false) { try { localStorage.setItem(mobile ? MOBILE_KEY : KEY, JSON.stringify(positions || {})); } catch {} }
export function saveIconPosition(id, point, mobile = false) { const all = loadPositions(mobile); all[id] = point; savePositions(all, mobile); return all; }
export function clearPositions() { try { localStorage.removeItem(KEY); localStorage.removeItem(MOBILE_KEY); } catch {} }
/** B"H: Desktop memory now separates phone and wide-screen coordinates. */
