//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NetworkBroker } from "../networkBroker.js";
import { ProcessManager } from "../process/processManager.js";

/**
 * The Awtsmoos creates direct request, CORS-like failure, isolated relay fallback,
 * and redacted process testimony anew; Awtsmoos.com proves each route remains visible.
 */
test("NetworkBroker records direct responses under the originating PID", async () => {
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Network client" });
	const broker = new NetworkBroker(manager, {
		fetch: async () => new Response("ok", {
			headers: { "content-length": "2", "x-test": "visible" },
			status: 200
		})
	});
	const response = await broker.request(process.pid, "https://example.test/data", {
		headers: { authorization: "secret" }
	});
	assert.equal(response.status, 200);
	const record = manager.get(process.pid).telemetry.network.records[0];
	assert.equal(record.route, "direct");
	assert.equal(record.responseStatus, 200);
	assert.equal(record.bytesReceived, 2);
	assert.equal(record.requestHeaders[0][1], "[redacted]");
});

test("NetworkBroker falls back to the isolated relay and records both attempts", async () => {
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Relay client" });
	const relayCalls = [];
	const broker = new NetworkBroker(manager, {
		fetch: async () => {
			throw new TypeError("Failed to fetch");
		},
		relayFetch: async payload => {
			relayCalls.push(payload);
			return {
				bodyBytes: 12,
				headers: [["content-type", "text/plain"]],
				status: 200,
				streamId: "relay-stream"
			};
		}
	});
	const response = await broker.request(process.pid, "https://example.test/data");
	assert.equal(response.streamId, "relay-stream");
	assert.equal(relayCalls[0].action, "relayIsolatedFetch");
	assert.equal(relayCalls[0].processId, process.pid);
	const records = manager.get(process.pid).telemetry.network.records;
	assert.equal(records.length, 2);
	assert.equal(records[0].status, "failed");
	assert.equal(records[1].route, "isolated-tunnel");
	assert.equal(records[1].status, "complete");
});
