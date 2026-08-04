// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	ActionStream
} = Context.shared;
const status = Context.reference("status");
const message = Context.reference("message");
const emit = Context.reference("emit");

/**
 * @file Reveals the emitRoom stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function emitRoom(config, record, roomMessage) {
	ActionStream.emit(config, {
		phase: "website-agent.room-message",
		action: "websiteAgentMissionMessage",
		kind: "mission-room",
		status: "committed",
		message: "Mission room message committed and queued for website agents.",
		payload: {
			action: "websiteAgentMissionMessage",
			missionId: record.missionId,
			websiteMissionId: record.id,
			roomRevision: record.roomRevision
		},
		result: {
			ok: true,
			action: "websiteAgentMissionMessage",
			messageId: roomMessage?.userMessage?.id || roomMessage?.message?.id || null
		}
	});
}

Context.register("emitRoom", emitRoom);
module.exports = emitRoom;
