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

const CLIENT_KINDS = ["chat", "conflict", "proposal", "status"];

function message(input = {}, trusted = false) {
	const content = boundedString(input.message, "message", 4096);
	const clientMessageId = boundedString(input.clientMessageId, "clientMessageId", 130);
	if (!trusted) {
		const kind = CLIENT_KINDS.includes(input.kind) ? input.kind : "chat";
		return { content, clientMessageId, kind };
	}
	const kind = [...CLIENT_KINDS, "action"].includes(input.kind) ? input.kind : "chat";
	const entry = { content, clientMessageId, kind };
	if (kind === "action" && input.detail && typeof input.detail === "object") {
		entry.detail = {
			deed: String(input.detail.deed || "").slice(0, 40),
			target: String(input.detail.target || "").slice(0, 300),
			device: String(input.detail.device || "").slice(0, 120),
			ok: input.detail.ok !== false,
			pending: input.detail.pending === true,
			final: input.detail.final === true,
			outcomeOf: String(input.detail.outcomeOf || "").slice(0, 130)
		};
	}
	return entry;
}

module.exports = { identity, message };
