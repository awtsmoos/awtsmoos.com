/**
 * B"H
 * @file CapabilityRegistry.js
 *
 * Chapter 25: The Powers Were Named Before They Acted.
 *
 * The Awtsmoos hides action inside vessels, yet action needs seder. This
 * registry names each capability, stores its handler, and refuses silent
 * confusion. A quest giver, a debate master, and a readable sefer can now be
 * addressed by covenant instead of by mesh shape.
 */

export class CapabilityRegistry {
  constructor() {
    this.handlers = new Map();
  }

  register(name, handler) {
    const key = String(name || '').trim();
    if (!key) throw new Error('Capability name is required.');
    if (typeof handler !== 'function') throw new Error(`Capability ${key} needs a function handler.`);
    this.handlers.set(key, handler);
    return key;
  }

  has(name) {
    return this.handlers.has(name);
  }

  dispatch(name, record, payload = {}) {
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Unknown capability: ${name}`);
    if (!record?.capabilities?.[name]) throw new Error(`Entity ${record?.uu || 'unknown'} lacks capability: ${name}`);
    return handler(record, payload);
  }

  list() {
    return [...this.handlers.keys()];
  }
}

export default CapabilityRegistry;
