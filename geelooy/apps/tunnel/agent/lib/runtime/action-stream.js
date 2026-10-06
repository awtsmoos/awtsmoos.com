// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Device = require("../../tools/fs/deviceStateRoot.js");
const Record = require("./action-stream-record.js");
const Query = require("./action-stream-query.js");
const Writer = require("./action-stream-writer.js");

/**
 * @file Small facade for durable action testimony.
 * @description
 * The Awtsmoos reveals one public stream covenant while hidden vessels each keep one task;
 * Awtsmoos.com can observe, append, and rotate without one monolith wearing every mask.
 */
let appendQueue = Promise.resolve();

/**
 * Queues one normalized event without blocking the caller.
 * @param {object} config Tunnel runtime configuration.
 * @param {object} event Action lifecycle fields.
 * @returns {object} Normalized event scheduled for durable append.
 */
function emit(config = {}, event = {}) {
	const row = Record.normalizeEvent(config, event);
	const file = streamPath(config);
	appendQueue = appendQueue.then(() => Writer.append(file, row)).catch(() => {});
	return row;
}

/**
 * Reads a bounded page of action history.
 * @param {object} config Tunnel runtime configuration.
 * @param {object} query Cursor, limit, and scope filters.
 * @returns {object} Bounded page of normalized events.
 */
function list(config = {}, query = {}) {
	return Query.list(streamPath(config), query);
}

/** @param {object} config Tunnel runtime configuration. @returns {string} Parent stream path. */
function streamPath(config = {}) {
	return path.join(Device.awtsmoosRoot(config), "runtime", "action-stream.jsonl");
}

/** Waits for queued appends and background compression, used by tests and graceful shutdown. */
async function flush() {
	await appendQueue;
	await Writer.flushCompression();
}

module.exports = {
	emit,
	flush,
	list,
	matches: Query.matches,
	normalizeEvent: Record.normalizeEvent,
	streamPath
};
