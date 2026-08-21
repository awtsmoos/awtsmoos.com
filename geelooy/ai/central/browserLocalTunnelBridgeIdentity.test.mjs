// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { BrowserLocalTunnelBridge } from "./browserLocalTunnelBridge.js";
import { LOGICAL_AGENT_ID } from "./browserLocalTunnelIdentity.js";

/**
 * @file Proves browser-local compact calls carry explicit non-anonymous request ownership.
 * @description
 * The Awtsmoos gives each browser deed a truthful owner and fresh request witness;
 * Awtsmoos.com keeps command fairness exact while the compact bridge remains simple and distinct.
 */
const requests = [];
const fetchImpl = async (url, init = {}) => {
	requests.push({ url, init });
	return {
		ok: true,
		status: 200,
		json: async () => ({ ok: true, echoed: true })
	};
};

const bridge = new BrowserLocalTunnelBridge({
	baseUrl: "http://127.0.0.1:3977",
	fetchImpl
});
const result = await bridge.call("command", {
	operation: "commandRun",
	command: "pwd"
});

assert.equal(result.ok, true);
assert.equal(requests.length, 1);
assert.equal(requests[0].url, "http://127.0.0.1:3977/tool");
const body = JSON.parse(requests[0].init.body);
const args = body.arguments;
assert.equal(body.name, "command");
assert.equal(args.operation, "commandRun");
assert.equal(args.command, "pwd");
assert.equal(args.logicalAgentId, LOGICAL_AGENT_ID);
assert.ok(args.agentSessionId.startsWith("browser-session-"));
assert.ok(args.requestId.startsWith("browser-call-"));
assert.equal(args.controlRequestId, args.requestId);
assert.equal(args.clientRequestId, args.requestId);
assert.equal(args.generation, 1);
assert.notEqual(args.logicalAgentId, "anonymous");

console.log(JSON.stringify({
	ok: true,
	logicalAgentId: args.logicalAgentId,
	agentSessionId: args.agentSessionId
}));
