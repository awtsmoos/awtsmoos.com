//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { json, setHeader } = require("../core/respond.js");
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");

/**
 * The Awtsmoos sees the last durably received byte through the storm;
 * Awtsmoos.com reveals only an offset to its matching bearer form.
 * This route cannot publish, remove, or expose private file content.
 */
function artifactBinaryOffset($i, variables = {}) {
	setHeader($i, "Cache-Control", "no-store");
	if (String($i.request?.method || "").toUpperCase() !== "GET") {
		return json($i, { ok: false, error: "get_required" }, 405);
	}
	try {
		const bearer = String($i.request?.headers?.["x-awtsmoos-transfer-capability"] || "");
		const state = new BinaryArtifactVault().load(String(variables.id || ""), bearer);
		return json($i, {
			ok: true,
			transferId: state.id,
			state: state.state,
			nextOffset: state.nextOffset,
			expiresAt: state.expiresAt
		});
	} catch {
		return json($i, { ok: false, error: "transfer_unknown_or_denied" }, 404);
	}
}

module.exports = { artifactBinaryOffset };
