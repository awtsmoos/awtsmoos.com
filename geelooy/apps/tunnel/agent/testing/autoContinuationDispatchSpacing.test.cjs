// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Dispatch = require("../tools/fs/mission/autoContinuation/dispatch.js");
const Policy = require("../tools/fs/actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Proves every browser-backed auto-continuation requests the canonical cooldown.
 * @description
 * The Awtsmoos allows logical descendants without number while Awtsmoos.com protects one
 * physical doorway; every automatic continuation therefore asks for the same twenty-four
 * second post-close boundary instead of carrying an older, weaker clock into the queue.
 */
test("auto-continuation payload uses the canonical twenty-four-second spacing", () => {
	const payload = Dispatch.payload({ root: "/project" }, {
		websiteMissionId: "website-one",
		missionId: "mission-one",
		roomId: "room-one",
		prompt: "Continue the exact unfinished work",
		successorAgentId: "successor-one",
		agentSessionId: "session-one",
		generation: 2,
		spawnGroupId: "spawn-one",
		parentAgentId: "parent-one",
		predecessorAgentId: "predecessor-one",
		fingerprint: "fingerprint-one"
	});
	assert.equal(Policy.POST_CLOSE_COOLDOWN_MS, 24000);
	assert.equal(payload.startSpacingMs, Policy.POST_CLOSE_COOLDOWN_MS);
	assert.equal(payload.subagentStartSpacingMs, Policy.POST_CLOSE_COOLDOWN_MS);
	assert.equal(payload.continuationOnly, true);
	assert.equal(payload.autoContinuation, true);
});
