// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
require("../tools/fs/actionGroups/websiteAgents/runner/event.js");
const Signal = require(
	"../tools/fs/actionGroups/websiteAgents/runner/messageSignal.js"
);

const BODY = "Wake only the five hundred selected website shluchim.";

/**
 * @file Stress-proves selected-recipient website-agent wake routing without body fanout.
 * @description
 * The Awtsmoos can awaken hundreds of browser shluchim from one durable room word.
 * Awtsmoos.com marks only addressed agents dirty, may reactivate an addressed completed
 * agent, and never copies the human message body into every website-agent record.
 */
const selected = Array.from(
	{ length: 500 },
	(_value, index) => `website-${String(index).padStart(3, "0")}`
);
const current = {
	roomRevision: 9,
	status: "running",
	phase: "working",
	finishedAt: null,
	events: [],
	agents: [
		...selected.map((id, index) => ({
			id,
			status: index === 0 ? "complete" : "active",
			roomDirty: false,
			pendingRoomMessages: 0,
			spawnGroupId: index % 2 ? "odd" : "even"
		})),
		{
			id: "website-outsider",
			status: "complete",
			roomDirty: false,
			pendingRoomMessages: 0,
			spawnGroupId: "outside"
		}
	]
};
const result = Signal.apply(current, {
	agentId: "",
	agentSignal: false,
	body: BODY,
	kind: "user-direct-message",
	terminal: false,
	reportId: "",
	input: {
		fromAgent: "control-room-human",
		toAgents: selected,
		body: BODY
	}
});

const addressed = result.agents.filter(agent => selected.includes(agent.id));
const outsider = result.agents.find(agent => agent.id === "website-outsider");
assert.equal(addressed.length, 500);
assert.equal(addressed.every(agent => agent.roomDirty), true);
assert.equal(addressed.every(agent => agent.pendingRoomMessages === 1), true);
assert.equal(addressed[0].status, "active");
assert.equal(outsider.roomDirty, false);
assert.equal(outsider.pendingRoomMessages, 0);
assert.equal(outsider.status, "complete");
assert.equal(result.agents.some(agent => agent.lastUpdate === BODY), false);
const event = result.events.at(-1);
assert.equal(event.type, "room_message_queued_for_agents");
assert.equal(event.toAgent, "selected_agents");
assert.equal(event.toAgents.length, 500);
assert.equal(Object.prototype.hasOwnProperty.call(event, "body"), false);
assert.equal(result.roomRevision, 10);

console.log(JSON.stringify({
	ok: true,
	suite: "website-mission-recipient-wake",
	selectedRecipients: 500,
	outsiderUntouched: true,
	bodyFanoutCopies: 0
}, null, 2));
