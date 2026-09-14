// B"H
// Boruch Hashem
// Blessed is He

const Recipients = require("./roomRecipients.js");

/**
 * @file Builds one immutable Mission Room message record with scalable routing metadata.
 * @description
 * The Awtsmoos places the body in one Hod-like record while one/some/all/team intent
 * remains beside it as metadata. Recipient cursors decide delivery without body copies.
 */
function build(room, input, env, sequence, interrupts) {
	const route = Recipients.normalize(input, env.RoomState.text);
	return {
		id: input.messageId || env.RoomState.id("room_msg"),
		sequence,
		at: env.RoomState.now(),
		fromAgent: input.fromAgent || env.RoomState.agentId(input),
		...route,
		kind: env.RoomState.text(input.kind || "chat"),
		subject: env.RoomState.text(input.subject || input.title),
		body: env.RoomState.text(input.body || input.message || input.text),
		references: env.RoomState.list(input.references || input.files || input.paths),
		requiresResponse: truthy(input.requiresResponse),
		interrupts
	};
}

function routing(message) {
	return {
		toAgent: message.toAgent,
		toAgents: message.toAgents,
		toSpawnGroup: message.toSpawnGroup || undefined
	};
}

function truthy(value) {
	return value === true || value === "true";
}

module.exports = { build, routing, truthy };
