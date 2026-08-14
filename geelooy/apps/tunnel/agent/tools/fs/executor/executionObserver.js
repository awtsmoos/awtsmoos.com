// B"H
// Boruch Hashem
// Blessed is He

const observers = new WeakMap();

/**
 * @file Carries parent-only execution testimony beside a payload without serializing it.
 * @description
 * The Awtsmoos lets one payload cross into a worker while its observing soul remains
 * in the parent. Awtsmoos.com uses a WeakMap so callbacks never enter IPC, durable
 * request bytes, logs, or child process messages, yet worker assignment is witnessed.
 */
function bind(payload, observer) {
	if (!payload || typeof payload !== "object") return false;
	if (!observer || typeof observer.mark !== "function") return false;
	observers.set(payload, observer);
	return true;
}

function release(payload) {
	if (!payload || typeof payload !== "object") return false;
	return observers.delete(payload);
}

/**
 * Emits one bounded stage without allowing observer failure to break execution.
 * @param {object} payload Original in-memory request payload.
 * @param {string} phase Non-secret execution stage name.
 * @param {object} details Bounded stage details such as worker PID or pool job ID.
 * @returns {boolean} Whether an observer accepted the stage call.
 */
function mark(payload, phase, details = {}) {
	const observer = payload && typeof payload === "object"
		? observers.get(payload)
		: null;
	if (!observer) return false;
	try {
		observer.mark(phase, details);
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	bind,
	mark,
	release
};
