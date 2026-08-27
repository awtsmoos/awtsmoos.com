/* B”H */
export class StateStore {
  constructor() {
    this.data = new Map();
  }
  get(key) { return this.data.get(key); }
  set(key, val) { this.data.set(key, val); }
}
