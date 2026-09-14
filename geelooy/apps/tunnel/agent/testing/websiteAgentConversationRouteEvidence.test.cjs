//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const Evidence = require("../tools/fs/actionGroups/websiteAgents/runner/conversationRouteEvidence.js");

/** Proves local relay identities can never satisfy saved ChatGPT conversation evidence. */
const uuid = "12345678-1234-4234-8234-123456789abc";

assert.equal(Evidence.validConversationId("BH_DIRECT_12345678-1234-4234-8234-123456789abc"), null);
assert.equal(Evidence.validConversationId(uuid), uuid);
assert.equal(Evidence.complete({
	submissionAcceptedAt: "2026-09-14T20:00:00.000Z",
	conversationId: uuid
}), false);
assert.equal(Evidence.complete({
	submissionAcceptedAt: "2026-09-14T20:00:00.000Z",
	conversationId: uuid,
	conversationRouteVerifiedAt: "2026-09-14T20:00:01.000Z"
}), true);
assert.equal(Evidence.conversationId({
	conversationId: "BH_DIRECT_fake",
	conversationRouteVerifiedAt: "2026-09-14T20:00:01.000Z"
}), null);

console.log(JSON.stringify({ ok: true, suite: "website-agent-conversation-route-evidence", uuid }, null, 2));
