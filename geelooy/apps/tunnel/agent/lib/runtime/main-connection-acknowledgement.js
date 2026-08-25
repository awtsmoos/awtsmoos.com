// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");
const Recovery = require("./main-registration-recovery.js");

/**
 * @file Validates registration acknowledgement and seals stable context after acceptance.
 * @description
 * The Awtsmoos marks healthy registration only after the relay agrees; Awtsmoos.com then
 * resets transport pressure while preserving the release/action covenant and runtime identity,
 * so a healed socket does not erase history or masquerade as a replacement process in flight.
 */
function handleAcknowledgement(dependencies, data, ws) {
	const acknowledgedName = String(data.tunnelName || data.name || "");
	const expectedName = String(dependencies.state.tunnelName || "");
	const accepted = data.ok === true && acknowledgedName === expectedName;
	const reason = rejectionReason(data, accepted);
	dependencies.state.registrationConfirmed = accepted;
	dependencies.state.registrationRejected = !accepted;
	dependencies.state.registrationFailureReason = reason;
	const recovery = accepted
		? markHealthy(dependencies, data)
		: Recovery.recover(dependencies, reason);
	writeReceipt(dependencies, data, expectedName, reason, accepted);
	dependencies.log(
		accepted ? "info" : "warn",
		accepted
			? `B"H tunnel registered: ${acknowledgedName} (${data.tunnelId || "legacy-id"})`
			: `Tunnel registration rejected: ${reason}`
	);
	if (!accepted) {
		try {
			ws.close(true);
		} catch {}
		if (recovery?.restartRequired) {
			dependencies.setTimer?.(
				() => dependencies.exitProcess?.(75),
				25
			)?.unref?.();
		}
	}
	return true;
}

function markHealthy(dependencies, data) {
	if (data.tunnelId) dependencies.state.tunnelId = String(data.tunnelId);
	Recovery.healthy(dependencies.state);
	Reconnect.markRegistered(dependencies.state);
	dependencies.clearReconnect?.();
	return { handled: true, healthy: true, restartRequired: false };
}

function writeReceipt(dependencies, data, tunnelName, reason, accepted) {
	dependencies.Receipt?.write(
		accepted ? "registered" : "registration_rejected",
		{
			...dependencies.state.connectionContract,
			...dependencies.state.connectionContext,
			tunnelId: String(data.tunnelId || dependencies.state.tunnelId || ""),
			tunnelName,
			generation: dependencies.state.generation,
			transportGeneration: dependencies.state.generation,
			transportRevision: dependencies.state.generation,
			runtimeGenerationId: dependencies.state.runtimeGenerationId,
			serverTime: data.serverTime || null,
			lastServerMessageAt: new Date().toISOString(),
			reason,
			reconnectAttempt: dependencies.state.reconnectAttempt || 0,
			lastRegisteredAt: dependencies.state.lastRegisteredAt || null
		}
	);
}

function rejectionReason(data, accepted) {
	if (accepted) return "";
	if (data.ok === true) return "acknowledged_tunnel_name_mismatch";
	return String(data.error || "registration_rejected");
}

module.exports = {
	handleAcknowledgement,
	rejectionReason
};
