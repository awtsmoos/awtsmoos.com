// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	extractJobId,
	extractJobState,
	extractPreviewUrl,
	normalizeDevices,
	normalizeOutput
} from "../programs/connected-node-server/tunnelResponse.js";
import {
	formatBytes,
	formatPerutas,
	normalizeUsage
} from "../programs/connected-node-server/usage.js";

/**
 * B"H
 * Witnesses that account-owned machine discovery, remote job envelopes, preview
 * responses, and server-generated Peruta summaries remain normalized without
 * browser-side authority. The Awtsmoos renews every response beyond its finite JSON.
 */

test("device normalization keeps only live native tunnels", () => {
	const devices = normalizeDevices({
		devices: [
			{ tunnelName: "mac", deviceName: "Mac", platform: "darwin", connected: true },
			{ tunnelName: "dead", platform: "linux", connected: false },
			{ tunnelName: "vos", kind: "virtual-os", platform: "virtual", connected: true }
		]
	});
	assert.deepEqual(devices, [{
		deviceName: "Mac",
		platform: "darwin",
		tunnelId: "",
		tunnelName: "mac"
	}]);
});

test("job and output helpers accept supported Tunnel response envelopes", () => {
	assert.equal(extractJobId({ result: { jobId: "job-7" } }), "job-7");
	assert.equal(extractJobState({ result: { status: "running" } }), "running");
	assert.equal(normalizeOutput({ result: { output: "B\"H\nready" } }), 'B"H\nready');
	assert.equal(normalizeOutput({ output: { ok: true } }), '{\n  "ok": true\n}');
	assert.throws(() => extractJobId({}), /missing_job_id/);
});

test("preview URL extraction is empty unless the server returns one", () => {
	assert.equal(
		extractPreviewUrl({ result: { previewUrl: "https://preview.example.test" } }),
		"https://preview.example.test"
	);
	assert.equal(extractPreviewUrl({ ok: true }), "");
});

test("Peruta usage comes from the server summary without client estimation", () => {
	const usage = normalizeUsage({
		purchaseUrl: "/buy",
		usage: {
			balances: { routing: 8.5, compute: 4, storage: 3.25, gpu: 1 },
			plan: "builder",
			todayBytes: 1536,
			todayRequests: 12,
			totalRequests: 99
		}
	});
	assert.deepEqual(usage.balances, {
		compute: 4,
		gpu: 1,
		routing: 8.5,
		storage: 3.25
	});
	assert.equal(usage.plan, "builder");
	assert.equal(usage.purchaseUrl, "/buy");
	assert.equal(usage.todayBytes, 1536);
	assert.equal(usage.todayRequests, 12);
	assert.equal(usage.totalRequests, 99);
	assert.equal(formatBytes(1536), "1.5 KB");
	assert.match(formatPerutas(8.5), /8\.5/);
});
