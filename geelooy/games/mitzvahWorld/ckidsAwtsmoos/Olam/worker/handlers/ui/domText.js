// B"H
/** @file domText.js @description Chapter 380: Text enters HTML through a guarded gate. */
export const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export const esc = s => String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
