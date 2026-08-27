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
 * small court, Awtsmoos.com verifies dual WebSocket testimony, room isolation,
 * agent discovery, conversation filtering, and exact direct-message contracts.
 */

const state = {
	paneActive: true,
	socketMode: "websocket",
	accountConnectionState: "connected",
	selectedMissionId: "mission-1",
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
			id: "room-message",
			roomId: "mission-1",
			actor: "writer",
			target: "planner",
			type: "mission_agent_message",
			at: "2026-07-21T05:00:03.000Z",
			status: "delivered",
			payload: {
				fromAgent: "writer",
				toAgent: "planner",
				body: "Review complete"
			}
		}
	],
	accountEvents: [
		{
			id: "account-planner",
			missionId: "mission-1",
			actor: "planner",
			type: "action.started",
			at: "2026-07-21T05:00:01.000Z",
			status: "running",
			payload: { agentId: "planner", missionId: "mission-1" }
		},
		{
			id: "account-reviewer",
			missionId: "mission-1",
			actor: "reviewer",
			type: "action.started",
			at: "2026-07-21T05:00:02.000Z",
			status: "running",
			payload: { logicalAgentId: "reviewer", missionId: "mission-1" }
		},
		{
			id: "foreign-room",
			missionId: "mission-2",
			actor: "foreign-agent",
			type: "action.started",
			at: "2026-07-21T05:00:04.000Z",
			status: "running"
		}
	]
};

const channels = buildAgentChannels(
	state,
	Date.parse("2026-07-21T05:00:05.000Z")
);
assert.deepEqual(
	channels.map(channel => channel.agentId).sort(),
	["planner", "reviewer", "writer"]
);
assert(channels.every(channel => channel.roomWebSocketConnected));
assert(channels.every(channel => channel.accountWebSocketConnected));
assert(channels.every(channel => channel.connectionLabel === "Room + account WebSockets"));
assert.equal(ensureSelectedAgent(state, channels), "writer");
assert.equal(agentConversation(state, "writer").length, 1);
assert(!channels.some(channel => channel.agentId === "foreign-agent"));

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
