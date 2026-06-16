// B"H
/** @file LockStateRuntime.js @description Runtime that unlocks gates and doors by key, mission, or owner permission. */
import { hasKey } from "./KeyRegistry.js";
import { lockContract, isOpenState } from "./LockableInteractionContract.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, text, color = "#ffd966") { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }
function objectiveType(lock) { return String(lock?.lockId || "").includes("gate") ? "openGate" : "unlockDoor"; }
export function ensureLockState(olam) { const p = playerOf(olam); if (!p) return null; p.lockState ||= { locks:{}, permissions:{} }; return p.lockState; }
export function registerLock(olam, data = {}) { const state = ensureLockState(olam); if (!state) return null; const base = lockContract(data); const lock = { ...base, ...(state.locks[base.lockId] || {}) }; state.locks[lock.lockId] = lock; return lock; }
export function canUnlock(olam, lock) { const p = playerOf(olam), state = ensureLockState(olam); if (!lock?.lockable) return true; return hasKey(p, lock.keyId) || hasKey(p, "village_master_key") || Boolean(lock.missionFlag && state.permissions[lock.missionFlag]) || Boolean(lock.ownerNpcId && state.permissions[`owner:${lock.ownerNpcId}`]); }
export function toggleLockable(olam, data = {}) {
  const lock = registerLock(olam, data); if (!lock) return { ok:false, reason:"no-player" };
  if (isOpenState(lock.state)) { lock.state = "closedUnlocked"; emit(olam, "Closed"); return { ok:true, lock, open:false }; }
  if (lock.locked && !canUnlock(olam, lock)) { emit(olam, `LOCKED — ${lock.keyId || "permission required"}`, "#ff7777"); return { ok:false, reason:"locked", lock }; }
  lock.locked = false; lock.state = "open"; emit(olam, "Opened", "#d7c8ff"); progressActiveObjectives(olam, objectiveType(lock), 1); return { ok:true, lock, open:true };
}
export function grantPermission(olam, flag) { const state = ensureLockState(olam); if (state && flag) state.permissions[flag] = true; return state; }
export default { ensureLockState, registerLock, canUnlock, toggleLockable, grantPermission };
