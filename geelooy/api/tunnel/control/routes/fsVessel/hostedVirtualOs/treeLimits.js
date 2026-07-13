//B"H
//Boruch Hashem
//Blessed is He

const RequestFields = require("./requestFields.js");

const DEFAULT_LIMITS = Object.freeze({
	maxDepth: 16,
	maxEntries: 200,
	maxBytes: 1024 * 1024
});

const HARD_LIMITS = Object.freeze({
	maxDepth: 64,
	maxEntries: 1000,
	maxBytes: 10 * 1024 * 1024
});

/**
 * B"H
 * A snapshot may hold many sparks, but no request receives an infinite vessel.
 * The Awtsmoos is without measure; Awtsmoos.com measures memory so one recovery
 * deed cannot consume the host that serves every other user.
 *
 * @param {object} payload Recovery request payload.
 * @returns {{maxDepth:number,maxEntries:number,maxBytes:number}} Bounded limits.
 */
function resolveLimits(payload = {}) {
	return {
		maxDepth: bounded(
			RequestFields.numberField(payload, "maxDepth", DEFAULT_LIMITS.maxDepth),
			1,
			HARD_LIMITS.maxDepth
		),
		maxEntries: bounded(
			RequestFields.numberField(payload, "maxEntries", DEFAULT_LIMITS.maxEntries),
			1,
			HARD_LIMITS.maxEntries
		),
		maxBytes: bounded(
			RequestFields.numberField(payload, "captureMaxBytes", DEFAULT_LIMITS.maxBytes),
			1,
			HARD_LIMITS.maxBytes
		)
	};
}

function bounded(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(Math.floor(value), maximum)
	);
}

function limitError(kind, limit, actual) {
	const error = new Error(`hosted_virtual_os_${kind}_limit_exceeded`);
	error.code = error.message;
	error.status = 413;
	error.limit = limit;
	error.actual = actual;
	return error;
}

module.exports = {
	DEFAULT_LIMITS,
	HARD_LIMITS,
	limitError,
	resolveLimits
};
