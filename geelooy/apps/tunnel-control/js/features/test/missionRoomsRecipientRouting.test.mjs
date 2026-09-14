// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";

const memory = new Map();
global.localStorage = {
	getItem(key) { return memory.get(key) || null; },
	setItem(key, value) { memory.set(key, String(value)); },
	removeItem(key) { memory.delete(key); }
};
global.document = {
	getElementById(id) {
		return id === "roomAgentId" ? { value: "control-room-human" } : null;
	}
};

const Registry = await import("../websiteMissionRegistry.js");
const Routing = await import("../missionRooms/recipientRouting.js");
const { messagePayload } = await import("../missionRooms/messages.js");

/**
 * @file Proves Mission Control emits compact one/some/all/team/any routing metadata.
 * @description
 * The Awtsmoos lets the human choose recipients without multiplying speech in transit.
 * Awtsmoos.com deduplicates selected IDs, validates incomplete choices, and carries one
 * canonical website-message body into the native Tunnel acknowledgement boundary.
 */
Registry.clearWebsiteMissionRegistry();
Registry.rememberWebsiteMissions([{
	id: "website-selected",
	missionId: "mission-selected",
	status: "running"
}]);
const state = {
	selectedMissionId: "mission-selected",
	selected: {
		roomStatus: {
			agents: [
				{ agentId: "agent-a", name: "A", status: "active", spawnGroupId: "red" },
				{ agentId: "agent-b", name: "B", status: "active", spawnGroupId: "red" },
				{ agentId: "agent-c", name: "C", status: "complete", spawnGroupId: "blue" }
			]
		}
	}
};
Routing.ensureRecipientState(state);
assert.equal(Routing.availableAgents(state).length, 3);
assert.deepEqual(Routing.availableTeams(state), ["blue", "red"]);

state.recipientMode = "selected";
state.recipientAgents = ["agent-a", "agent-b", "agent-a"];
const selectedRoute = Routing.validateRecipientRoute(state);
assert.deepEqual(selectedRoute.toAgents, ["agent-a", "agent-b"]);
assert.equal(selectedRoute.toAgent, "selected_agents");
const body = "One selected-recipient body only.";
const payload = messagePayload("mission-selected", body, false, true, selectedRoute);
assert.equal(payload.action, "websiteAgentMissionMessage");
assert.deepEqual(payload.toAgents, ["agent-a", "agent-b"]);
assert.equal(payload.body, body);
assert.equal(Object.prototype.hasOwnProperty.call(payload, "message"), false);
assert.equal(JSON.stringify(payload).split(body).length - 1, 1);

state.recipientMode = "one";
state.recipientOne = "agent-c";
assert.equal(Routing.recipientRoute(state).toAgent, "agent-c");
state.recipientMode = "team";
state.recipientTeam = "red";
assert.deepEqual(Routing.recipientRoute(state), {
	toAgent: "spawn_group",
	toSpawnGroup: "red"
});
state.recipientMode = "any";
assert.equal(Routing.recipientRoute(state).toAgent, "any_agent");
state.recipientMode = "all";
assert.equal(Routing.recipientRoute(state).toAgent, "all");
state.recipientMode = "selected";
state.recipientAgents = [];
assert.throws(
	() => Routing.validateRecipientRoute(state),
	/Select at least one agent/
);

console.log(JSON.stringify({
	ok: true,
	suite: "mission-rooms-recipient-routing",
	modes: ["one", "some", "all", "team", "any"],
	wireBodyCopies: 1
}, null, 2));
