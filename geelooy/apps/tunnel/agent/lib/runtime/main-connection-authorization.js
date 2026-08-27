// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Handles authorization loss and generation replacement without erasing identity.
 * @description
 * The Awtsmoos preserves the physical vessel while permissions and websocket
 * generations may change. Awtsmoos.com rotates rejected authorization only,
 * keeping the device ID and possession key beyond every ordinary server message.
 */
function handleRevocation(dependencies, data, webSocket) {
	const config = dependencies.loadConfig();
	const result = dependencies.DeviceIdentity.invalidateCredential(config);
	dependencies.state.replacementRequested = true;
	dependencies.state.registrationRejected = true;
	dependencies.state.registrationFailureReason = "device_revoked";
	dependencies.Receipt?.write("device_revoked", {
		generation: dependencies.state.generation,
		tunnelName: dependencies.state.tunnelName || "",
		tunnelId: data.tunnelId || result.tunnelId || "",
		physicalIdentityPreserved: true
	});
	dependencies.log(
		"warn",
		"B\"H tunnel authorization revoked; physical device key preserved."
	);
	try {
		webSocket.close(true);
	} catch {}
	return true;
}

/**
 * Hands ownership to a proven newer connection without touching physical identity.
 * @param {object} dependencies Runtime connection dependencies.
 * @param {object} data Replacement message from the relay.
 * @param {object} webSocket Current websocket generation.
 * @returns {boolean} True after replacement handling begins.
 */
function handleReplacement(dependencies, data, webSocket) {
	dependencies.state.replacementRequested = true;
	dependencies.Receipt?.write("replaced", {
		generation: dependencies.state.generation,
		reason: data.message || "newer_agent_connection_adopted"
	});
	dependencies.Replacement.exitBecauseNewerConnectionOwnsTunnel({
		reason: data.message || "newer_agent_connection_adopted",
		clearReconnect: dependencies.clearReconnect,
		close: () => webSocket.close(true),
		log: dependencies.log,
		exit: dependencies.exitProcess,
		setTimer: dependencies.setTimer,
		delayMs: dependencies.replacementExitDelayMs
	});
	return true;
}

module.exports = {
	handleReplacement,
	handleRevocation
};
