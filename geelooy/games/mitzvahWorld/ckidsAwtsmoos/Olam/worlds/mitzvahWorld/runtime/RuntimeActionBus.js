/**
 * B"H
 * Chapter 50: Every Action Found Its Listener.
 */

export class RuntimeActionBus {
  constructor() {
    this.handlers = new Map();
    this.history = [];
  }

  on(action, handler) {
    const list = this.handlers.get(action) || [];
    list.push(handler);
    this.handlers.set(action, list);
    return () => this.off(action, handler);
  }

  off(action, handler) {
    const list = this.handlers.get(action) || [];
    this.handlers.set(action, list.filter(item => item !== handler));
  }

  emit(action, payload = {}) {
    const event = { action, payload, index: this.history.length };
    this.history.push(event);
    for (const handler of this.handlers.get(action) || []) handler(event);
    return event;
  }
}

export default RuntimeActionBus;
