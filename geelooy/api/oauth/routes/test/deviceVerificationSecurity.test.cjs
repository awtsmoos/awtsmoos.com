// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the human device-verification gate cannot leak machine authority.
 * @description
 * The Awtsmoos lets the person see one short code but never the daemon's hidden
 * device code or OAuth credentials; these tests prove login, consent, generic
 * failures, anti-framing headers, and bounded online guessing before approval.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const DeviceStore = require("../../core/deviceStore.js");
const Limiter = require("../../core/deviceVerifyLimiter.js");
const { deviceVerification } = require("../deviceVerification.js");

function context(options = {}) {
	return {
		request: {
			method: options.method || "GET",
			query: options.query || {},
			body: options.body || {},
			user: options.user || null,
			ip: options.ip || "203.0.113.10",
			headers: {
				"x-forwarded-host": "verify.test",
				"x-forwarded-proto": "https"
			}
		}
	};
}

function pendingRecord() {
	return DeviceStore.createDeviceRecord({
		clientId: "external-agent",
		scope: "profile tunnel.read tunnel.mission tunnel.room"
	});
}

test.beforeEach(() => {
	DeviceStore.resetDeviceStore();
	Limiter.resetLimiter();
});

test("empty verification page has anti-leak and anti-frame headers", async () => {
	const response = await deviceVerification(context());
	assert.equal(response.statusCode, 200);
	assert.equal(response.headers["Cache-Control"], "no-store");
	assert.equal(response.headers["Referrer-Policy"], "no-referrer");
	assert.equal(response.headers["X-Frame-Options"], "DENY");
	assert.match(response.headers["Content-Security-Policy"], /frame-ancestors 'none'/);
	assert.match(response.response, /Connect an AI Device/);
});

test("valid device code requires login and preserves the user code", async () => {
	const record = pendingRecord();
	const response = await deviceVerification(context({
		query: { user_code: record.userCode }
	}));
	assert.equal(response.statusCode, 302);
	const login = new URL(response.headers.Location);
	assert.equal(login.pathname, "/login/");
	const next = new URL(login.searchParams.get("next"));
	assert.equal(next.pathname, "/api/oauth/device");
	assert.equal(next.searchParams.get("user_code"), record.userCode);
});

test("logged-in review shows consent details but no machine authority", async () => {
	const record = pendingRecord();
	const response = await deviceVerification(context({
		query: { user_code: record.userCode },
		user: { id: "human-1" }
	}));
	assert.equal(response.statusCode, 200);
	assert.match(response.response, new RegExp(record.userCode));
	assert.match(response.response, /Universal External AI Agent/);
	assert.match(response.response, /tunnel\.read/);
	assert.equal(response.response.includes(record.deviceCode), false);
	assert.equal(response.response.includes("access_token"), false);
	assert.equal(response.response.includes("refresh_token"), false);
});

test("logged-in human can explicitly approve and deny separate requests", async () => {
	const approved = pendingRecord();
	const approval = await deviceVerification(context({
		method: "POST",
		body: { user_code: approved.userCode, decision: "approve" },
		user: { id: "human-approve" }
	}));
	assert.equal(approval.statusCode, 200);
	assert.equal(DeviceStore.readByUserCode(approved.userCode).status, "approved");
	const denied = pendingRecord();
	await deviceVerification(context({
		method: "POST",
		body: { user_code: denied.userCode, decision: "deny" },
		user: { id: "human-deny" }
	}));
	assert.equal(DeviceStore.readByUserCode(denied.userCode).status, "denied");
});

test("repeated invalid user codes are rate limited generically", async () => {
	for (let attempt = 1; attempt <= 5; attempt += 1) {
		const response = await deviceVerification(context({
			query: { user_code: "ZZZZ-ZZZZ" },
			ip: "198.51.100.77"
		}));
		assert.equal(response.statusCode, attempt < 5 ? 400 : 429);
		assert.match(response.response, /invalid or expired|Too many invalid/i);
		if (attempt === 5) {
			assert.ok(Number(response.headers["Retry-After"]) > 0);
		}
	}
});
