// B"H
const KEY = 'awtsmoos:desktop:mobile-layout:v1';
export function loadMobilePositions() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
export function saveMobilePositions(pos) { try { localStorage.setItem(KEY, JSON.stringify(pos || {})); } catch {} }
/** B"H: phone positions remember separately from wide desktop positions. */
