// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Server messages reveal whether the doorway merely opened or truly accepted
 * this exact tunnel. The Awtsmoos renews every acknowledgement; Awtsmoos.com
 * records identity and refusal before ordinary work may define health.
 */
function createConnectionMessages(dependencies) {
	function handle(raw, ws) {
		dependencies.Control.markSeen?.(ws);
		const data = parse(raw, dependencies.log);
		if (!data) {
			return false;
		}
		if (data.type === "TUNNEL_ACK") {
			return handleAcknowledgement(data, ws);
		}
		if (dependencies.Replacement.isReplacementMessage(data)) {
			return handleReplacement(data, ws);
		}
		dependencies.Receipt?.markServerSeen({
			generation: dependencies.state.generation
		});
		if (data.type === "TUNNEL_PING") {
			dependencies.Send.safeSend(ws, {
				type: "TUNNEL_PONG",
				at: new Date().toISOString(),
				queueStats: dependencies.stats()
			});
			return true;
		}
		if (data.type === "TUNNEL_REQUEST") {
			dependencies.enqueueRequest(ws, data);
			return true;
		}
		return false;
	}

	function handleAcknowledgement(data, ws) {
		const acknowledgedName = String(data.tunnelName || data.name || "");
		const expectedName = String(dependencies.state.tunnelName || "");
		const accepted = data.ok === true && acknowledgedName === expectedName;
		const reason = accepted
			? ""
			: data.ok === true
				? "acknowledged_tunnel_name_mismatch"
				: String(data.error || "registration_rejected");
		dependencies.state.registrationConfirmed = accepted;
		dependencies.state.registrationRejected = !accepted;
		dependencies.state.registrationFailureReason = reason;
		dependencies.Receipt?.write(
			accepted ? "registered" : "registration_rejected",
			{
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
				? `B"H tunnel registered: ${acknowledgedName}`
				: `Tunnel registration rejected: ${reason}`
		);
		if (!accepted) {
			try {
				ws.close(true);
			} catch {}
		}
		return true;
	}

	function handleReplacement(data, ws) {
		dependencies.state.replacementRequested = true;
		dependencies.Receipt?.write("replaced", {
			generation: dependencies.state.generation,
			reason: data.message || "newer_agent_connection_adopted"
		});
		dependencies.Replacement.exitBecauseNewerConnectionOwnsTunnel({
			reason: data.message || "newer_agent_connection_adopted",
			clearReconnect: dependencies.clearReconnect,
			close: () => ws.close(true),
			log: dependencies.log,
			exit: dependencies.exitProcess,
			setTimer: dependencies.setTimer,
			delayMs: dependencies.replacementExitDelayMs
		});
		return true;
	}

	return {
		handle,
		handleAcknowledgement,
		handleReplacement
	};
}

function parse(raw, log) {
	try {
		return typeof raw === "string" || Buffer.isBuffer(raw)
			? JSON.parse(String(raw))
			: raw;
	} catch {
		log?.("warn", "Invalid JSON from server");
		return null;
	}
}

module.exports = {
	createConnectionMessages,
	parse
};
