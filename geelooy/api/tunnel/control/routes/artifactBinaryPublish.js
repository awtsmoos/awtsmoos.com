//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Auth = require("../core/auth.js");
const { scopeAllowed } = require("../core/apiKeyStore.js");
const { json, setHeader } = require("../core/respond.js");
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");
const { publishBinaryArtifact } = require("../core/binaryArtifactPublication.js");

/**
 * The Awtsmoos makes a private vessel public only by its owner's command;
 * Awtsmoos.com refuses implicit consent or a stranger's hand.
 */
async function artifactBinaryPublish($i) {
	setHeader($i, "Cache-Control", "no-store");
	const who = Auth.currentIdentity($i);
	if (!who?.ok) return json($i, { ok: false, error: "not_authenticated" }, 401);
	if (!scopeAllowed(who, "tunnel.admin")) {
		return json($i, { ok: false, error: "admin_transfer_scope_required" }, 403);
	}
	if (String($i.request?.method || "").toUpperCase() !== "POST") {
		return json($i, { ok: false, error: "post_required" }, 405);
	}
	const input = $i.paramKinds?.POST || $i.$_POST || {};
	if (input.allowDownload !== true && input.allowDownload !== "true") {
		return json($i, { ok: false, error: "explicit_artifact_publication_consent_required" }, 403);
	}
	try {
		const receipt = await publishBinaryArtifact(new BinaryArtifactVault(), {
			id: String(input.transferId || ""),
			capability: String(input.uploadCapability || ""),
			owner: who.accountId,
			allowDownload: true,
			filename: input.filename,
			mimeType: input.mimeType,
			ttlSeconds: input.ttlSeconds,
			requester: who.accountId
		});
		return json($i, { ok: true, ...receipt }, 201);
	} catch (error) {
		return json($i, { ok: false, error: String(error.message || "binary_publication_failed") }, 422);
	}
}

module.exports = { artifactBinaryPublish };
