// B"H
// Boruch Hashem
// Blessed is He

const Acknowledgement = require("./main-connection-acknowledgement.js");
const Authorization = require("./main-connection-authorization.js");

/**
 * @file Routes relay words into registration, settlement, liveness, and work.
 * @description
 * The Awtsmoos preserves one physical vessel while credentials and sockets may
 * change. Awtsmoos.com removes durable request testimony only after settlement,
 * while terminal authorization events live in a separate identity-safe vessel.
 */
function createConnectionMessages(dependencies) {
	function handle(raw, webSocket) {
		dependencies.Control.markSeen?.(webSocket);
		const data = parse(raw, dependencies.log);
		if (!data) return false;
		if (data.type === "TUNNEL_ACK") {
			return Acknowledgement.handleAcknowledgement(
				dependencies,
				data,
				webSocket
			);
		}
		if (data.type === "TUNNEL_RESPONSE_ACK") {
			return handleResponseAcknowledgement(dependencies, data);
		}
		if (data.type === "TUNNEL_REVOKED") {
			return Authorization.handleRevocation(dependencies, data, webSocket);
		}
		if (dependencies.Replacement.isReplacementMessage(data)) {
			return Authorization.handleReplacement(dependencies, data, webSocket);
		}
		checkpoint(dependencies);
		if (data.type === "TUNNEL_PING") {
			return handlePing(dependencies, data, webSocket);
		}
		if (data.type === "TUNNEL_REQUEST") {
			dependencies.enqueueRequest(webSocket, data);
			return true;
		}
		return false;
	}

	return {
		handle,
		handleAcknowledgement(data, webSocket) {
			return Acknowledgement.handleAcknowledgement(
				dependencies,
				data,
				webSocket
			);
		},
		handleReplacement(data, webSocket) {
			return Authorization.handleReplacement(dependencies, data, webSocket);
		},
		handleResponseAcknowledgement(data) {
			return handleResponseAcknowledgement(dependencies, data);
		},
		handleRevocation(data, webSocket) {
			return Authorization.handleRevocation(dependencies, data, webSocket);
		}
	};
}

function handleResponseAcknowledgement(dependencies, data) {
	const id = String(data.transportReceiptId || data.id || "");
	if (!id || !dependencies.TransportMailbox) return false;
	dependencies.TransportMailbox.acknowledge(id);
	return true;
}

function handlePing(dependencies, data, webSocket) {
	const pong = {
		type: "TUNNEL_PONG",
		at: new Date().toISOString()
	};
	if (data.includeStats === true) pong.queueStats = dependencies.stats();
	dependencies.Send.safeSend(webSocket, pong);
	return true;
}

function checkpoint(dependencies) {
	const mark = dependencies.Receipt?.markServerSeenAsync;
	if (typeof mark !== "function") {
		dependencies.Receipt?.markServerSeen?.({
			generation: dependencies.state.generation
		});
		return;
	}
	mark({ generation: dependencies.state.generation }).catch(error => {
		dependencies.log?.("warn", `Liveness checkpoint failed: ${error.message}`);
	});
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
	checkpoint,
	createConnectionMessages,
	handlePing,
	handleResponseAcknowledgement,
	parse
};
