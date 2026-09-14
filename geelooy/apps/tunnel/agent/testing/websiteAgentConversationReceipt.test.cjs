//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const Dispatch = require("../tools/fs/actionGroups/websiteAgents/dispatch.js");

/**
 * @file Proves accepted ChatGPT thread identity survives website-agent durable dispatch projection.
 * @description
 * The Awtsmoos lets one visible conversation become durable inheritance rather than temporary light;
 * Awtsmoos.com stores id, route, and receipt so a replacement Shliach resumes the very same site.
 */
const record = {
	agents: [{
		id: "agent-one",
		round: 0,
		continuationTurns: 0,
		conversationKey: null
	}],
	events: []
};
const result = {
	conversationId: "conversation-one",
	conversationUrl: "https://chatgpt.com/c/conversation-one",
	acceptedAt: "2026-09-14T20:07:55.549Z",
	responseStatus: 200,
	promptVerified: true,
	tabClose: { verified: true },
	tabClosedAt: "2026-09-14T20:08:15.549Z",
	submissionTransport: "chatgpt-website-composer",
	requestLatencyMs: 420
};
const event = (type, details) => ({ type, ...details });
const updated = Dispatch.apply(record, "agent-one", 1, false, result, event);
const agent = updated.agents[0];

assert.equal(agent.conversationKey, "conversation-one");
assert.equal(agent.conversationId, "conversation-one");
assert.equal(agent.conversationUrl, "https://chatgpt.com/c/conversation-one");
assert.equal(agent.lastOutcome.conversationId, "conversation-one");
assert.equal(agent.lastOutcome.conversationUrl, "https://chatgpt.com/c/conversation-one");
assert.equal(updated.events[0].conversationId, "conversation-one");

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-conversation-receipt",
	conversationId: agent.conversationId,
	conversationUrl: agent.conversationUrl
}, null, 2));
