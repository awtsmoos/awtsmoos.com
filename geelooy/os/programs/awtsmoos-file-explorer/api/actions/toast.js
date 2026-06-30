// B"H
export function toast(system, text, kind = 'info') { try { system?.makeToast?.(text, kind, 'explorer'); } catch {} }
export function fail(system, label, error) { toast(system, `${label} failed: ${error?.message || error}`, 'error'); }
/** B"H: every silent button becomes a speaking messenger. */
