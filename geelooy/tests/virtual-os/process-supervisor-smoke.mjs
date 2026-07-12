// B"H

import assert from "node:assert/strict";
import { ProcessManager } from "../../os/process/processManager.js";

const graphEvents = [];
const manager = new ProcessManager({ upsert: value => graphEvents.push(value) }, { maxRetained: 1000 });
const service = manager.startService({
	app: "node-emulator",
	title: "Preview Server",
	owner: "agent-one",
	agentSessionId: "session-one",
	singletonKey: "preview:/repo",
	ports: [3000],
	restartPolicy: "on-failure",
	maxRestarts: 2
});
assert.equal(manager.startService({ singletonKey: "preview:/repo" }).pid, service.pid);
assert.equal(manager.services.ownerOfPort(3000), service.pid);
assert.throws(() => manager.startService({ singletonKey: "other", ports: [3000] }), /service_port_conflict/);
manager.heartbeat(service.pid, "healthy", { requests: 12 });
assert.equal(manager.get(service.pid).health, "healthy");
manager.stop(service.pid, "worker_crash", 1);
assert.equal(manager.services.ownerOfPort(3000), null);
manager.restart(service.pid);
assert.equal(manager.get(service.pid).restartCount, 1);
assert.equal(manager.services.ownerOfPort(3000), service.pid);
manager.stop(service.pid, "done", 0);
manager.restart(service.pid);
assert.equal(manager.get(service.pid).restartCount, 2);
manager.stop(service.pid, "done", 0);
manager.restart(service.pid);
assert.equal(manager.get(service.pid).status, "stopped", "max restarts must be respected");

const processes = Array.from({ length: 500 }, (_, index) => manager.spawn({
	app: "agent-worker",
	owner: `agent-${index % 20}`,
	title: `Worker ${index}`
}));
assert.equal(new Set(processes.map(process => process.pid)).size, 500);
assert.equal(manager.list({ kind: "application" }).length, 500);
assert(graphEvents.length >= 506);
console.log("B\"H process-supervisor-smoke passed");
