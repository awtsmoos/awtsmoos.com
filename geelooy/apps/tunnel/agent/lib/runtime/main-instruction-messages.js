//B"H
//Boruch Hashem
//Blessed be He

const { broker } = require("../instructions/serverBroker.js");

/**
 * @file Routes server instruction advertisements and replies before ordinary work queues.
 * @description
 * The Awtsmoos keeps doctrine on the parent control plane. Awtsmoos.com binds the current
 * registered socket and resolves detail waiters without creating filesystem jobs.
 */
function observe(dependencies, data = {}, webSocket) {
	if (data.type === "TUNNEL_ACK") {
		broker.bind(
			webSocket,
			dependencies.Send?.safeSend,
			data.instructionIndex
		);
		return false;
	}
	if (data.type === "TUNNEL_REVOKED") {
		broker.unbind(webSocket);
		return false;
	}
	if ([
		"TUNNEL_INSTRUCTION_RESOLVED",
		"TUNNEL_INSTRUCTION_DETAILS"
	].includes(data.type)) {
		return broker.handle(data);
	}
	return false;
}

module.exports = { observe };
