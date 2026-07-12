// B"H

import assert from "node:assert/strict";
import { cleanup, processRecord, appendLog } from "../js/node/process-lifecycle.js";
import { NodeNetworkRouter } from "../js/node/network-router.js";

let terminated = 0;
const messages = [];
const worker = { postMessage: message => messages.push(message), terminate: () => { terminated += 1; } };
const process = processRecord(1000, { path: "server.js" }, "tab-one", worker, null, {
	controlSAB: new SharedArrayBuffer(20),
	dataSAB: new SharedArrayBuffer(128)
}, { startup: true, owner: "agent-one", singletonKey: "server-one" });
const state = {
	processes: new Map([[1000, process]]),
	history: new Map(),
	servers: new Map(),
	pendingHttpReqs: new Map(),
	wsConnections: new Map(),
	maxHistory: 5
};
NodeNetworkRouter.onListen(state, process, { port: 8080, serverId: "server-id" });
assert.throws(() => NodeNetworkRouter.onListen(state, { ...process, pid: 1001 }, { port: 8080, serverId: "other" }), /node_port_in_use/);
const responsePromise = NodeNetworkRouter.routeHttp(state, 8080, { url: "/health", timeoutMs: 1000 });
const requestId = messages.at(-1).reqId;
NodeNetworkRouter.onHttpOutbound(state, { reqId: requestId, status: 200, data: "alive" });
assert.deepEqual(await responsePromise, { status: 200, headers: {}, data: "alive" });
for (let index = 0; index < 2100; index += 1) appendLog(process, `line-${index}`);
assert.equal(process.logs.length, 2000);
cleanup(state, process, { status: "complete", code: 0 });
assert.equal(terminated, 1);
assert.equal(state.processes.size, 0);
assert.equal(state.servers.size, 0);
assert.equal(state.history.get(1000).status, "complete");
console.log("B\"H nodeLifecycle tests passed");
