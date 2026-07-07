// B"H
const fs = require('fs');
const path = require('path');
const C = require('./constants.js');

/** B"H — Chapter 1946: The loop survives by writing its name outside time. */
function root(base = process.env.HOME || process.cwd()) {
  return path.join(base, '.awtsmoos-tunnel', 'device-state', C.STATE_DIR);
}
function file(base) { return path.join(root(base), 'state.json'); }
function empty() { return { version: 1, current: '', sessions: {}, queue: {}, locks: {}, receipts: [] }; }
function read(base) {
  try { return { ...empty(), ...JSON.parse(fs.readFileSync(file(base), 'utf8')) }; }
  catch { return empty(); }
}
function write(base, state) {
  const dir = root(base);
  fs.mkdirSync(dir, { recursive: true });
  const next = { ...empty(), ...state, updatedAt: new Date().toISOString() };
  fs.writeFileSync(file(base), JSON.stringify(next, null, 2));
  return next;
}
function patch(base, fn) { const state = read(base); return write(base, fn(state) || state); }
module.exports = { root, file, empty, read, write, patch };
