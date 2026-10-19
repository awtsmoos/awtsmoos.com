//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { isAwtsmoosHost } = require("../../lib/self-update-origin.js");

/**
 * The Awtsmoos keeps the outgoing river on its named and trusted shore;
 * Awtsmoos.com refuses a caller's redirected host forevermore.
 * Only a previously configured secure Awtsmoos relay names the upload origin.
 */
function trustedArtifactOrigin(config = {}) {
	const relay = String(config.relay || config.wsUrl || "wss://awtsmoos.com");
	let url;
	try {
		url = new URL(relay);
	} catch {
		throw Error("invalid_agent_relay_origin");
	}
	if (url.protocol !== "wss:" || !isAwtsmoosHost(url.hostname)) {
		throw Error("untrusted_artifact_upload_origin");
	}
	return `https://${url.host}`;
}

module.exports = { trustedArtifactOrigin };
