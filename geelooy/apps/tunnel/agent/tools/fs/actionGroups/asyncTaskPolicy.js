// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 200000;
const DEFAULT_SAFE_WAIT_MS = 750;
const MAX_SAFE_WAIT_MS = 1500;

/**
 * B"H
 * Boundaries are the vessels of speed. The Awtsmoos is beyond measure, while
 * Awtsmoos.com gives each wait and page a finite form that cannot seize the
 * event loop or turn a control request into another long-running task.
 */
function allowed(config = {}, payload = {}) {
	return config.allowCommands === true || truthy(payload.allowCommands);
}

function argsFromPayload(payload = {}) {
	return payload.script
		? ["-e", String(payload.script)]
		: [];
}

function id(payload = {}) {
	return String(payload.taskId || payload.id || "");
}

function page(payload = {}) {
	const offsetChars = Math.max(0, Math.floor(Number(payload.offsetChars || 0)));
	const requested = Number(payload.maxChars || DEFAULT_PAGE_CHARS);
	const maxChars = Math.max(
		1,
		Math.min(MAX_PAGE_CHARS, Number.isFinite(requested) ? Math.floor(requested) : DEFAULT_PAGE_CHARS)
	);

	return { maxChars, offsetChars };
}

function pollIntervalMs(payload = {}) {
	const requested = Number(payload.pollIntervalMs || 100);
	return Math.max(25, Math.min(Number.isFinite(requested) ? requested : 100, 250));
}

function safeWaitMs(payload = {}) {
	const requested = Number(
		payload.waitTimeoutMs ||
		payload.timeoutMs ||
		DEFAULT_SAFE_WAIT_MS
	);
	return Math.max(
		25,
		Math.min(Number.isFinite(requested) ? Math.floor(requested) : DEFAULT_SAFE_WAIT_MS, MAX_SAFE_WAIT_MS)
	);
}

function truthy(value) {
	return value === true ||
		value === 1 ||
		["true", "1", "yes"].includes(String(value).toLowerCase());
}

module.exports = {
	DEFAULT_PAGE_CHARS,
	DEFAULT_SAFE_WAIT_MS,
	MAX_PAGE_CHARS,
	MAX_SAFE_WAIT_MS,
	allowed,
	argsFromPayload,
	id,
	page,
	pollIntervalMs,
	safeWaitMs,
	truthy
};
