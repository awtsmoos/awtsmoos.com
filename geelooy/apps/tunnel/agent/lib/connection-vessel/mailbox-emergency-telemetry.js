// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps bounded in-memory testimony for live mailbox emergency recovery.
 * @description
 * The Awtsmoos lets a healer leave a readable footprint without copying the wound.
 * Awtsmoos.com records timing, counts, reasons, and semantic outcomes only; request
 * payloads, secrets, and unbounded histories never enter this telemetry vessel.
 */
let state = initialState();

/** Records whether a live mailbox is registered with the parent emergency healer. */
function registered(registeredState, intervalMs = 0) {
	state.registered = Boolean(registeredState);
	state.intervalMs = Number(intervalMs || 0);
	state.registeredAt = state.registered ? Date.now() : 0;
	return status();
}

/**
 * Records one periodic or explicit mailbox scan without retaining mailbox contents.
 * @param {object} snapshot Mailbox health snapshot.
 * @param {string} source Recovery source such as periodic or manual.
 * @returns {object} Updated bounded telemetry.
 */
function scanned(snapshot = {}, source = "periodic") {
	state.scanCount += 1;
	state.lastScanAt = Date.now();
	state.lastSource = String(source || "periodic");
	state.lastStaleCount = Number(
		snapshot.inbox?.parentCustodyStaleCount || 0
	);
	return status();
}

/**
 * Records one completed semantic recovery result as a redacted structural summary.
 * @param {string} reason Recovery trigger reason.
 * @param {string} source Periodic, explicit, or exact-quarantine source.
 * @param {object} result Semantic recovery result.
 * @returns {object} Updated bounded telemetry.
 */
function recovered(reason, source, result = {}) {
	state.recoveryCount += 1;
	state.lastRecoveryAt = Date.now();
	state.lastReason = String(reason || "");
	state.lastSource = String(source || "manual");
	state.lastError = "";
	state.lastResult = summarize(result);
	return status();
}

/** Records a bounded recovery failure without stack traces, payloads, or secrets. */
function failed(reason, source, error) {
	state.failureCount += 1;
	state.lastRecoveryAt = Date.now();
	state.lastReason = String(reason || "");
	state.lastSource = String(source || "periodic");
	state.lastError = String(error?.code || error?.name || "mailbox_recovery_failed");
	state.lastResult = null;
	return status();
}

/** Returns a detached snapshot safe for status/reporting surfaces. */
function status() {
	return {
		...state,
		lastResult: state.lastResult ? { ...state.lastResult } : null
	};
}

/** Restores deterministic empty telemetry for tests or fresh process startup. */
function reset() {
	state = initialState();
	return status();
}

function summarize(result = {}) {
	return {
		ok: result.ok !== false,
		attempted: Boolean(result.attempted),
		expired: Number(result.expired || 0),
		actionCount: Array.isArray(result.actions) ? result.actions.length : 0,
		replacementRequired: Boolean(result.replacementRequired),
		replacementRequested: Boolean(result.replacement),
		safeToRedispatch: result.safeToRedispatch === true,
		reason: String(result.reason || "")
	};
}

function initialState() {
	return {
		registered: false,
		registeredAt: 0,
		intervalMs: 0,
		scanCount: 0,
		recoveryCount: 0,
		failureCount: 0,
		lastScanAt: 0,
		lastRecoveryAt: 0,
		lastSource: "",
		lastReason: "",
		lastStaleCount: 0,
		lastError: "",
		lastResult: null
	};
}

module.exports = {
	failed,
	recovered,
	registered,
	reset,
	scanned,
	status
};
