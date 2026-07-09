// B"H
/** EventBus: peulah speaks; every vessel hears only what it must hear. */
export class EventBus {
  constructor() { this.listeners = new Map(); }
  on(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); return () => this.off(type, handler); }
  off(type, handler) { this.listeners.get(type)?.delete(handler); }
  emit(type, detail = {}) { for (const h of this.listeners.get(type) || []) h(detail); for (const h of this.listeners.get('*') || []) h({ type, detail }); }
}
