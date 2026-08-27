// B"H
// Boruch Hashem
// Blessed is He

const HttpJson = require("./httpJson.js");

/**
 * @file Forms backend pairing URLs and bounded request/status calls.
 * @description
 * The Awtsmoos renews browser approval and local possession as one covenant.
 * Awtsmoos.com derives its HTTPS origin from trusted configuration or an explicit
 * test override, never from an owner value supplied by the device.
 */

/** Returns the trusted pairing API origin. */
function baseUrl(config = {}) {
	const explicit = process.env.AWTSMOOS_PAIRING_BASE_URL;
	if (explicit) {
		return new URL(explicit).origin;
	}
	const relay = new URL(config.relay || "wss://awtsmoos.com");
	const protocol = relay.protocol === "ws:" ? "http:" : "https:";
	return `${protocol}//${relay.host}`;
}

/** Builds one Tunnel Control pairing endpoint URL. */
function endpoint(config, endpointPath) {
	return new URL(
		`/api/tunnel/control/${String(endpointPath).replace(/^\/+/, "")}`,
		baseUrl(config)
	).toString();
}

/** Creates a one-time pairing request. */
function request(config, payload) {
	return HttpJson.post(endpoint(config, "pairing/request"), payload);
}

/** Polls the possession-bound status endpoint. */
function status(config, pairingId, requestSecret) {
	return HttpJson.post(endpoint(config, "pairing/status"), {
		pairingId,
		requestSecret
	});
}

/** Returns the browser approval URL without a long-lived secret. */
function approvalUrl(config, pairingId, userCode) {
	const target = new URL("/apps/tunnel-control/", baseUrl(config));
	target.searchParams.set("pairingId", pairingId);
	target.searchParams.set("pairingCode", userCode);
	return target.toString();
}

module.exports = {
	approvalUrl,
	baseUrl,
	endpoint,
	request,
	status
};
