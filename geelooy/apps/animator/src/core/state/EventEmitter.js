/* B”H */
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(key, cb) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(cb);
  }

  notify(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => cb(data));
    }
  }
}
