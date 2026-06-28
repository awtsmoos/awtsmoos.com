// B"H
const DEFAULT_MODE = 'exclusive';
const RELEASED = 'released';
const LOCKED = 'locked';
function key(config = {}) { return String(config.root || process.cwd()).replace(/[^a-z0-9._-]+/gi, '_'); }
function now() { return new Date().toISOString(); }
function minimumUntil(ms = 3600000) { return new Date(Date.now() + Number(ms || 3600000)).toISOString(); }
module.exports = { DEFAULT_MODE, RELEASED, LOCKED, key, now, minimumUntil };
