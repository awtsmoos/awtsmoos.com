// B"H
// Boruch Hashem
// Blessed is He

const Reconnect = require("./main-reconnect-policy.js");
const Recovery = require("./main-registration-recovery.js");

/**
 * @file Separates owning registration from non-owning candidate testimony.
 * @description
 * The Awtsmoos lets a candidate touch the gate without inheriting the throne.
 * A non-owning probe may prove identity and leave a durable receipt, while only
 * the incumbent registration may erase reconnect pressure or clear its timer.
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
		? markRegistered(dependencies, data)
		: Recovery.recover(dependencies, reason);
	writeReceipt(dependencies, data, expectedName, reason, accepted);
	dependencies.log(
		accepted ? "info" : "warn",
		accepted
			? `B"H tunnel registered: ${acknowledgedName} (${data.tunnelId || "legacy-id"})`
			: `Tunnel registration rejected: ${reason}`
	);
	if (!accepted) handleRejected(dependencies, recovery, ws);
	return true;
}

function markRegistered(dependencies, data) {
	if (data.tunnelId) dependencies.state.tunnelId = String(data.tunnelId);
	Recovery.healthy(dependencies.state);
	if (isNonOwningProbe(data)) {
		dependencies.state.lastRegisteredAt = Date.now();
		return { handled: true, healthy: false, nonOwning: true };
	}
	Reconnect.markRegistered(dependencies.state);
	dependencies.clearReconnect?.();
	return { handled: true, healthy: true, nonOwning: false };
}

function isNonOwningProbe(data) {
	return data.registrationProbe === true && data.nonOwning === true;
}

function handleRejected(dependencies, recovery, ws) {
	try { ws.close(true); } catch {}
	if (recovery?.restartRequired) {
		dependencies.setTimer?.(() => dependencies.exitProcess?.(75), 25)?.unref?.();
	}
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

module.exports = {
	handleAcknowledgement,
	isNonOwningProbe,
	rejectionReason
};
