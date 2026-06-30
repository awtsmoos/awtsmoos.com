// B"H
export function safeTitle(title) { const t = String(title ?? '').trim(); return t && t !== 'undefined' ? t : 'Awtsmoos Window'; }
/** B"H: no empty title may masquerade as a window name. */
