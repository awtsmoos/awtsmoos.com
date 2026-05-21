/**
 * B"H
 * Chapter 56: Six Slots Became Six Gates.
 */

export class RuntimeActionBar {
  constructor(size = 6) {
    this.slots = Array.from({ length: size }, () => null);
  }

  bind(slot, action, payload = {}) {
    if (slot < 0 || slot >= this.slots.length) throw new Error(`Invalid action slot: ${slot}`);
    this.slots[slot] = { action, payload };
    return this.slots[slot];
  }

  activate(slot, bus) {
    const entry = this.slots[slot];
    if (!entry) return { ok: false, reason: 'empty-slot' };
    return { ok: true, event: bus.emit(entry.action, entry.payload) };
  }

  snapshot() {
    return this.slots.map((entry, slot) => ({ slot, entry }));
  }
}

export default RuntimeActionBar;
