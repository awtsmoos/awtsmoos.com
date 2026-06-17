// B"H
export function manualLockState(manual = {}) { return { locked:Boolean(manual.locked), editable:manual.locked !== true, reason:manual.lockReason || null }; }
export function canManualEdit(manual = {}) { return !manualLockState(manual).locked; }
