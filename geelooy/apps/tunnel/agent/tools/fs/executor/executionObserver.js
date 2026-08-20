// B"H
// Boruch Hashem
// Blessed is He

const records = new WeakMap();

/**
 * @file Carries parent-only execution testimony and non-secret scheduling metadata.
 * @description
 * The Awtsmoos lets one payload enter a child while its lane identity remains
 * in the parent; Awtsmoos.com never serializes callbacks, timers, or observer state.
 */
function bind(payload, observer) {
	if (!payload || typeof payload !== "object") return false;
	if (!observer || typeof observer.mark !== "function") return false;
	records.set(payload, {
		metadata: sanitize(observer.metadata),
		observer
	});
	return true;
}

function metadata(payload) {
	const record = recordFor(payload);
	return record ? { ...record.metadata } : {};
}

function release(payload) {
	if (!payload || typeof payload !== "object") return false;
	return records.delete(payload);
}

function mark(payload, phase, details = {}) {
	const observer = recordFor(payload)?.observer;
	if (!observer) return false;
	try {
		observer.mark(phase, details);
		return true;
	} catch {
		return false;
	}
}

function recordFor(payload) {
	return payload && typeof payload === "object"
		? records.get(payload) || null
		: null;
}

function sanitize(value = {}) {
	return Object.freeze({
		enqueuedAt: finite(value.enqueuedAt),
		lane: String(value.lane || ""),
		requestId: String(value.requestId || "")
	});
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

module.exports = {
	bind,
	mark,
	metadata,
	release
};
