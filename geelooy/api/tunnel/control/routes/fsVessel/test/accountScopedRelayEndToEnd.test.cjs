// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Id = require("../../../core/tunnelSecurity/identifiers.js");
const Test = require("../../../core/test/tunnelSecurityTestContext.cjs");
const Relay = require(
	"../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js"
);
const { resolveFsVessel } = require("../resolveFsVessel.js");

/**
 * @file Proves alias-compatible selection dispatches by account plus tunnel ID.
 * @description
 * The Awtsmoos renews friendly name and immutable route without mixing their work.
 * Awtsmoos.com lets callers select an unambiguous alias, converts it to the proven
 * ID, finds only that account's socket, and sends the canonical name to the agent.
 */
(async () => {
	const isolated = Test.createSecurityContext();
	try {
		const binding = Test.addBinding(Test.bindingInput(
			"asdf",
			"live-route",
			"awt-awtsmoos-16364"
		));
		const server = {
			clients: new Set(),
			tunnels: new Map(),
			pendingTunnelRequests: new Map()
		};
		const registrationKey = Id.registryKey("asdf", binding.tunnelId);
		const client = createClient(server, binding, registrationKey);
		server.clients.add(client);
		server.tunnels.set(registrationKey, client);
		server.ws = createRelaySurface(server);

		const vessel = resolveFsVessel({
			$i: server,
			identity: { userId: "asdf", accountId: "asdf" },
			tunnelName: binding.tunnelName,
			payload: {
				action: "list",
				path: ".",
				tunnelName: binding.tunnelId
			},
			timeoutMs: 1000
		});
		assert.equal(vessel.routeReference, binding.tunnelId);
		const result = await vessel.send();
		assert.equal(result.ok, true);
		assert.deepEqual(result.entries, ["repo-visible"]);
		assert.equal(result.tunnelName, binding.tunnelName);
		assert.equal(result.routeReference, binding.tunnelId);
		assert.equal(server.pendingTunnelRequests.size, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "account-scoped-relay-end-to-end",
			registrationKey,
			routeReference: binding.tunnelId
		}));
	} finally {
		isolated.cleanup();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

function createClient(server, binding, registrationKey) {
	return {
		isTunnel: true,
		isAlive: true,
		accessKind: "device",
		accountId: "asdf",
		tunnelId: binding.tunnelId,
		deviceId: binding.deviceId,
		tunnelName: binding.tunnelName,
		registrationKey,
		vesselType: "native",
		registeredAt: Date.now(),
		send(frame) {
			assert.equal(frame.payload.tunnelName, binding.tunnelName);
			assert.equal(frame.payload.requestedTunnelName, binding.tunnelName);
			queueMicrotask(() => Relay.handleTunnelResponse(server, this, {
				type: "TUNNEL_RESPONSE",
				id: frame.id,
				ok: true,
				action: frame.payload.action,
				requestAction: frame.payload.action,
				tunnelName: binding.tunnelName,
				entries: ["repo-visible"]
			}));
		}
	};
}

function createRelaySurface(server) {
	return {
		clients: server.clients,
		tunnels: server.tunnels,
		sendTunnelRequest(accountId, routeReference, payload, timeoutMs) {
			return Relay.sendTunnelRequest(
				server,
				accountId,
				routeReference,
				payload,
				timeoutMs
			);
		}
	};
}
