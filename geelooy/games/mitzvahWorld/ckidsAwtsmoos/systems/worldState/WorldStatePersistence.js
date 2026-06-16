// B"H
/** @file WorldStatePersistence.js @description Browser-local save/load wrapper for the canonical world state. */
import { ensureWorldState, worldStateSnapshot } from "./WorldStateStore.js";
const KEY = "BH_MITZVAH_WORLD_STATE_V1";
export function serializeWorldState(olam) { return JSON.stringify(worldStateSnapshot(olam)); }
export function hydrateWorldState(olam, data) { const parsed = typeof data === "string" ? JSON.parse(data) : data; olam.__awtsmoosWorldState = Object.assign(ensureWorldState(olam), parsed || {}); return olam.__awtsmoosWorldState; }
export function saveWorldStateLocal(olam) { const payload = serializeWorldState(olam); try { globalThis.localStorage?.setItem?.(KEY, payload); } catch {} return payload; }
export function loadWorldStateLocal(olam) { try { const raw = globalThis.localStorage?.getItem?.(KEY); if (raw) return hydrateWorldState(olam, raw); } catch {} return ensureWorldState(olam); }
export default { serializeWorldState, hydrateWorldState, saveWorldStateLocal, loadWorldStateLocal };
