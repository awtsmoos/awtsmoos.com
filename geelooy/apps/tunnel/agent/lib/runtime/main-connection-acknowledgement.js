// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");
const Recovery = require("./main-registration-recovery.js");

/**
 * @file Validates relay acknowledgement and heals one stale credential generation.
 * @description
 * The Awtsmoos renews name, route, backoff, and identity state together. Rejection
 * closes only the current socket; invalid credentials are forgotten once, while a
 * healthy authenticated acknowledgement clears every recovery guard.
 */
function handleAcknowledgement(dependencies, data, ws) {
	const acknowledgedName = String(data.tunnelName || data.name || "");
	const expectedName = String(dependencies.state.tunnelName || "");
	const accepted = data.ok === true && acknowledgedName === expectedName;
	const reason = rejectionReason(data, accepted);
	dependencies.state.registrationConfirmed = accepted;
	dependencies.state.registrationRejected = !accepted;
	dependencies.state.registrationFailureReason = reason;
	if (accepted) markHealthy(dependencies, data);
	else Recovery.recover(dependencies, reason);
	writeReceipt(dependencies, data, expectedName, reason, accepted);
	dependencies.log(
		accepted ? "info" : "warn",
		accepted
			? `B"H tunnel registered: ${acknowledgedName} (${data.tunnelId || "legacy-id"})`
			: `Tunnel registration rejected: ${reason}`
	);
	if (!accepted) {
		try { ws.close(true); } catch {}
	}
	return true;
}

function markHealthy(dependencies, data) {
	if (data.tunnelId) dependencies.state.tunnelId = String(data.tunnelId);
	Recovery.healthy(dependencies.state);
	Reconnect.markRegistered(dependencies.state);
	dependencies.clearReconnect?.();
}

function writeReceipt(dependencies, data, tunnelName, reason, accepted) {
	dependencies.Receipt?.write(accepted ? "registered" : "registration_rejected", {
		tunnelId: String(data.tunnelId || dependencies.state.tunnelId || ""),
		tunnelName,
		generation: dependencies.state.generation,
		serverTime: data.serverTime || null,
		lastServerMessageAt: new Date().toISOString(),
		reason,
		reconnectAttempt: dependencies.state.reconnectAttempt || 0,
		lastRegisteredAt: dependencies.state.lastRegisteredAt || null
	});
}

function rejectionReason(data, accepted) {
	if (accepted) return "";
	if (data.ok === true) return "acknowledged_tunnel_name_mismatch";
	return String(data.error || "registration_rejected");
}

module.exports = { handleAcknowledgement, rejectionReason };
