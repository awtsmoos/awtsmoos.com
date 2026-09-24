// B"H
// Boruch Hashem
// Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");

/**
 * @file Proves the website registry bridge speaks canonical mission identity.
 * @description The Awtsmoos never makes a Shliach guess which ledger owns an id.
 * Awtsmoos.com proves the missionGet website fallback resolves website records via child
 * agent id, spawn request key, and agent session id — and that public views carry kind
 * website_mission, collaborationMissionId, and the canonical status action.
 */

const WebsiteStore = require("../tools/fs/actionGroups/websiteAgents/store.js");

const record = {
	id: "web_1",
	missionId: "collab_1",
	status: "running",
	phase: "agents_working",
	createdAt: "2026-09-24T00:00:00.000Z",
	updatedAt: "2026-09-24T00:00:00.000Z",
	finishedAt: null,
	goal: "bridge test mission",
	roomRevision: 3,
	agents: [
		{
			id: "agent-7",
			agentSessionId: "sess-7",
			spawnRequestKey: "sk-1",
			logicalAgentId: "logical-7",
			name: "Seven",
			status: "active"
		}
	],
	events: []
};

const clone = () => JSON.parse(JSON.stringify(record));
const originalRead = WebsiteStore.read;
const originalList = WebsiteStore.list;
WebsiteStore.read = id => (String(id) === "web_1" || String(id) === "collab_1") ? clone() : null;
WebsiteStore.list = () => [clone()];

const { bridgeMissionLookup } = require("../tools/fs/actionBuilderGroups/missionActions.js");
const MissionRegistry = require("../tools/fs/actionGroups/missionRegistryBridge.js");

function wrappedGet(payload) {
	const wrapped = bridgeMissionLookup(
		{ missionGet: async () => ({ ok: false, error: "mission_not_found" }) },
		{ payload }
	);
	return wrapped.missionGet();
}

test("fallback resolves website record via child agent id", async () => {
	const result = await wrappedGet({ websiteMissionId: "web_1", childAgentId: "agent-7" });
	assert.equal(result.ok, true);
	assert.equal(result.kind, "website_mission");
	assert.equal(result.registry, "website");
	assert.equal(result.websiteMissionId, "web_1");
	assert.equal(result.collaborationMissionId, "collab_1");
	assert.equal(result.canonicalStatusAction, "websiteAgentMissionStatus");
	assert.equal(result.next.action, "websiteAgentMissionStatus");
	assert.equal(result.identity.kind, "website_mission");
	assert.equal(result.identity.matchedBy, "website_child_agent_id");
	assert.equal(result.identity.childAgentId, "agent-7");
	assert.equal(result.identity.sessionId, "sess-7");
	assert.equal(result.identity.requestKey, "sk-1");
	assert.equal(result.identity.logicalAgentId, "logical-7");
});

test("fallback resolves via spawn request key", async () => {
	const result = await wrappedGet({ missionId: "collab_1", spawnRequestKey: "sk-1" });
	assert.equal(result.identity.kind, "website_mission");
	assert.equal(result.identity.matchedBy, "spawn_request_key");
	assert.equal(result.identity.childAgentId, "agent-7");
	assert.equal(result.identity.sessionId, "sess-7");
	assert.equal(result.identity.requestKey, "sk-1");
});

test("fallback resolves via agent session id", async () => {
	const result = await wrappedGet({ id: "web_1", sessionId: "sess-7" });
	assert.equal(result.identity.kind, "website_mission");
	assert.equal(result.identity.matchedBy, "agent_session_id");
	assert.equal(result.identity.childAgentId, "agent-7");
	assert.equal(result.identity.sessionId, "sess-7");
});

test("fallback passes through when the ordinary registry succeeds", async () => {
	const direct = { ok: true, missionId: "native_1" };
	const wrapped = bridgeMissionLookup(
		{ missionGet: async () => direct },
		{ payload: { missionId: "native_1" } }
	);
	assert.equal(await wrapped.missionGet(), direct);
});

test("fallback returns the original error when no website record matches", async () => {
	const missing = { ok: false, error: "mission_not_found" };
	const wrapped = bridgeMissionLookup(
		{ missionGet: async () => missing },
		{ payload: { missionId: "nope" } }
	);
	assert.equal(await wrapped.missionGet(), missing);
});

test("publicView carries canonical identity fields", () => {
	const view = MissionRegistry.publicView(clone(), "missionGet");
	assert.equal(view.ok, true);
	assert.equal(view.kind, "website_mission");
	assert.equal(view.registry, "website");
	assert.equal(view.websiteMissionId, "web_1");
	assert.equal(view.collaborationMissionId, "collab_1");
	assert.equal(view.canonicalStatusAction, "websiteAgentMissionStatus");
	assert.equal(view.next.action, "websiteAgentMissionStatus");
	assert.equal(view.next.websiteMissionId, "web_1");
	assert.equal(view.identity.kind, "website_mission");
	assert.equal(view.observationOnly, true);
	assert.ok(view.mission && view.mission.id === "web_1");
});

test("publicView returns null for a missing record", () => {
	assert.equal(MissionRegistry.publicView(null), null);
});

test("teardown restores the website store", () => {
	WebsiteStore.read = originalRead;
	WebsiteStore.list = originalList;
	assert.equal(WebsiteStore.read, originalRead);
});
