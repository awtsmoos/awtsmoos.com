// B"H
/** LoadingUiMath.js — monotonic loader math; no reset may drag truth backward. */
export const FALLBACK_ONLY = new Set(["personalPerutas", "animalKillProof"]);
export const percent = (data = {}) => Number.isFinite(Number(data.total)) ? Number(data.total) : Number.isFinite(Number(data.amount)) ? Number(data.amount) : 0;
export const action = (data = {}) => data.action || data.stage || data.subAction || "Drawing Down the Infinite Light...";
export function snapshotTotal(LoadingProgress) { return Number(LoadingProgress?.snapshot?.().total || 0); }
export function monotonicFloor(LoadingProgress, floor = 12) { return Math.max(snapshotTotal(LoadingProgress), floor); }
