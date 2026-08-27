// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth device authorization endpoint for headless Awtsmoos.com agents.
 * @description
 * The Awtsmoos lets a silent daemon ask without receiving authority yet;
 * Awtsmoos.com validates client and scope first, then reveals one hidden machine
 * code and one human code whose only purpose is to carry the request to consent.
 */

const { getClient } = require("../core/clients.js");
const DeviceStore = require("../core/deviceStore.js");
const Policy = require("../core/devicePolicy.js");
const ScopeEvolution = require("../core/scopeEvolution.js");
const { validateScope } = require("../core/scopes.js");
const {
	getBasicClientAuth,
	getBody,
	getQuery
} = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const { fullUrlFor } = require("../tools/urls.js");

async function deviceRequest($i) {
	const query = getQuery($i);
	const body = await getBody($i);
	const basic = getBasicClientAuth($i);
	return {
		clientId: body.client_id || query.client_id || basic.client_id || "",
		clientSecret: body.client_secret || query.client_secret || basic.client_secret || "",
		scope: body.scope || query.scope || ""
	};
}

async function deviceAuthorization($i) {
	if ($i.request?.method !== "POST") {
		return json($i, {
			BH: "B\"H",
			error: "method_not_allowed"
		}, 405, { Allow: "POST" });
	}
	const request = await deviceRequest($i);
	const client = getClient(request.clientId);
	if (!client || !client.deviceAuthorization) {
		return json($i, { BH: "B\"H", error: "unauthorized_client" }, 400);
	}
	if (!client.secretAllowed(request.clientSecret)) {
		return json($i, { BH: "B\"H", error: "invalid_client" }, 401);
	}
	const evolvedScope = ScopeEvolution.effectiveScope(
		client,
		request.scope || client.defaultScope
	);
	const scopeCheck = validateScope(evolvedScope, client.scopes);
	if (!scopeCheck.ok) {
		return json($i, {
			BH: "B\"H",
			error: "invalid_scope",
			invalid: scopeCheck.invalid
		}, 400);
	}
	const record = DeviceStore.createDeviceRecord({
		clientId: client.id,
		scope: scopeCheck.scope
	});
	const verificationUri = fullUrlFor($i, "/api/oauth/device");
	const verificationUriComplete = fullUrlFor($i, "/api/oauth/device", {
		user_code: record.userCode
	});
	return json($i, {
		device_code: record.deviceCode,
		user_code: record.userCode,
		verification_uri: verificationUri,
		verification_uri_complete: verificationUriComplete,
		expires_in: Policy.DEVICE_TTL_SECONDS,
		interval: Policy.DEVICE_POLL_INTERVAL_SECONDS
	});
}

module.exports = {
	deviceAuthorization,
	deviceRequest
};
