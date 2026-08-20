// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Device-code token grant for headless Awtsmoos.com OAuth clients.
 * @description
 * The Awtsmoos lets the daemon ask repeatedly without receiving authority until
 * consent exists; Awtsmoos.com enforces cadence, client binding, denial, expiry,
 * and one-time redemption before reusing the ordinary token/refresh vessels.
 */

const DeviceStore = require("../core/deviceStore.js");
const {
	createRefreshRecord
} = require("../core/refreshStore.js");
const Entry = require("./tokenEntries.js");

function grantError(context, result) {
	const headers = result.retryAfter
		? { "Retry-After": String(result.retryAfter) }
		: {};
	return context.json(context.$i, {
		BH: "B\"H",
		error: result.error
	}, 400, headers);
}

async function deviceCodeGrant(context) {
	const {
		$i,
		request,
		client,
		json,
		tokenResponse
	} = context;
	if (!request.client_id_provided) {
		return json($i, { BH: "B\"H", error: "invalid_client" }, 400);
	}
	if (!client.deviceAuthorization) {
		return json($i, { BH: "B\"H", error: "unauthorized_client" }, 400);
	}
	if (!request.device_code) {
		return json($i, { BH: "B\"H", error: "invalid_request" }, 400);
	}
	const result = DeviceStore.pollDeviceCode(
		request.device_code,
		client.id
	);
	if (!result.ok) {
		return grantError(context, result);
	}
	const entry = Entry.deviceCodeEntry(result.record, client);
	const refreshFactory = context.createRefreshRecord || createRefreshRecord;
	const refreshToken = client.refreshTokens === false
		? null
		: refreshFactory({
			userId: entry.userId,
			clientId: client.id,
			scope: entry.scope
		});
	return tokenResponse($i, client, entry, refreshToken);
}

module.exports = {
	deviceCodeGrant,
	grantError
};
