// B"H
import { getDesktopMode } from './modes.js';
const BASE = 'awtsmoos:desktop:icon-positions:';
export function loadPositions(mobile = false) { try { return JSON.parse(localStorage.getItem(key(mobile)) || '{}'); } catch { return {}; } }
export function savePositions(positions, mobile = false) { try { localStorage.setItem(key(mobile), JSON.stringify(positions || {})); } catch {} }
export function saveIconPosition(id, point, mobile = false) { const all = loadPositions(mobile); all[id] = point; savePositions(all, mobile); return all; }
export function clearPositions() { ['grid','free','office'].forEach(m => [false,true].forEach(mobile => localStorage.removeItem(key(mobile, m)))); }
function key(mobile, mode = getDesktopMode()) { return `${BASE}${mode}:${mobile ? 'phone' : 'wide'}:v2`; }
/** B"H: every desktop mode owns its own memory so order never fights freedom. */
