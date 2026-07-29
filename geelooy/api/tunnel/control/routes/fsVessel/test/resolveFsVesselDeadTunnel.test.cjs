// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Test = require("../../../core/test/tunnelSecurityTestContext.cjs");
const { resolveFsVessel } = require("../resolveFsVessel.js");

const isolated = Test.createSecurityContext();

(async () => {
	try {
		const deadBinding = Test.addBinding(Test.bindingInput(
			"u",
			"dead-native",
			"dead-native"
		));
		const liveBinding = Test.addBinding(Test.bindingInput(
			"u",
			"live-native",
			"live-native"
		));
		const deadClient = nativeClient(deadBinding, false);
		const liveClient = nativeClient(liveBinding, true);

		const stale = resolve(ctx([deadClient]), "dead-native");
		const staleResult = await stale.send();
		assert.equal(staleResult.ok, false);
		assert.equal(staleResult.error, "tunnel_not_alive");
		assert.equal(staleResult.status, 409);
		assert.equal(staleResult.nativeTunnels.filter(item => item.isAlive).length, 0);

		const auto = resolve(ctx([deadClient]), "auto");
		assert.equal(auto.tunnelName, "awtsmoos-virtual-os");
		assert.equal(auto.reason, "auto_virtual_os");

		const live = resolve(ctx([liveClient]), "auto");
		assert.equal(live.tunnelName, "live-native");
		assert.equal(live.routeReference, liveBinding.tunnelId);
		console.log("BHY resolver refuses dead tunnels before relay timeout");
	} finally {
		isolated.cleanup();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function nativeClient(binding, isAlive) {
	return {
		accessKind: "device",
		accountId: "u",
		allowCommands: true,
		allowWrite: true,
		connected: isAlive,
		deviceId: binding.deviceId,
		isAlive,
		isTunnel: true,
		registeredAt: Date.now(),
		root: "/tmp",
		tunnelId: binding.tunnelId,
		tunnelName: binding.tunnelName
	};
}

function ctx(clients) {
	return {
		ws: {
			clients,
			sendTunnelRequest() {
				throw new Error("should_not_route_to_dead_tunnel");
			}
		}
	};
}

function resolve($i, tunnelName) {
	return resolveFsVessel({
		$i,
		identity: { accountId: "u", userId: "u" },
		payload: { action: "list" },
		timeoutMs: 1,
		tunnelName
	});
}
