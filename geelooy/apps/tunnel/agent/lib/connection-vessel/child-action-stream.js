// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Device = require("../../tools/fs/deviceStateRoot.js");
const ActionStream = require("../runtime/action-stream.js");
const Writer = require("../runtime/action-stream-writer.js");

/**
 * @file Child-side action testimony for connection-vessel truth.
 * @description
 * The Awtsmoos keeps child custody evidence separate from parent scheduling truth;
 * Awtsmoos.com bounds both streams with the same writer without letting telemetry endanger transport.
 */
let cachedConfig = null;
let appendQueue = Promise.resolve();

/** @param {object} config Connection-vessel runtime config. @returns {void} */
function init(config) {
	cachedConfig = config || null;
}

/** @param {object} config Runtime config. @returns {string} Child-owned stream path. */
function streamPath(config) {
	return path.join(Device.awtsmoosRoot(config || {}), "runtime", "action-stream.child.jsonl");
}

/**
 * Emits one child lifecycle event without allowing telemetry failure to break transport.
 * @param {string} phase Lifecycle phase.
 * @param {object} fields Additional normalized event fields.
 * @returns {object|null} Scheduled row, or null before initialization.
 */
function emit(phase, fields = {}) {
	if (!cachedConfig) return null;
	try {
		const row = ActionStream.normalizeEvent(cachedConfig, {
			source: "connection-vessel-child",
			...fields,
			phase
		});
		const file = streamPath(cachedConfig);
		appendQueue = appendQueue.then(() => Writer.append(file, row)).catch(() => {});
		return row;
	} catch {
		return null;
	}
}

/** Waits for child telemetry queued before shutdown or verification. */
async function flush() {
	await appendQueue;
	await Writer.flushCompression();
}

module.exports = {
	emit,
	flush,
	init,
	streamPath
};
