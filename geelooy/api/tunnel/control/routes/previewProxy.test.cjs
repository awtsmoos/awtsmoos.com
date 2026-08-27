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
 * @file Proves preview authorization, byte fidelity, and method-aware retry.
 * @description
 * The Awtsmoos carries a read through a route eclipse without repeating a mutation.
 * Binary bodies, ranges, status, and safe headers arrive without UTF-8 corruption.
 */
test("GET retries transient failure and preserves binary range bytes", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const response = responseFixture();
		const bytes = Buffer.from([0, 255, 17, 128, 64]);
		const output = await previewProxy(contextFixture("GET", calls, response, [
			{ ok: false, error: "tunnel_not_alive" },
			{
				ok: true,
				status: 206,
				headers: {
					"content-type": "application/octet-stream",
					"content-range": "bytes 0-4/5",
					"set-cookie": "secret=1"
				},
				body64: bytes.toString("base64")
			}
		]), { tunnelName: "alpha" });
		assert.ok(Buffer.isBuffer(output));
		assert.deepEqual(output, bytes);
		assert.equal(calls.length, 2);
		assert.equal(calls[0][2].responseBodyMode, "base64");
		assert.equal(response.statusCode, 206);
		assert.equal(response.headers["content-range"], "bytes 0-4/5");
		assert.equal(response.headers["set-cookie"], undefined);
		assert.equal(response.headers["x-awtsmoos-preview-attempts"], "2");
	});
});

test("POST mutation is never replayed after uncertain failure", async () => {
	await withStore(async ({ previewProxy }) => {
		const calls = [];
		const output = await previewProxy(contextFixture("POST", calls, responseFixture(), [
			{ ok: false, error: "acceptance_timeout" },
			{ ok: true, status: 200, body: "must-not-run" }
		]), { tunnelName: "alpha" });
		assert.equal(output.ok, false);
		assert.equal(output.error, "acceptance_timeout");
		assert.equal(calls.length, 1);
		assert.equal(calls[0][2].method, "POST");
		assert.deepEqual(calls[0][2].body, { value: 7 });
	});
});

async function withStore(run) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-proxy-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require("../core/store.js");
		writeStore(storeFixture());
		await run(require("./previewProxy.js"));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
}

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

function contextFixture(method, calls, response, results) {
	return {
		request: {
			method,
			headers: { cookie: "secret", range: "bytes=0-4" },
			rawBody: method === "POST" ? { value: 7 } : undefined,
			user: {
				authorized: true,
				info: { userId: "account-a", accountId: "account-a" }
			}
		},
		response,
		paramKinds: { GET: { path: "/asset.bin" }, POST: { value: 7 } },
		ws: {
			async sendTunnelRequest(...argumentsList) {
				calls.push(argumentsList);
				return results.shift();
			}
		}
	};
}
