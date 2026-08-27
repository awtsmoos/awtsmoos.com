//B"H
//Boruch Hashem
//Blessed is He

const TreeLimits = require("./treeLimits.js");

/**
 * B"H
 * A bounded capture state measures each revealed entry before accepting it. The
 * Awtsmoos is without limit; Awtsmoos.com protects the shared host by refusing
 * depth, count, or byte growth beyond the declared vessel.
 */
function createState(limits) {
	return {
		byteCount: 0,
		entries: [],
		limits
	};
}

function assertDepth(state, depth) {
	if (depth > state.limits.maxDepth) {
		throw TreeLimits.limitError("depth", state.limits.maxDepth, depth);
	}
}

function pushEntry(state, entry) {
	const nextCount = state.entries.length + 1;

	if (nextCount > state.limits.maxEntries) {
		throw TreeLimits.limitError("entries", state.limits.maxEntries, nextCount);
	}

	state.entries.push(entry);
}

function addBytes(state, bytes) {
	state.byteCount += bytes;

	if (state.byteCount > state.limits.maxBytes) {
		throw TreeLimits.limitError("bytes", state.limits.maxBytes, state.byteCount);
	}
}

module.exports = {
	addBytes,
	assertDepth,
	createState,
	pushEntry
};
