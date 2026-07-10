// B"H
/** Event bus: buttons do not command; they whisper and the runtime answers. */
export class AwtsmoosEventBus {
  constructor() { this.listeners = new Map(); this.history = []; }
  on(type, fn) { const list = this.listeners.get(type) || []; list.push(fn); this.listeners.set(type, list); return () => this.off(type, fn); }
  off(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter((x) => x !== fn)); }
  emit(type, detail = {}) { this.history.unshift({ type, detail, at: performance.now() }); this.history.length = Math.min(24, this.history.length); for (const fn of this.listeners.get(type) || []) fn(detail); window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail })); }
}
