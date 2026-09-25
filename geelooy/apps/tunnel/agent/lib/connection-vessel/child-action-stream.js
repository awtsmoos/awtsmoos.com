// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Device = require("../../tools/fs/deviceStateRoot.js");
const ActionStream = require("../runtime/action-stream.js");

/**
 * @file Child-side action-stream emitter for the connection vessel.
 * @description
 * The connection child owns transport truth the parent never sees directly:
 * custody acceptance, acceptance replay, incarnation starts, delivery replay.
 * It records those as events in runtime/action-stream.child.jsonl using the
 * same row schema as the parent stream, so list() can merge both timelines
 * and a traceId flows end to end. The child never writes the parent's file.
 */

let cachedConfig = null;
let appendQueue = Promise.resolve();

/** Binds the emitter to the child's runtime config; call once at boot. */
function init(config) {
	cachedConfig = config || null;
}

/** Path of the child-owned stream file. */
function streamPath(config) {
	return path.join(Device.awtsmoosRoot(config || {}), "runtime", "action-stream.child.jsonl");
}

function appendRow(file, row) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, `${JSON.stringify(row)}\n`, { mode: 0o600 });
	} catch {
		// A child that cannot persist telemetry stays silent rather than crashing transport.
	}
}

/**
 * Emits one child lifecycle event. Returns the row, or null when uninitialized.
 * Failures are swallowed: telemetry must never break the connection child.
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
		appendQueue = appendQueue.then(() => appendRow(file, row)).catch(() => {});
		return row;
	} catch {
		return null;
	}
}

module.exports = {
	emit,
	init,
	streamPath
};
