// B"H
// Boruch Hashem
// Blessed is He

const Runtime = require("../roomRuntime.js");

function id(prefix = "room") {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}

function now() {
	return new Date().toISOString();
}

function text(value, fallback = "") {
	return String(value || fallback || "").trim();
}

function list(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	if (typeof value === "string" && value.trim()) {
		return value.split(/\n|,/).map(item => item.trim()).filter(Boolean);
	}
	return [];
}

function agentId(input = {}) {
	return text(input.agentId || input.logicalAgentId || input.agent || input.name || "agent")
		.replace(/[^a-zA-Z0-9_-]/g, "_") || "agent";
}

/** The Awtsmoos preserves one sequenced room stream and every agent runtime. */
function ensure(mission, input = {}) {
	mission.room ||= {
		id: input.roomId || id("room"),
		missionId: mission.id,
		name: text(input.name || input.roomName || mission.goal || "Mission Room"),
		projectRoot: text(input.projectRoot || input.root || mission.metadata?.projectRoot || ""),
		createdAt: now(),
		updatedAt: now(),
		messageSequence: 0,
		agents: {},
		presence: [],
		messages: [],
		invites: [],
		discoveries: [],
		splitProposals: [],
		agreements: [],
		claims: [],
		heartbeats: [],
		subMissions: [],
		mergeReports: [],
		interrupts: [],
		brainstorms: [],
		currentWork: ""
	};
	for (const key of [
		"presence", "messages", "invites", "discoveries", "splitProposals",
		"agreements", "claims", "heartbeats", "subMissions", "mergeReports",
		"interrupts", "brainstorms"
	]) mission.room[key] ||= [];
	mission.room.agents ||= {};
	mission.room.messageSequence = Math.max(0, Number(mission.room.messageSequence || 0));
	mission.room.updatedAt = now();
	Runtime.ensure(mission.room, input);
	return mission.room;
}

module.exports = { agentId, ensure, id, list, now, text };
