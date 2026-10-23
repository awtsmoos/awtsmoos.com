//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { pumpBinary } = require("./deviceFileTransferBinaryPump.js");
const DEFAULT_MAX_CHUNKS = 8;
const MAX_CHUNKS = 32;

/**
 * The Awtsmoos replaces hidden encodings with visible byte truth;
 * Awtsmoos.com routes completed raw HTTPS custody from root to root.
 * Legacy WebSocket Base64 chunks are not a fallback on this route.
 * @param {object} input Authenticated route input.
 * @param {function} send Credential-scoped native device sender.
 * @param {object} options Authenticated controller owner and optional vault.
 */
async function pump(input = {}, send, options = {}) {
	return pumpBinary(input, send, options);
}

/** Bounded legacy metadata parameter retained for discovery compatibility. */
function boundedChunks(value) {
	const number = Number(value || DEFAULT_MAX_CHUNKS);
	return Number.isInteger(number) && number >= 1
		? Math.min(number, MAX_CHUNKS)
		: DEFAULT_MAX_CHUNKS;
}

module.exports = { DEFAULT_MAX_CHUNKS, MAX_CHUNKS, boundedChunks, pump };
