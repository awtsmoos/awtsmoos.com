// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (9) Agent-to-agent messaging.
 * Every mission carries an inbox so agents coordinating on shared
 * missions can talk: direct notes, @agent messages, and broadcasts.
 */

const Store = require("./store.js");
const Model = require("./model.js");

async function send(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const from = Model.cleanText(payload.from || payload.actor || "agent", 200);
	if (!from) {
		const error = new Error("Message needs a sender (from/actor).");
		error.code = "sender_required";
		throw error;
	}
	if (!payload.text) {
		const error = new Error("Message needs text.");
		error.code = "text_required";
		throw error;
	}
	const msg = Model.message({ from, to: payload.to, text: payload.text });
	mission.messages.push(msg);
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "message_sent", missionId: mission.missionId, messageId: msg.messageId, from, to: msg.to });
	return { mission, message: msg };
}

/** Inbox: messages for one agent (directed to them or broadcast), newest last. */
async function inbox(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const who = payload.for || payload.actor;
	let messages = mission.messages;
	if (who) messages = messages.filter(m => !m.to || m.to === who || m.from === who);
	const limit = Math.max(1, Math.min(200, Number(payload.limit) || 50));
	return messages.slice(-limit);
}

module.exports = { send, inbox };
