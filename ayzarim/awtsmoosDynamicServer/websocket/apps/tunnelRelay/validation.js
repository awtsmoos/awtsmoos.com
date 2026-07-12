// B"H

const Aliases = require("./actionAliases.js");
const Identity = require("./responseIdentity.js");
const Rules = require("./mismatchRules.js");

function mismatchResponse(expected, data, flags) {
	return {
		BH: "B\"H",
		ok: false,
		status: 409,
		error: "tunnel_response_correlation_mismatch",
		correlationMismatch: true,
		...flags,
		expected,
		actual: Identity.actualIdentity(data)
	};
}

/**
 * B"H — Aliases may share a worker but never an identity. The requested action
 * remains visible while the canonical worker is validated as an allowed servant,
 * and every job, stream, command, directory, agent, and project still must match.
 */
function validateTunnelResponse(expected, data = {}) {
	if (!expected) return { ok: true };
	const flags = Rules.mismatchFlags(expected, data);
	return Object.values(flags).some(Boolean)
		? { ok: false, response: mismatchResponse(expected, data, flags) }
		: { ok: true };
}

module.exports = {
	actualJobId: Identity.actualJobId,
	actualPaths: Identity.actualPaths,
	actualStream: Identity.actualStream,
	allowedActionAlias: Aliases.allowed,
	mismatchResponse,
	validateTunnelResponse
};
