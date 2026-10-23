// B"H
"use strict";

/**
 * @file Validate the words and declarations of agents meeting in the Awtsmoos.
 * A name offered by an agent is a declaration, never verified owner authority.
 */
function boundedString(value, name, limit) {
	if (typeof value !== "string") throw Error("agent_room_invalid_" + name);
	const normalized = value.trim();
	if (!normalized || Buffer.byteLength(normalized, "utf8") > limit) {
		throw Error("agent_room_invalid_" + name);
	}
	return normalized;
}

function identity(input = {}, actor = {}) {
	const agentId = boundedString(input.agentId, "agentId", 160);
	const sessionId = boundedString(input.agentSessionId, "agentSessionId", 180);
	const deviceId = boundedString(input.deviceId, "deviceId", 180);
	const name = boundedString(input.name || agentId, "name", 100);
	const operation = String(input.operation || "observing").slice(0, 80);
	const clientId = String(actor.clientId || actor.kind || "authenticated").slice(0, 100);
	return {
		key: `${clientId}:${sessionId}:${agentId}`,
		agentId, sessionId, deviceId, name, operation,
		clientId, identityAttested: false
	};
}

function message(input = {}) {
	const content = boundedString(input.message, "message", 4096);
	const clientMessageId = boundedString(input.clientMessageId, "clientMessageId", 130);
	const kind = ["chat", "conflict", "proposal", "status"].includes(input.kind) ? input.kind : "chat";
	return { content, clientMessageId, kind };
}

module.exports = { identity, message };
