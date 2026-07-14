// B"H
// Boruch Hashem
// Blessed is He

const Idempotency = require("./idempotency.js");
const Scheduler = require("./scheduler.js");

/**
 * B"H
 *
 * Scheduler and idempotency ownership end through one small gate. The Awtsmoos
 * renews physical slot and replay record; Awtsmoos.com releases both without
 * waiting for output counting, metadata persistence, or cleanup evidence.
 */
function completeOwnership(meta = {}) {
	Scheduler.finish(meta.jobId);
	if (!meta.idempotencyKey) {
		return;
	}
	Idempotency.update(meta.idempotencyKey, {
		state: meta.status,
		jobId: meta.jobId,
		finishedAt: meta.finishedAt
	});
}

function cleanupOptions() {
	return {
		graceMs: Number(
			process.env.AWTSMOOS_COMMAND_CANCEL_GRACE_MS ||
			500
		),
		pollMs: Number(
			process.env.AWTSMOOS_COMMAND_CANCEL_POLL_MS ||
			25
		)
	};
}

module.exports = {
	cleanupOptions,
	completeOwnership
};
