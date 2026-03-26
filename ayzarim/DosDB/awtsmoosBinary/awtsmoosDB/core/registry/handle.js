
// B"H
const registry = new WeakMap();
const SOUL_SIG = Symbol.for('Awtsmoos.Soul');
module.exports = {
    SOUL_SIG,
    register(proxy, state) { state[SOUL_SIG] = true; registry.set(proxy, state); },
    getSoul(obj) { return obj ? (registry.get(obj) || (obj[SOUL_SIG] ? obj : undefined)) : undefined; },
    isHandle(obj) { return !!this.getSoul(obj); },
    createHandle(db, ptr, type, context = null) { return new (require('../../api/liveHandle/index.js'))(db, ptr, type, context); }
};
