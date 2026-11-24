// B"H
"use strict";

/**
 * @file The smallest real bridge between the two real room systems.
 * @description
 * The Awtsmoos gathers every messenger into one account room, while agent
 * missions keep their own room records on the device. This module is the
 * single canonical translation between those two message shapes: an agent
 * mission-room record becomes an account-room message (and back) with its
 * identity preserved in clientMessageId, so a re-send is a safe no-op in
 * the account room and no message is ever duplicated or re-authored.
 * It creates no participants and simulates nothing.
 */
const PREFIX = "mission-room:";

function clean(value, limit) { return String(value || "").slice(0, limit); }

/** Agent mission-room record -> account-room send input. */
function toShared(agentMessage = {}, missionId = "") {
	const id = clean(agentMessage.id || agentMessage.messageId, 130);
	if (!id) throw new Error("room_bridge_message_id_required");
	return {
		agentId: clean(agentMessage.fromAgent || agentMessage.agentId || "mission-agent", 160),
		agentSessionId: clean(agentMessage.agentSessionId || missionId || "mission-room", 180),
		deviceId: clean(agentMessage.deviceId || "tunnel-agent", 180),
		name: clean(agentMessage.fromAgent || agentMessage.agentId || "mission-agent", 100),
		message: clean(agentMessage.body || agentMessage.message || agentMessage.text, 4096),
		kind: ["chat", "status", "proposal", "conflict"].includes(agentMessage.kind) ? agentMessage.kind : "chat",
		clientMessageId: PREFIX + clean(missionId, 40) + ":" + id,
		source: "mission-room",
		sourceSequence: Number(agentMessage.sequence) || 0
	};
}

/** Account-room entry -> agent mission-room record shape. */
function fromShared(entry = {}) {
	const bridged = String(entry.clientMessageId || "").startsWith(PREFIX);
	const rest = bridged ? String(entry.clientMessageId).slice(PREFIX.length) : "";
	const sourceId = bridged ? rest.slice(rest.indexOf(":") + 1) : String(entry.id || "");
	return {
		id: sourceId || String(entry.id || ""),
		sequence: Number(entry.sequence) || 0,
		at: entry.at || null,
		fromAgent: entry.agentId || "",
		kind: entry.kind || "chat",
		subject: "",
		body: entry.content || entry.message || "",
		references: [],
		bridged
	};
}

module.exports = { PREFIX, fromShared, toShared };
