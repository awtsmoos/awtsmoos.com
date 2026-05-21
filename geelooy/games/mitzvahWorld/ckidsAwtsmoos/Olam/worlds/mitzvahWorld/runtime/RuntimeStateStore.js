/**
 * B"H
 * Chapter 51: The State Became A Quiet Vessel.
 */

export class RuntimeStateStore {
  constructor(initial = {}) {
    this.state = structuredClone(initial);
    this.revisions = [];
  }

  get(path, fallback = null) {
    return path.split('.').reduce((value, key) => value?.[key], this.state) ?? fallback;
  }

  set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((node, key) => node[key] ||= {}, this.state);
    target[last] = value;
    this.revisions.push({ path, value });
    return value;
  }

  patch(path, patch) {
    return this.set(path, { ...(this.get(path, {}) || {}), ...patch });
  }

  snapshot() {
    return structuredClone(this.state);
  }
}

export default RuntimeStateStore;
