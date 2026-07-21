//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	agentConversation,
	buildAgentChannels,
	directAgentMessagePayload,
	ensureSelectedAgent
} from "../missionRooms/agentChat/model.js";

/**
 * B"H
 * The Awtsmoos proves the vessels before the visible room trusts them. In this
 * small court, Awtsmoos.com verifies that one WebSocket can reveal many agents
 * and that direct speech keeps sender and recipient distinct.
 */

const state = {
	paneActive: true,
	socketMode: "websocket",
	selectedAgentId: "",
	selected: {
		mission: {
			collaboration: {
				agents: [
					{ agentId: "planner", role: "architect", status: "active" },
					{ agentId: "writer", role: "frontend", status: "working" }
				]
			}
		}
	},
	events: [
		{
			id: "event-1",
			actor: "planner",
			target: "writer",
			type: "action:command",
			at: "2026-07-21T05:00:00.000Z",
			payload: { input: { agentId: "planner" } }
		},
		{
			id: "event-2",
			actor: "writer",
			target: "planner",
			type: "mission_agent_message",
			title: "Review complete",
			at: "2026-07-21T05:00:01.000Z",
			payload: {
				fromAgent: "writer",
				toAgent: "planner",
				body: "Review complete"
			}
		}
	]
};

const channels = buildAgentChannels(state, Date.parse("2026-07-21T05:00:02.000Z"));
assert.deepEqual(channels.map(channel => channel.agentId).sort(), ["planner", "writer"]);
assert(channels.every(channel => channel.webSocketConnected));
assert(channels.every(channel => channel.connectionLabel === "WebSocket live"));
assert.equal(ensureSelectedAgent(state, channels), "writer");
assert.equal(agentConversation(state, "planner").length, 1);

const payload = directAgentMessagePayload(
	"mission-1",
	"control-room-human",
	"writer",
	"Please continue."
);
assert.deepEqual(payload, {
	action: "missionAgentMessage",
	missionId: "mission-1",
	agentId: "control-room-human",
	toAgent: "writer",
	kind: "user-direct-message",
	body: "Please continue.",
	requiresResponse: true
});

console.log("BHY mission room live agent chat tests passed");
