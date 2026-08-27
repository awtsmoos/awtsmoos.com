/* B”H */
import { StateStore } from './store.js';
import { HistoryManager } from './HistoryManager.js';
import { EventEmitter } from './EventEmitter.js';
import { PersistentReality } from './PersistentReality.js';

export class StateManager {
  constructor() {
    this.store = new StateStore();
    this.history = new HistoryManager();
    this.events = new EventEmitter();
    this.isUndoing = false;

    // B"H - Bind the Reshimu auto-saver after initialization
    setTimeout(() => {
      PersistentReality.bind(this);
    }, 100);
  }

  register(key, initialValue) {
    this.store.set(key, initialValue);
  }

  get(key) { return this.store.get(key); }

  set(key, value, skipHistory = false) {
    if (!skipHistory && !this.isUndoing) {
      this.history.push(key, this.get(key));
    }
    this.store.set(key, value);
    this.events.notify(key, value);
  }

  undo() {
    if (!this.history.canUndo()) return;
    this.isUndoing = true;
    const last = this.history.pop();
    this.history.pushRedo(last.key, this.get(last.key));
    this.store.set(last.key, last.value);
    this.events.notify(last.key, last.value);
    this.isUndoing = false;
  }

  redo() {
    if (!this.history.canRedo()) return;
    this.isUndoing = true;
    const next = this.history.popRedo();
    this.history.push(next.key, this.get(next.key));
    this.store.set(next.key, next.value);
    this.events.notify(next.key, next.value);
    this.isUndoing = false;
  }

  update(key, partial) {
    const current = this.get(key);
    this.set(key, { ...current, ...partial });
  }

  subscribe(key, cb) {
    this.events.subscribe(key, cb);
  }

  notify(key, payload) {
    this.events.notify(key, payload !== undefined ? payload : this.get(key));
  }
}