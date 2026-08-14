// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const Dispatch = require("./dispatch.js");

test("accepted website receipt becomes durable dispatched working state", () => {
	const record = {
		agents: [{ id: "agent-one", status: "submitting", round: 0,
			continuationTurns: 0, pendingRound: 1 }],
		events: []
	};
	const result = Dispatch.apply(record, "agent-one", 1, false, {
		conversationKey: "BH_DIRECT_PRIVATE",
		acceptedAt: "2026-08-03T15:00:00.000Z",
		responseStatus: 200,
		promptVerified: true,
		tabClose: { verified: true }
	}, (type, detail) => ({ type, detail }));
	const agent = result.agents[0];
	assert.equal(agent.status, "dispatched");
	assert.equal(agent.lastOutcome.complete, false);
	assert.equal(agent.lastOutcome.dispatched, true);
	assert.equal(Dispatch.hasWorkingAgents(result), true);
	assert.equal(Dispatch.isTerminalForBrowser(agent), true);
	assert.equal(result.events[0].type, "agent_prompt_dispatched");
});
