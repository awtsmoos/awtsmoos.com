// B"H
function eventBus() {
  const map = new Map();
  return {
    on(type, fn) { if (fn) (map.get(type) || map.set(type, []).get(type)).push(fn); return this; },
    off(type, fn) { map.set(type, (map.get(type) || []).filter(x => x !== fn)); return this; },
    once(type, fn) { const wrap = (...args) => { this.off(type, wrap); fn(...args); }; return this.on(type, wrap); },
    emit(type, ...args) { for (const fn of map.get(type) || []) fn(...args); return true; }
  };
}
module.exports = { eventBus };
