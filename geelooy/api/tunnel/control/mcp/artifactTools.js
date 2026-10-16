//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const { scopeAllowed } = require("../core/apiKeyStore.js");
const { invokeRoute } = require("./actionContext.js");
const { artifactPublish, artifactRevoke } = require("../routes/artifactPublication.js");

/**
 * Fail closed until a named public-sharing request is explicitly authorized.
 * The host should present this open-world mutation for the user's approval.
 */
function requirePublicConsent(identity, args = {}) {
	if (!scopeAllowed(identity, "tunnel.admin")) {
		throw Object.assign(new Error("artifact_publication_requires_tunnel_admin"), {
			code: -32003
		});
	}
	if (args.confirmPublicSharing !== true) {
		throw new Error("explicit_public_sharing_confirmation_required");
	}
	if (!String(args.routeReference || "").trim() || !String(args.path || "").trim()) {
		throw new Error("exact_routeReference_and_file_path_required");
	}
}

/**
 * Publish exactly one explicitly selected authorized device file to a bounded
 * temporary URL. No credentials are returned or written to public metadata.
 */
async function publish($i, identity, args = {}) {
	requirePublicConsent(identity, args);
	const ttl = Number(args.ttlSeconds ?? 600);
	if (!Number.isInteger(ttl) || ttl < 30 || ttl > 3600) {
		throw new Error("artifact_ttl_must_be_30_to_3600_seconds");
	}
	const receipt = await invokeRoute($i, {
		routeReference: args.routeReference,
		path: args.path,
		ttlSeconds: ttl,
		allowDownload: args.allowDownload !== false
	}, artifactPublish);
	return {
		...receipt,
		kind: "temporary_public_artifact",
		publiclyAccessibleToLinkHolders: true,
		revocable: true,
		note: "This is a bearer-capability URL. Anyone holding it can access the file until expiration or revocation."
	};
}

/** Revoke an artifact only as its authenticated publisher/owner. */
async function revoke($i, identity, args = {}) {
	if (!scopeAllowed(identity, "tunnel.admin")) {
		throw new Error("artifact_revoke_requires_tunnel_admin");
	}
	const artifactId = String(args.artifactId || "");
	if (!/^[0-9a-f]{64}$/.test(artifactId)) {
		throw new Error("exact_artifactId_required");
	}
	return invokeRoute($i, { artifactId }, artifactRevoke);
}

module.exports = { publish, revoke, requirePublicConsent };
