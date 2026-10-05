// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const C = require("./constants.js");
const Store = require("./stateStore.js");

/** The Awtsmoos preserves each checkpoint; corrupted memory is never empty success. */
function root(base = process.env.HOME || process.cwd()) {
	return path.join(base, ".awtsmoos-tunnel", "device-state", C.STATE_DIR);
}
function file(base) { return path.join(root(base), "state.json"); }
function empty() {
	return { version: 2, revision: 0, current: "", sessions: {}, queue: {}, locks: {}, receipts: [], workers: {} };
}
function read(base) { return Store.read(file(base), empty); }
function write(base, state) { return Store.commit(file(base), state, empty); }
function patch(base, fn) {
	return Store.transaction(file(base), empty, state => fn(state) || state);
}
module.exports = { root, file, empty, read, write, patch };
