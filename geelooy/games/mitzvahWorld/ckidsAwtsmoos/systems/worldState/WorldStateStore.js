// B"H
/** @file WorldStateStore.js @description Tiny canonical persistent world-state vessel for doors, houses, animals, grass, economy, landmarks, and NPC memory. */
const DEFAULT_STATE = Object.freeze({ version:1, time:{ day:1, minute:360 }, doors:{}, houses:{}, npcMemory:{}, animals:{}, grassTraffic:{}, economy:{}, landmarks:{} });
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function parts(path) { return Array.isArray(path) ? path : String(path || "").split(".").filter(Boolean); }
function ensureContainer(root, keys) { let node = root; for (const key of keys.slice(0,-1)) { if (!node[key] || typeof node[key] !== "object") node[key] = {}; node = node[key]; } return { node, key:keys[keys.length - 1] }; }
export function ensureWorldState(olam) { if (!olam) return clone(DEFAULT_STATE); if (!olam.__awtsmoosWorldState) olam.__awtsmoosWorldState = clone(DEFAULT_STATE); return olam.__awtsmoosWorldState; }
export function readWorldState(olam, path, fallback = undefined) { let node = ensureWorldState(olam); for (const key of parts(path)) { if (!node || typeof node !== "object" || !(key in node)) return fallback; node = node[key]; } return node; }
export function writeWorldState(olam, path, value) { const state = ensureWorldState(olam), keys = parts(path); if (!keys.length) return state; const { node, key } = ensureContainer(state, keys); node[key] = value; return value; }
export function patchWorldState(olam, path, patch = {}) { const current = readWorldState(olam, path, {}), next = Object.assign({}, current && typeof current === "object" ? current : {}, patch); writeWorldState(olam, path, next); return next; }
export function worldStateSnapshot(olam) { return clone(ensureWorldState(olam)); }
export default { ensureWorldState, readWorldState, writeWorldState, patchWorldState, worldStateSnapshot };
