// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
	provenBinding
} = require("../core/test/provenanceFixture.cjs");

/**
 * @file Proves preview proxy authorization precedes canonical owner relay routing.
 * @description
 * The Awtsmoos renews account, tunnel, proof, and preview without permitting a
 * guessed name to become authority. Awtsmoos.com tests foreign denial and owner
 * routing with explicit possession-backed fixture testimony and no operational relay.
 */
test("denies foreign preview and routes owner through canonical account", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-proxy-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require("../core/store.js");
		const { previewProxy } = require("./previewProxy.js");
		writeStore(storeFixture());
		const calls = [];
		const denied = await previewProxy(
			contextFixture("account-b", calls),
			{ tunnelName: "alpha" }
		);
		assert.equal(denied.ok, false);
		assert.equal(denied.error, "tunnel_not_found");
		assert.equal(calls.length, 0);
		const allowed = await previewProxy(
			contextFixture("account-a", calls),
			{ tunnelName: "alpha" }
		);
		assert.equal(allowed, "preview-ok");
		assert.deepEqual(calls[0].slice(0, 2), ["account-a", "alpha"]);
		assert.equal(calls[0][2].action, "httpRequest");
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

function contextFixture(accountId, calls) {
	return {
		request: {
			method: "GET",
			headers: { cookie: "secret", accept: "text/html" },
			user: {
				authorized: true,
				info: { userId: accountId, accountId }
			}
		},
		response: {
			statusCode: 200,
			setHeader() {}
		},
		paramKinds: { GET: { path: "/" }, POST: {} },
		ws: {
			async sendTunnelRequest(...argumentsList) {
				calls.push(argumentsList);
				return {
					ok: true,
					status: 200,
					headers: { "content-type": "text/html" },
					body: "preview-ok"
				};
			}
		}
	};
}
