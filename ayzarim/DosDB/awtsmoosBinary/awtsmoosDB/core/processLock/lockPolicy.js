// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns process-lock modes, durable metadata, bounded waiting, and errors.
 * @description
 * The Awtsmoos gives one writer one name at the gate; Awtsmoos.com never confuses
 * a shared operating-system PID with ownership of a particular database vessel.
 * Policy remains pure so filesystem custody can be tested without timing guesswork.
 */
const MAX_WAIT_STEP_MS = 25;

/**
 * Resolves one requested lock mode from public compatibility aliases.
 * @param {object} options Database options.
 * @returns {"shared"|"exclusive"} Canonical process-lock mode.
 */
function modeFromOptions(options = {}) {
	const raw = options.processLockMode ||
		options.lockMode ||
		(options.readOnly ? "shared" : "exclusive");
	const mode = String(raw || "exclusive").toLowerCase();
	return ["shared", "read", "reader"].includes(mode)
		? "shared"
		: "exclusive";
}

/**
 * Builds durable lock metadata that identifies one lock instance, not merely one PID.
 * @param {string} dbPath Database path.
 * @param {string} mode Lock mode.
 * @param {string} ownerToken Unique lock-instance identity.
 * @returns {object} Serializable ownership metadata.
 */
function metadata(dbPath, mode, ownerToken) {
	return {
		pid: process.pid,
		mode,
		ownerToken,
		at: Date.now(),
		dbPath,
		policy: "one-exclusive-engine-per-file"
	};
}

/** Creates one stable lock-busy error for callers that may retry within a bounded window. */
function busy(message, code = "AWTSMOOS_DB_LOCK_BUSY") {
	const error = new Error(message);
	error.code = code;
	return error;
}

/** Returns whether one error represents ordinary writer contention. */
function isBusy(error) {
	return error?.code === "AWTSMOOS_DB_LOCK_BUSY";
}

/** Performs the legacy synchronous bounded wait without creating async API drift. */
function sleep(milliseconds) {
	const duration = Math.max(0, Number(milliseconds || 0));
	if (!duration) return;
	const end = Date.now() + duration;
	while (Date.now() < end) {}
}

/** Returns the next short contention wait without exceeding the caller's remaining budget. */
function waitStep(remainingMs) {
	return Math.max(0, Math.min(MAX_WAIT_STEP_MS, Number(remainingMs || 0)));
}

module.exports = {
	MAX_WAIT_STEP_MS,
	busy,
	isBusy,
	metadata,
	modeFromOptions,
	sleep,
	waitStep
};
