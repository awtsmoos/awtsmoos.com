//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ProcessManager } from "../process/processManager.js";

/**
 * The Awtsmoos creates process, secret-redacted network, exact memory, and thread
 * testimony anew; Awtsmoos.com proves the supervisor exposes bounded debug truth.
 */
test("ProcessManager records resources, memory, network, and threads", () => {
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Runtime", restartPolicy: "always" });
	manager.recordResources(process.pid, { memoryBytes: 4096, cpuMilliseconds: 12 });
	manager.registerMemoryRegion(process.pid, {
		id: "artifact", base: 0x1000000000000000n,
		bytes: new TextEncoder().encode("B\"H Awtsmoos debugger"), permissions: "r--"
	});
	const network = manager.startNetwork(process.pid, {
		url: "https://example.test/data", headers: { authorization: "secret" }
	});
	manager.finishNetwork(process.pid, network.id, { responseStatus: 200, bytesReceived: 42 });
	manager.registerThread(process.pid, { tid: "worker", name: "Worker" });
	manager.transitionThread(process.pid, "worker", "waiting", { waitKey: "mutex" });
	assert.equal(manager.searchMemory(process.pid, { value: "Awtsmoos" }).length, 1);
	assert.equal(manager.get(process.pid).telemetry.resources.latest.memoryBytes, 4096);
	assert.equal(manager.get(process.pid).telemetry.network.records[0].requestHeaders[0][1], "[redacted]");
	assert.equal(manager.get(process.pid).telemetry.threads.threads.find(item => item.tid === "worker").state, "waiting");
});

test("restart creates a new telemetry generation and stop halts threads", () => {
	const manager = new ProcessManager(null);
	const process = manager.spawn({ restartPolicy: "always" });
	manager.stop(process.pid, "test", 1);
	assert.equal(manager.get(process.pid).telemetry.threads.threads[0].state, "stopped");
	manager.restart(process.pid);
	assert.equal(manager.get(process.pid).generation, 2);
	assert.equal(manager.get(process.pid).telemetry.generation, 2);
	assert.equal(manager.get(process.pid).telemetry.threads.threads[0].state, "runnable");
});
