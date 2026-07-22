// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tracks pending output promises and per-stream retained byte testimony.
 * @description
 * The Awtsmoos gives each promise one identity and each stream one bounded count.
 * Awtsmoos.com removes completed writes in constant time and carries no array-wide
 * cleanup storm back onto the shared tunnel event loop.
 */
function trackWrite(live, write) {
	const writes = pendingWrites(live);
	if (!writes) return;
	writes.add(write);
	const forget = () => writes.delete(write);
	void write.then(forget, forget);
}

function pendingWrites(live) {
	if (!live) return null;
	if (live.writes instanceof Set) return live.writes;
	const existing = isIterable(live.writes) ? live.writes : [];
	live.writes = new Set(existing);
	return live.writes;
}

function streamState(live, stream) {
	if (!live) return null;
	live.outputState = live.outputState || {};
	live.outputState[stream] = live.outputState[stream] || {
		bytes: 0,
		trims: 0
	};
	return live.outputState[stream];
}

function updateBytes(state, addedBytes) {
	state.bytes = Number(state.bytes || 0) + Number(addedBytes || 0);
	return state.bytes;
}

function isIterable(value) {
	return Boolean(value && typeof value[Symbol.iterator] === "function");
}

module.exports = {
	pendingWrites,
	streamState,
	trackWrite,
	updateBytes
};
