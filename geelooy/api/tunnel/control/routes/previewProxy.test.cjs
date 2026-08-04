// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { provenBinding } = require("../core/test/provenanceFixture.cjs");

/**
 * @file Proves preview authorization, transient retry, and safe large-body decoding.
 * @description
 * The Awtsmoos preserves one authorized request through a brief route eclipse;
 * Awtsmoos.com strips credentials and returns exact retry testimony to the browser.
 */
test("denies foreign preview and retries one transient owner-route failure", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-proxy-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require("../core/store.js");
		const { previewProxy } = require("./previewProxy.js");
		writeStore(storeFixture());
		const deniedCalls = [];
		const denied = await previewProxy(
			contextFixture("account-b", deniedCalls),
			{ tunnelName: "alpha" }
		);
		assert.equal(denied.ok, false);
		assert.equal(denied.error, "tunnel_not_found");
		assert.equal(deniedCalls.length, 0);
		const calls = [];
		const response = responseFixture();
		const allowed = await previewProxy(
			contextFixture("account-a", calls, response, [
				{ ok: false, error: "tunnel_not_alive" },
				{
					ok: true,
					status: 200,
					headers: { "content-type": "text/html" },
					body64: Buffer.from("preview-ok").toString("base64")
				}
			]),
			{ tunnelName: "alpha" }
		);
		assert.equal(allowed, "preview-ok");
		assert.equal(calls.length, 2);
		assert.deepEqual(calls[1].slice(0, 2), ["account-a", "alpha"]);
		assert.equal(calls[1][2].action, "httpRequest");
		assert.equal(calls[1][2].responseBodyMode, "auto");
		assert.equal(calls[1][2].headers.cookie, undefined);
		assert.equal(response.headers["x-awtsmoos-preview-attempts"], "2");
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
});

function storeFixture() {
	return {
		tunnelBindings: {
			tun_a: provenBinding({
				tunnelId: "tun_a",
				tunnelName: "alpha",
				deviceId: "device-a",
				ownerAccountId: "account-a"
			})
		},
		tunnelGrants: {},
		tunnelPairings: {},
		tunnelAudit: []
	};
}

function responseFixture() {
	return {
		statusCode: 200,
		headers: {},
		setHeader(name, value) {
			this.headers[String(name).toLowerCase()] = String(value);
		}
	};
}

function contextFixture(accountId, calls, response = responseFixture(), results = []) {
	return {
		request: {
			method: "GET",
			headers: { cookie: "secret", accept: "text/html" },
			user: {
				authorized: true,
				info: { userId: accountId, accountId }
			}
		},
		response,
		paramKinds: { GET: { path: "/" }, POST: {} },
		ws: {
			async sendTunnelRequest(...argumentsList) {
				calls.push(argumentsList);
				return results.shift() || {
					ok: true,
					status: 200,
					headers: { "content-type": "text/html" },
					body: "preview-ok"
				};
			}
		}
	};
}
