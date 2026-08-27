// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves device authorization creation, policy, approval, and redemption.
 * @description
 * The Awtsmoos gives the headless client only a request until the human approves;
 * these tests prove Awtsmoos.com binds client, scope, short code, refresh issuance,
 * and one-time token redemption without granting legacy clients a hidden new path.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { getClient } = require("../../core/clients.js");
const DeviceStore = require("../../core/deviceStore.js");
const Limiter = require("../../core/deviceVerifyLimiter.js");
const { deviceAuthorization } = require("../deviceAuthorization.js");
const { deviceCodeGrant } = require("../deviceGrant.js");

function routeContext(body) {
	return {
		request: {
			method: "POST",
			body,
			headers: {
				"x-forwarded-host": "device.test",
				"x-forwarded-proto": "https"
			}
		}
	};
}

test.beforeEach(() => {
	DeviceStore.resetDeviceStore();
	Limiter.resetLimiter();
});

test("external-agent receives independent machine and human codes", async () => {
	const response = await deviceAuthorization(routeContext({
		client_id: "external-agent"
	}));
	assert.equal(response.statusCode, 200);
	const body = JSON.parse(response.response);
	assert.match(body.device_code, /^awt_device_[A-Za-z0-9_-]+$/);
	assert.match(body.user_code, /^[BCDFGHJKMNPQRSTVWXYZ]{4}-[BCDFGHJKMNPQRSTVWXYZ]{4}$/);
	assert.notEqual(body.device_code.includes(body.user_code.replace("-", "")), true);
	assert.equal(body.expires_in, 900);
	assert.equal(body.interval, 5);
	assert.equal(body.verification_uri, "https://device.test/api/oauth/device");
	assert.match(body.verification_uri_complete, /user_code=/);
});

test("legacy ChatGPT is not silently granted device authorization", async () => {
	const response = await deviceAuthorization(routeContext({
		client_id: "chatgpt"
	}));
	assert.equal(response.statusCode, 400);
	assert.equal(JSON.parse(response.response).error, "unauthorized_client");
});

test("approved device code issues one token response and refresh credential", async () => {
	const client = getClient("external-agent");
	const record = DeviceStore.createDeviceRecord({
		clientId: client.id,
		scope: client.defaultScope
	});
	DeviceStore.approveUserCode(record.userCode, "device-user");
	let refreshDetails = null;
	const context = {
		$i: {},
		request: {
			client_id_provided: true,
			device_code: record.deviceCode
		},
		client,
		json: (_$i, body, status, headers) => ({ body, status, headers }),
		createRefreshRecord(details) {
			refreshDetails = details;
			return "refresh-device-test";
		},
		tokenResponse: (_$i, _client, entry, refreshToken) => ({
			ok: true,
			entry,
			refreshToken
		})
	};
	const first = await deviceCodeGrant(context);
	assert.equal(first.ok, true);
	assert.equal(first.entry.userId, "device-user");
	assert.equal(first.refreshToken, "refresh-device-test");
	assert.equal(refreshDetails.clientId, "external-agent");
	assert.equal(DeviceStore.readByUserCode(record.userCode), null);
	const second = await deviceCodeGrant(context);
	assert.equal(second.body.error, "invalid_grant");
});
