// B"H
// Boruch Hashem
// Blessed is He

const Instructions = require("./connectionInstructionCatalog.js");
const Modes = require("./responseModes.js");
const Pruner = require("./responsePruner.js");

/**
 * @file Chooses one generic response profile for every tunnel result.
 * @description
 * The Awtsmoos needs no action-specific maze. Awtsmoos.com chooses by connection intent:
 * a small receipt by default, deliberate detail when asked, or an expiring reference when
 * large evidence should remain complete without making each conversational vessel sink.
 */
function projectTunnelResponse(result = {}, payload = {}) {
	if (!isTunnelResponse(result)) return result;
	const mode = Modes.normalizeMode(payload.responseMode);
	if (mode === "detail" || mode === "debug" || mode === "inline") {
		return result;
	}
	if (["auto", "ephemeral", "ref", "url"].includes(mode)) {
		return Modes.maybeExternalize(result, payload);
	}
	const compact = Pruner.pruneTunnelResponse(result, payload);
	attachDetailReference(compact, result, payload);
	return compact;
}

function isTunnelResponse(result = {}) {
	return result.type === "TUNNEL_RESPONSE" ||
		Boolean(result.tunnelName && (
			result.controlRequestId ||
			result.jobId ||
			result.routeReference
		));
}

function attachDetailReference(compact, result, payload) {
	const rawBytes = Modes.jsonBytes(result);
	const compactBytes = Modes.jsonBytes(compact);
	if (rawBytes <= Modes.DEFAULT_MAX_INLINE_BYTES) return;
	if (rawBytes - compactBytes < 2048) return;
	Object.assign(compact, Modes.detailReference(result, payload));
	const keys = new Set(compact.connectionContext?.instructionKeys || []);
	keys.add("detail-reference");
	compact.connectionContext.instructionKeys = [...keys];
	compact.connectionContext.instructionCatalogDigest = Instructions.CATALOG_DIGEST;
}

module.exports = {
	isTunnelResponse,
	projectTunnelResponse
};
