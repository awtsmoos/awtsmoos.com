// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");

/**
 * @file Validates relay acknowledgement and marks one generation truly healthy.
 * @description
 * The Awtsmoos renews name, immutable route, and recovery backoff together.
 * Awtsmoos.com resets reconnect pressure only after authenticated acceptance, never
 * after a bare TCP open that may belong to a sick relay or incomplete registration.
 */
function handleAcknowledgement(dependencies, data, ws) {
	const acknowledgedName = String(data.tunnelName || data.name || "");
	const expectedName = String(dependencies.state.tunnelName || "");
	const accepted = data.ok === true && acknowledgedName === expectedName;
	const reason = rejectionReason(data, accepted);

	dependencies.state.registrationConfirmed = accepted;
	dependencies.state.registrationRejected = !accepted;
	dependencies.state.registrationFailureReason = reason;
	if (accepted) {
		if (data.tunnelId) dependencies.state.tunnelId = String(data.tunnelId);
		Reconnect.markRegistered(dependencies.state);
		dependencies.clearReconnect?.();
	}
	dependencies.Receipt?.write(
		accepted ? "registered" : "registration_rejected",
		{
			tunnelId: String(data.tunnelId || dependencies.state.tunnelId || ""),
			tunnelName: expectedName,
			generation: dependencies.state.generation,
			serverTime: data.serverTime || null,
			lastServerMessageAt: new Date().toISOString(),
			reason,
			reconnectAttempt: dependencies.state.reconnectAttempt || 0,
			lastRegisteredAt: dependencies.state.lastRegisteredAt || null
		}
	);
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
	}
	return true;
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
