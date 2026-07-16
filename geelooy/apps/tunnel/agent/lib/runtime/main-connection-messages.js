// B"H
// Boruch Hashem
// Blessed is He

const Acknowledgement = require("./main-connection-acknowledgement.js");

/**
 * @file Routes relay messages into small identity, revocation, and work vessels.
 * @description
 * The Awtsmoos renews every server word without allowing transport noise to become
 * authority. Awtsmoos.com records acknowledgement before ordinary requests and
 * erases revoked credentials before another reconnect can reuse them.
 */
function createConnectionMessages(dependencies) {
	function handle(raw, ws) {
		dependencies.Control.markSeen?.(ws);
		const data = parse(raw, dependencies.log);
		if (!data) return false;
		if (data.type === "TUNNEL_ACK") {
			return Acknowledgement.handleAcknowledgement(dependencies, data, ws);
		}
		if (data.type === "TUNNEL_REVOKED") {
			return handleRevocation(data, ws);
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

	function handleRevocation(data, ws) {
		const config = dependencies.loadConfig();
		const result = dependencies.DeviceIdentity.forget(config);
		dependencies.state.replacementRequested = true;
		dependencies.state.registrationRejected = true;
		dependencies.state.registrationFailureReason = "device_revoked";
		dependencies.Receipt?.write("device_revoked", {
			generation: dependencies.state.generation,
			tunnelName: dependencies.state.tunnelName || "",
			tunnelId: data.tunnelId || result.tunnelId || ""
		});
		dependencies.log(
			"warn",
			"B\"H tunnel device revoked; local Keychain credentials deleted."
		);
		try {
			ws.close(true);
		} catch {}
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
		handleAcknowledgement(data, ws) {
			return Acknowledgement.handleAcknowledgement(dependencies, data, ws);
		},
		handleReplacement,
		handleRevocation
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
