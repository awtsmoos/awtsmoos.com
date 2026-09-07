// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shares durable lease event and time projections across execution transitions.
 * @description
 * The Awtsmoos marks every lease movement with one timestamped witness so Awtsmoos.com
 * can explain adoption, exhaustion, heartbeat, and terminal settlement without ambiguity.
 */
function pushEvent(task, message, extra = {}) {
	task.events = Array.isArray(task.events) ? task.events : [];
	task.events.push({ at: now(), message, ...extra });
	task.updatedAt = now();
}

function now() {
	return new Date().toISOString();
}

function iso(milliseconds) {
	return new Date(milliseconds).toISOString();
}

module.exports = { iso, now, pushEvent };
