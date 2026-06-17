// B"H
/** Small immutable-ish state vessel for generated movie universes. */
function clone(v) { return JSON.parse(JSON.stringify(v ?? null)); }
function pathParts(path) { return String(path || "").split(".").filter(Boolean); }
function read(root, path, fallback = null) { let at = root; for (const p of pathParts(path)) { if (!at || typeof at !== "object" || !(p in at)) return fallback; at = at[p]; } return at; }
function write(root, path, value) { const parts = pathParts(path); let at = root; while (parts.length > 1) { const p = parts.shift(); if (!at[p] || typeof at[p] !== "object") at[p] = {}; at = at[p]; } if (parts.length) at[parts[0]] = clone(value); return value; }
export class UniverseStateStore {
  constructor(seed = {}) { this.state = { version:"universe-runtime-v1", createdAt:new Date().toISOString(), ...clone(seed), events:[] }; }
  get(path, fallback = null) { return read(this.state, path, fallback); }
  set(path, value) { return write(this.state, path, value); }
  event(type, detail = {}) { const row = { type, at:new Date().toISOString(), detail:clone(detail) }; this.state.events.push(row); this.state.events = this.state.events.slice(-120); return row; }
  snapshot() { return clone(this.state); }
}
export default UniverseStateStore;
