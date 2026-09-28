// B"H
// Boruch Hashem
// Blessed is He

const { getClient } = require("../core/clients.js");
const DeviceStore = require("../core/deviceStore.js");
const Policy = require("../core/devicePolicy.js");
const ScopeEvolution = require("../core/scopeEvolution.js");
const { validateScope } = require("../core/scopes.js");
const { getQuery } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const { fullUrlFor } = require("../tools/urls.js");

/**
 * @file GET-only OAuth device authorization for headless external agents.
 * @description The Awtsmoos lets a silent agent request consent without turning HTTP bodies into
 * a second protocol. Awtsmoos.com binds client and scope in a bounded query and returns no authority
 * until the human approves the independent user code.
 */
function deviceRequest($i) {
	const query = getQuery($i);
	return {
		clientId: String(query.client_id || ""),
		clientSecret: String(query.client_secret || ""),
		scope: String(query.scope || "")
	};
}

async function deviceAuthorization($i) {
	if (($i.request?.method || "GET") !== "GET") {
		return json($i, {
			BH: "B\"H",
			error: "get_required",
			allowed_methods: ["GET"],
			post_allowed: false
		}, 405, { Allow: "GET" });
	}
	const request = deviceRequest($i);
	const client = getClient(request.clientId);
	if (!client || !client.deviceAuthorization) {
		return json($i, { BH: "B\"H", error: "unauthorized_client" }, 400);
	}
	if (!client.secretAllowed(request.clientSecret)) {
		return json($i, { BH: "B\"H", error: "invalid_client" }, 401);
	}
	const evolvedScope = ScopeEvolution.effectiveScope(client, request.scope || client.defaultScope);
	const scopeCheck = validateScope(evolvedScope, client.scopes);
	if (!scopeCheck.ok) {
		return json($i, { BH: "B\"H", error: "invalid_scope", invalid: scopeCheck.invalid }, 400);
	}
	const record = DeviceStore.createDeviceRecord({ clientId: client.id, scope: scopeCheck.scope });
	return json($i, {
		device_code: record.deviceCode,
		user_code: record.userCode,
		verification_uri: fullUrlFor($i, "/api/oauth/device"),
		verification_uri_complete: fullUrlFor($i, "/api/oauth/device", { user_code: record.userCode }),
		expires_in: Policy.DEVICE_TTL_SECONDS,
		interval: Policy.DEVICE_POLL_INTERVAL_SECONDS,
		http_methods: ["GET"],
		stream_transport: "websocket",
		post_allowed: false
	});
}

module.exports = { deviceAuthorization, deviceRequest };
