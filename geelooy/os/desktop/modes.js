// B"H
const KEY = 'awtsmoos:desktop:layout-mode:v1';
export const MODES = ['grid','free','office'];
export function getDesktopMode() { try { return localStorage.getItem(KEY) || 'grid'; } catch { return 'grid'; } }
export function setDesktopMode(mode) { const next = MODES.includes(mode) ? mode : 'grid'; try { localStorage.setItem(KEY, next); } catch {} return next; }
export function nextDesktopMode() { const cur = getDesktopMode(); return setDesktopMode(MODES[(MODES.indexOf(cur) + 1) % MODES.length]); }
export function modeLabel(mode = getDesktopMode()) { return mode === 'free' ? 'Free drag' : mode === 'office' ? 'Office columns' : 'Grid snap'; }
/** B"H: desktop order becomes a user-selectable covenant: grid, free, or office. */
