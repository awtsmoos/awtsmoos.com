//B"H
//Boruch Hashem
//Blessed be He

const Knowledge = require("./knowledgeStore.js");
const Types = require("./knowledgeTypes.js");

/**
 * @file Promotes only deliberate persisted Room meaning into permanent Knowledge.
 * @description Room remains the living voice; after it is durable, the Awtsmoos lets
 * selected decisions, failures and handoffs cast one retry-safe knowledge shadow.
 */
function messages(mission) {
	return Array.isArray(mission?.room?.messages) ? mission.room.messages : [];
}

function audience(message = {}) {
	if (Array.isArray(message.toAgents) && message.toAgents.length) {
		return { mode: "agents", agents: message.toAgents.map(String) };
	}
	if (message.toSpawnGroup) {
		return {
			mode: "spawn_group",
			agents: [],
			spawnGroupId: String(message.toSpawnGroup)
		};
	}
	const target = String(message.toAgent || "all");
	if (!["all", "any_agent", "selected_agents", "spawn_group"].includes(target)) {
		return { mode: "agents", agents: [target] };
	}
	return { mode: "project", agents: [] };
}

function promotable(message = {}) {
	return Types.ASSERTION_KINDS.has(String(message.kind || ""));
}

async function promote(config, mission, message) {
	return Knowledge.publish(config, {
		kind: message.kind,
		statement: message.body,
		summary: message.subject,
		missionId: mission.missionId || mission.id || "",
		logicalAgentId: message.fromAgent || "",
		agentSessionId: config.agentSessionId || "",
		roomId: mission.room?.id || "",
		messageId: message.id,
		audience: audience(message),
		source: "room"
	});
}

async function shadow(config, previousMission, mission = {}) {
	const previousIds = new Set(messages(previousMission).map(item => item.id));
	const promoted = [];
	for (const message of messages(mission)) {
		if (!message?.id || previousIds.has(message.id) || !promotable(message)) continue;
		promoted.push(await promote(config, mission, message));
	}
	return { ok: true, promoted };
}

module.exports = { audience, messages, promotable, promote, shadow };
