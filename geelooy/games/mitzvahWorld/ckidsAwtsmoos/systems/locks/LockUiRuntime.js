// B"H
/** @file LockUiRuntime.js @description UI payloads for lockable doors and gates. */
export function lockTooltip(lock) { if (!lock) return "Locked"; if (lock.state === "open") return "Close"; if (lock.locked) return `Locked — ${lock.keyId || "permission"}`; return "Open"; }
export function emitLockUi(olam, lock) { const payload = { lockId: lock?.lockId, state: lock?.state, locked: lock?.locked, text: lockTooltip(lock) }; olam?.ayshPeula?.("ui event", "lockState", payload); olam?.ayshPeula?.("ui event", "tooltip", { show: true, text: payload.text }); return payload; }
export default { lockTooltip, emitLockUi };
