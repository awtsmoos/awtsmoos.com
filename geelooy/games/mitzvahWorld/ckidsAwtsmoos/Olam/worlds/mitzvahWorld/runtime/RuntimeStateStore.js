// B"H
/** @file RuntimeStateStore.js @description Tiny parser-clear state store for nested runtime values. */
function keys(path) { return String(path || "").split(".").filter(Boolean); }
function getNested(root, pathKeys, fallback) { let value = root; for (const key of pathKeys) { if (!value || value[key] === undefined) return fallback; value = value[key]; } return value === undefined ? fallback : value; }
function ensureNested(root, pathKeys) { let node = root; for (const key of pathKeys) { if (!node[key]) node[key] = {}; node = node[key]; } return node; }
export class RuntimeStateStore {
  constructor(initial = {}) { this.state = initial; this.listeners = new Map(); }
  get(path, fallback = undefined) { return getNested(this.state, keys(path), fallback); }
  set(path, value) { const parts = keys(path), last = parts.pop(); const target = ensureNested(this.state, parts); target[last] = value; this.emit(path, value); return value; }
  on(path, handler) { if (!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(handler); return () => this.listeners.get(path).delete(handler); }
  emit(path, value) { const set = this.listeners.get(path); if (!set) return; for (const handler of set) handler(value, this.state); }
}
export default RuntimeStateStore;
