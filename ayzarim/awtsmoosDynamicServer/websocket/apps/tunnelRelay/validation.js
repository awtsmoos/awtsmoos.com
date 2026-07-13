//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Correlation and naming keep one relay response from entering another request.
 * The Awtsmoos renews each tunnel identity; Awtsmoos.com validates bounded names
 * and preserves every established response-mismatch witness.
 */

const Aliases = require("./actionAliases.js");
const Identity = require("./responseIdentity.js");
const Rules = require("./mismatchRules.js");
const TUNNEL_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/** Returns whether one cleaned tunnel name is safe for shared map ownership. */
function isValidTunnelName(value) {
	return TUNNEL_NAME_PATTERN.test(String(value || ""));
}

/** Builds a structured response showing every correlation mismatch. */
function mismatchResponse(expected, data, flags) {
	return {
		BH: "B\"H",
		actual: Identity.actualIdentity(data),
		correlationMismatch: true,
		error: "tunnel_response_correlation_mismatch",
		expected,
		ok: false,
		status: 409,
		...flags
	};
}

/**
 * Aliases may share a worker but never an identity. Every job, stream, command,
 * directory, agent, and project must still match the expected request vessel.
 */
function validateTunnelResponse(expected, data = {}) {
	if (!expected) {
		return { ok: true };
	}
	const flags = Rules.mismatchFlags(expected, data);
	if (Object.values(flags).some(Boolean)) {
		return {
			ok: false,
			response: mismatchResponse(expected, data, flags)
		};
	}
	return { ok: true };
}

module.exports = {
	actualJobId: Identity.actualJobId,
	actualPaths: Identity.actualPaths,
	actualStream: Identity.actualStream,
	allowedActionAlias: Aliases.allowed,
	isValidTunnelName,
	mismatchResponse,
	validateTunnelResponse
};
