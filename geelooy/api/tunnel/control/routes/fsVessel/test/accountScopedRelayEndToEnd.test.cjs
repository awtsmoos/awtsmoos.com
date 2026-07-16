// B"H

const assert = require("node:assert/strict");
const Id = require("../../../core/tunnelSecurity/identifiers.js");
const Test = require("../../../core/test/tunnelSecurityTestContext.cjs");
const Relay = require("../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js");
const { resolveFsVessel } = require("../resolveFsVessel.js");

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
		const registrationKey = Id.registryKey("asdf", binding.tunnelName);
		const client = {
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
				queueMicrotask(() => Relay.handleTunnelResponse(server, client, {
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
		server.clients.add(client);
		server.tunnels.set(registrationKey, client);
		server.ws = {
			clients: server.clients,
			tunnels: server.tunnels,
			sendTunnelRequest(accountId, tunnelName, payload, timeoutMs) {
				return Relay.sendTunnelRequest(
					server, accountId, tunnelName, payload, timeoutMs
				);
			}
		};
		const vessel = resolveFsVessel({
			$i: server,
			identity: { userId: "asdf", accountId: "asdf" },
			tunnelName: binding.tunnelName,
			// The device inventory historically supplied its database id here.
			// Relay dispatch must replace it with the selected public registration.
			payload: { action: "list", path: ".", tunnelName: binding.tunnelId },
			timeoutMs: 1000
		});
		const result = await vessel.send();
		assert.equal(result.ok, true);
		assert.deepEqual(result.entries, ["repo-visible"]);
		assert.equal(result.tunnelName, binding.tunnelName);
		assert.equal(server.pendingTunnelRequests.size, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "account-scoped-relay-end-to-end",
			registrationKey
		}));
	} finally {
		isolated.cleanup();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
