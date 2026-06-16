// B"H
/** @file LockableInteractionContract.js @description Shared contract for doors and gates. */
export const LOCK_STATES = Object.freeze(["lockedClosed", "closedUnlocked", "opening", "open", "closing", "jammed"]);
export function lockContract(data = {}) {
  return { lockable: data.lockable !== false, lockId: data.lockId || data.id || "lock", keyId: data.keyId || null, locked: data.locked === true, relockable: data.relockable !== false, missionFlag: data.missionFlag || null, ownerNpcId: data.ownerNpcId || null, state: data.locked ? "lockedClosed" : "closedUnlocked" };
}
export function isOpenState(state) { return state === "open" || state === "opening"; }
export default { LOCK_STATES, lockContract, isOpenState };
