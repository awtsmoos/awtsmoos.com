// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Test = require("../../core/test/tunnelSecurityTestContext.cjs");
const { protectedFs } = require("../protectedFs.js");

/**
 * @file Proves authenticated concurrent control calls receive complete identity and one exact route.
 * @description
 * The Awtsmoos joins proven ownership with fair scheduling without confusing the two.
 * Awtsmoos.com keeps every concurrent read on one possession-backed native device while
 * generating unique deed transport and stable logical-agent/session testimony.
 */
const isolated = Test.createSecurityContext();
const binding = Test.addBinding(Test.bindingInput(
	"sticky-user",
	"sticky-native",
	"awt-sticky-native"
));

test.after(() => isolated.cleanup());

test("protected fs attaches scheduler identity before possession-backed native dispatch", async () => {
	const calls = [];
	const client = nativeClient();
	const work = Array.from({ length: 80 }, (_, index) => {
		const conversationName = `Sticky Mission ${index % 8}`;
		return route(index % 2 ? "read" : "list", conversationName, client, calls);
	});
	const results = await Promise.all(work);
	assert.equal(results.length, 80);
	assert(results.every(result => result.ok === true));
	assert.equal(calls.length, 80);
	assert(calls.every(call => call.accountId === "sticky-user"));
	assert(calls.every(call => call.routeReference === binding.tunnelId));
	assert(calls.every(call => call.payload.requestId));
	assert(calls.every(call => call.payload.logicalAgentId));
	assert(calls.every(call => call.payload.agentSessionId));
	assert.equal(new Set(calls.map(call => call.payload.controlRequestId)).size, 80);
	assert.equal(new Set(calls.map(call => call.payload.requestId)).size, 80);
	assert.equal(new Set(calls.map(call => call.payload.nonce)).size, 80);
	assert.equal(new Set(calls.map(call => call.payload.logicalAgentId)).size, 8);
	assert.equal(new Set(calls.map(call => call.payload.agentSessionId)).size, 8);
});

function nativeClient() {
	const now = Date.now();
	return {
		accessKind: "device",
		accountId: "sticky-user",
		allowCommands: true,
		allowWrite: true,
		connected: true,
		deviceId: binding.deviceId,
		heartbeatAt: now,
		isAlive: true,
		isTunnel: true,
		lastSeenAt: now,
		registeredAt: now,
		tunnelId: binding.tunnelId,
		tunnelName: binding.tunnelName,
		vesselType: "native-local"
	};
}

async function route(action, conversationName, client, calls) {
	const context = {
		paramKinds: {
			GET: { action, conversationName, p: "AI_THOUGHTS" }
		},
		request: {
			headers: {},
			user: { info: { userId: "sticky-user" } }
		},
		response: { setHeader() {} },
		ws: {
			clients: new Set([client]),
			async sendTunnelRequest(accountId, routeReference, payload) {
				calls.push({ accountId, routeReference, payload });
				return { ...payload, ok: true, action: payload.action };
			}
		}
	};
	return JSON.parse(await protectedFs(context, { tunnelName: binding.tunnelName }));
}
