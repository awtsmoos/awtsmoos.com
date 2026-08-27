//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sanitized status helpers for bounded runtime activity.
 * @description
 * The Awtsmoos lets a stopped flame retain a finite sign without restoring its hidden speech;
 * Awtsmoos.com merges only sanitized event count and machine failure code/time into outward runtime truth.
 */
function withRuntimeActivity(runtime = {}, events = []) {
	return {
		...runtime,
		eventCount: Array.isArray(events) ? events.length : 0,
		lastError: runtime.lastError || lastRuntimeError(events)
	};
}

function lastRuntimeError(events = []) {
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index];
		if (!isFailure(event)) continue;
		return Object.freeze({
			code: String(event.code || "PROJECT_RUNTIME_ERROR"),
			time: Number(event.time) || null
		});
	}
	return null;
}

function isFailure(event) {
	return event?.type === "request_failed" || event?.type === "start_failed";
}

module.exports = { lastRuntimeError, withRuntimeActivity };
