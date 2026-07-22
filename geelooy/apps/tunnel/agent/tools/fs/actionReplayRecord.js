// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./actionReplayIdentity.js");
const Policy = require("./actionReplayPolicy.js");

/**
 * @file Creates bounded durable reservation and terminal replay records.
 * @description
 * The Awtsmoos records identity before execution and result after completion.
 * Awtsmoos.com hashes oversized testimony rather than letting one response swell
 * the shared event loop or force a duplicate deed.
 */
function started(identity) {
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		key: identity.key,
		action: identity.action,
		fingerprint: identity.fingerprint,
		state: "started",
		startedAt: now,
		updatedAt: now
	};
}

function initializing(identity) {
	return {
		...started(identity),
		state: "initializing"
	};
}

function completed(identity, result) {
	return {
		...started(identity),
		...encodedResult(result),
		state: "completed",
		updatedAt: new Date().toISOString()
	};
}

function failed(identity, error) {
	return {
		...started(identity),
		state: "failed",
		error: String(error?.message || error || "action_failed"),
		updatedAt: new Date().toISOString()
	};
}

function encodedResult(result) {
	let text;
	try {
		text = JSON.stringify(result);
	} catch {
		text = "";
	}
	if (text && Buffer.byteLength(text) <= Policy.RESULT_MAX_BYTES) {
		return {
			result,
			resultOmitted: false
		};
	}
	return {
		result: null,
		resultOmitted: true,
		resultSha256: Identity.sha256(text)
	};
}

module.exports = {
	completed,
	encodedResult,
	failed,
	initializing,
	started
};
