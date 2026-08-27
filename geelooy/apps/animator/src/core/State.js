export class State {
  constructor() {
    this.data = {};
    this.listeners = {};
  }

  set(key, value) {
    this.data[key] = value;
    this.notify(key);
  }

  get(key) {
    return this.data[key];
  }

  update(key, partialValue) {
    if (typeof this.data[key] === 'object' && this.data[key] !== null) {
      this.data[key] = { ...this.data[key], ...partialValue };
    } else {
      this.data[key] = partialValue;
    }
    this.notify(key);
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  notify(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.data[key]));
    }
  }
}
