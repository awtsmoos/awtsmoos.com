//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Discovery = require("../tools/fs/actionGroups/websiteAgents/runner/spawnDiscovery.js");

/**
 * @file Proves recursive website-agent spawning discovers durable lineage without historical room IDs.
 * @description The Awtsmoos lets one stable request key find its Mission and sponsor from durable
 * website state, so a Shliach never guesses stale collaboration IDs or resends uncertain children.
 */
function record(id, missionId, updatedAt, agents = [], extra = {}) {
	return {
		id,
		missionId,
		updatedAt,
		status: "running",
		agents,
		spawnRegistry: {},
		spawnPayloadRegistry: {},
		lead: { agentId: agents[0]?.id || "" },
		...extra
	};
}

function store(records) {
	return {
		list: () => [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
		read: id => records.find(item => item.id === id) || null
	};
}

test("historical collaboration Mission id resolves through durable website lineage", () => {
	const durable = record("web_old", "mission_historical", "2026-09-18T01:00:00Z", [
		{ id: "root-a", depth: 0, status: "working" }
	]);
	const result = Discovery.resolve(store([durable]), { missionId: "mission_historical" });
	assert.equal(result.ok, true);
	assert.equal(result.websiteMissionId, "web_old");
	assert.equal(result.parentAgentId, "root-a");
	assert.equal(result.recordSource, "mission_lineage");
	assert.equal(result.sponsorSource, "active_root_agent");
});

test("request-key registry outranks newer unrelated active Mission", () => {
	const older = record("web_match", "mission_old", "2026-09-18T01:00:00Z", [
		{ id: "parent-a", depth: 0, status: "working" },
		{ id: "child-a", parentAgentId: "parent-a", spawnRequestKey: "stable-key", status: "queued" }
	], { spawnRegistry: { "stable-key": "child-a" } });
	const newer = record("web_new", "mission_new", "2026-09-18T02:00:00Z", [
		{ id: "root-b", depth: 0, status: "working" }
	]);
	const result = Discovery.resolve(store([newer, older]), { requestKey: "stable-key" });
	assert.equal(result.websiteMissionId, "web_match");
	assert.equal(result.parentAgentId, "parent-a");
	assert.equal(result.recordSource, "request_key_registry");
	assert.equal(result.sponsorSource, "request_key_parent");
});

test("explicit website Mission and sponsor identity always win", () => {
	const chosen = record("web_explicit", "mission_a", "2026-09-18T01:00:00Z", [
		{ id: "root-a", depth: 0, status: "working" },
		{ id: "special", agentSessionId: "session-special", depth: 0, status: "working" }
	]);
	const result = Discovery.resolve(store([chosen]), {
		websiteMissionId: "web_explicit",
		parentAgentId: "session-special"
	});
	assert.equal(result.websiteMissionId, "web_explicit");
	assert.equal(result.parentAgentId, "special");
	assert.equal(result.recordSource, "explicit_website_mission");
	assert.equal(result.sponsorSource, "explicit_or_runtime_identity");
});

test("newest active durable Mission is a bounded fallback", () => {
	const old = record("web_old", "mission_old", "2026-09-18T01:00:00Z", [
		{ id: "old-root", depth: 0, status: "working" }
	]);
	const latest = record("web_latest", "mission_latest", "2026-09-18T03:00:00Z", [
		{ id: "new-root", depth: 0, status: "working" }
	]);
	const result = Discovery.resolve(store([old, latest]), {});
	assert.equal(result.websiteMissionId, "web_latest");
	assert.equal(result.parentAgentId, "new-root");
	assert.equal(result.recordSource, "latest_active");
});

test("empty durable store fails precisely without guessing", () => {
	const result = Discovery.resolve(store([]), { requestKey: "torah-ohr-103-five" });
	assert.equal(result.ok, false);
	assert.equal(result.reason, "website_mission_not_discovered");
});
