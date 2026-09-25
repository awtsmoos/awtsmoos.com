// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Resolver = require("../tools/fs/actionGroups/missionIdentityResolver.js");

/**
 * @file Proves mission identity resolves through every handle a caller may know.
 * @description The Awtsmoos lets a Shliach name a mission by any identity it truly carries.
 * Awtsmoos.com proves website mission IDs, collaboration IDs, child agent IDs, spawn request
 * keys, logical agent identities, and session identities all resolve to one canonical
 * website-mission view with an explicit collaborationMissionId and canonicalStatusAction.
 */

function record() {
	return {
		id: "web_1",
		missionId: "mission_old",
		agents: [
			{ id: "wagent_7", agentSessionId: "sess_abc", spawnRequestKey: "req_spawn_1", logicalAgentId: "builder-prime" }
		]
	};
}

test("direct website mission id resolves", () => {
	const identity = Resolver.resolve({ websiteMissionId: "web_1" }, record());
	assert.equal(identity.kind, "website_mission");
	assert.equal(identity.websiteMissionId, "web_1");
	assert.equal(identity.collaborationMissionId, "mission_old");
	assert.equal(identity.matchedBy, "website_mission_id");
	assert.equal(identity.canonicalStatusAction, "websiteAgentMissionStatus");
});

test("collaboration mission id resolves", () => {
	const identity = Resolver.resolve({ missionId: "mission_old" }, record());
	assert.equal(identity.kind, "website_mission");
	assert.equal(identity.matchedBy, "mission_id");
});

test("website child agent id resolves with lineage", () => {
	const identity = Resolver.resolve({ childAgentId: "wagent_7" }, record());
	assert.equal(identity.kind, "website_mission");
	assert.equal(identity.matchedBy, "website_child_agent_id");
	assert.equal(identity.childAgentId, "wagent_7");
	assert.equal(identity.logicalAgentId, "builder-prime");
	assert.equal(identity.sessionId, "sess_abc");
	assert.equal(identity.requestKey, "req_spawn_1");
});

test("spawn request key resolves the child agent", () => {
	const identity = Resolver.resolve({ requestKey: "req_spawn_1" }, record());
	assert.equal(identity.kind, "website_mission");
	assert.equal(identity.matchedBy, "spawn_request_key");
	assert.equal(identity.childAgentId, "wagent_7");
});

test("logical agent identity and session identity resolve", () => {
	assert.equal(Resolver.resolve({ logicalAgentId: "builder-prime" }, record()).matchedBy, "logical_agent_id");
	assert.equal(Resolver.resolve({ sessionId: "sess_abc" }, record()).matchedBy, "agent_session_id");
});

test("unknown identity stays unknown without a guess", () => {
	const identity = Resolver.resolve({ childAgentId: "nope" }, record());
	assert.equal(identity.kind, "unknown");
	assert.equal(identity.matchedBy, "none");
});

test("native-only mission id keeps the native kind", () => {
	const identity = Resolver.resolve({ missionId: "mission_native" }, null);
	assert.equal(identity.kind, "mission");
	assert.equal(identity.registry, "native");
	assert.equal(identity.canonicalStatusAction, "missionGet");
});

test("publicView exposes the full website-mission observation contract", () => {
	const view = Resolver.publicView(record(), "missionGet");
	assert.equal(view.kind, "website_mission");
	assert.equal(view.registry, "website");
	assert.equal(view.websiteMissionId, "web_1");
	assert.equal(view.collaborationMissionId, "mission_old");
	assert.equal(view.canonicalStatusAction, "websiteAgentMissionStatus");
	assert.equal(view.next.action, "websiteAgentMissionStatus");
	assert.equal(view.agentCount, 1);
});
