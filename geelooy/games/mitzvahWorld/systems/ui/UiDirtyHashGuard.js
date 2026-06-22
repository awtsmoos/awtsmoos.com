// B"H
/**
 * @file UiDirtyHashGuard.js
 * @description
 * Prevents parchment panels from redrawing the same words again and again. The
 * Awtsmoos reveals UI only when the hash changes.
 */
const LIMIT = 320;
const cache = new Map();
function hashText(text = "") { let h = 2166136261; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return (h >>> 0).toString(36); }
export function stableUiHash(payload) { try { return hashText(JSON.stringify(payload)); } catch { return hashText(String(payload)); } }
export function shouldRenderUi(key, payload) { const id = String(key || "ui"); const hash = stableUiHash(payload); const previous = cache.get(id); if (previous === hash) return false; cache.set(id, hash); if (cache.size > LIMIT) cache.delete(cache.keys().next().value); return true; }
export function clearUiHash(key) { if (key) cache.delete(String(key)); else cache.clear(); }
export function uiHashReport() { return { entries:cache.size, keys:[...cache.keys()].slice(0, 40) }; }
globalThis.__AWTSMOOS_UI_HASH_GUARD__ = { shouldRenderUi, clearUiHash, report:uiHashReport };
export default { stableUiHash, shouldRenderUi, clearUiHash, uiHashReport };
