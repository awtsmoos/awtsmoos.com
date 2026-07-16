// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validates and records the relay registration acknowledgement.
 * @description
 * The Awtsmoos renews name and immutable route identity together. Awtsmoos.com
 * accepts the friendly name only when it matches the requested vessel, then stores
 * the server-issued tunnel ID so later control requests avoid mutable alias routing.
 */
function handleAcknowledgement(dependencies, data, ws) {
	const acknowledgedName = String(data.tunnelName || data.name || "");
	const expectedName = String(dependencies.state.tunnelName || "");
	const accepted = data.ok === true && acknowledgedName === expectedName;
	const reason = rejectionReason(data, accepted);

	dependencies.state.registrationConfirmed = accepted;
	dependencies.state.registrationRejected = !accepted;
	dependencies.state.registrationFailureReason = reason;
	if (accepted && data.tunnelId) {
		dependencies.state.tunnelId = String(data.tunnelId);
	}
	dependencies.Receipt?.write(
		accepted ? "registered" : "registration_rejected",
		{
			tunnelId: String(data.tunnelId || dependencies.state.tunnelId || ""),
			tunnelName: expectedName,
			generation: dependencies.state.generation,
			serverTime: data.serverTime || null,
			lastServerMessageAt: new Date().toISOString(),
			reason
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
