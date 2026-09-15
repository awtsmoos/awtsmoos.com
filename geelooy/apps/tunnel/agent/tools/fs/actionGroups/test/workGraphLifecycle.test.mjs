//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const MissionStore = require("../../mission/ledger/store.js");
const SessionStore = require("../../mission/agentSessionStore.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Paths = require("../../workGraph/paths.js");
const Records = require("../../workGraph/recordStore.js");

/**
 * @file Proves persisted Work and disposable sessions cast stable lifecycle shadows.
 * @description The Awtsmoos lets operational truth move first; Awtsmoos.com then keeps
 * registration, claim, completion and incarnation lineage without recording idle pulses.
 */
function work(state, updatedAt, claim = null) {
	return {
		id: "work_lifecycle_test",
		title: "Prove lifecycle",
		state,
		priority: "high",
		owner: claim?.logicalAgentId || "",
		claim,
		absolutePaths: ["/project/source.js"],
		createdAt: "2026-09-15T00:00:00.000Z",
		updatedAt,
		verification: { required: true, status: state === "completed" ? "passed" : "pending", evidenceIds: [] },
		origin: "test",
		blocker: null,
		nextAction: null
	};
}

async function saveMission(config, item) {
	return MissionStore.save(config, {
		id: "mission_lifecycle_test",
		missionId: "mission_lifecycle_test",
		remainingWork: [item]
	});
}

function session(id, extras = {}) {
	return {
		id,
		logicalAgentId: "agent:lifecycle",
		role: "worker",
		status: "active",
		startedAt: "2026-09-15T00:00:00.000Z",
		lastSeenAt: "2026-09-15T00:00:01.000Z",
		activeMissionId: "",
		assignmentHistory: [],
		replacementOf: "",
		...extras
	};
}

async function proveWork(config) {
	const discovered = work("discovered", "2026-09-15T00:00:01.000Z");
	await saveMission(config, discovered);
	await saveMission(config, discovered);
	const claim = { sessionId: "session_a", logicalAgentId: "agent:lifecycle" };
	await saveMission(config, work("claimed", "2026-09-15T00:00:02.000Z", claim));
	await saveMission(config, work("completed", "2026-09-15T00:00:03.000Z", claim));
	const events = (await Ledger.list(config)).filter(event => event.workId === discovered.id);
	assert.deepEqual(events.map(event => event.type), [
		"work.registered",
		"work.claimed",
		"work.completed"
	]);
}

async function proveSessions(config) {
	const first = session("session_a");
	await SessionStore.save(config, first);
	await SessionStore.save(config, { ...first, lastSeenAt: "2026-09-15T00:00:09.000Z" });
	const assigned = {
		...first,
		status: "working",
		activeMissionId: "mission_lifecycle_test",
		lastSeenAt: "2026-09-15T00:00:10.000Z",
		lastAssignment: { missionId: "mission_lifecycle_test", workId: "work_lifecycle_test", reason: "test" }
	};
	await SessionStore.save(config, assigned);
	await SessionStore.save(config, session("session_b", { replacementOf: "session_a" }));
	await SessionStore.save(config, { ...assigned, replacedBy: "session_b", recoveredAt: "2026-09-15T00:00:11.000Z" });
	const events = (await Ledger.list(config)).filter(event => event.type.startsWith("agent.session."));
	assert.deepEqual(events.map(event => event.type), [
		"agent.session.opened",
		"agent.session.assigned",
		"agent.session.replacementOpened",
		"agent.session.replaced"
	]);
	const relations = await Records.listJson(Paths.relations(config));
	assert.equal(relations.filter(relation => relation.type === "incarnationOf").length, 2);
	assert.equal(relations.filter(relation => relation.type === "replaces").length, 1);
	assert.equal(relations.filter(relation => relation.type === "replacedBy").length, 1);
}

async function main() {
	const sandbox = Harness.createSandbox();
	try {
		await proveWork(sandbox.config);
		await proveSessions(sandbox.config);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-lifecycle" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
