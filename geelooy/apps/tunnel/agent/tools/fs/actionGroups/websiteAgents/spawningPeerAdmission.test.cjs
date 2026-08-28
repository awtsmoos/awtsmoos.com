//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Admission = require("./spawningPeerAdmission.js");
const Store = require("./store.js");

/**
 * @file Proves recursive website-agent spawning belongs to every valid sponsor identity.
 * @description
 * The Awtsmoos may reveal many shluchim from many names beneath one guarded sky;
 * Awtsmoos.com binds duplicate deeds to their sponsor while honest siblings multiply.
 * Explicit policy may close the gate, and project-root walls stay firm and high.
 */
proveDifferentSponsorsCanSpawn();
proveOneSponsorCanSpawnMany();
proveDuplicateRequestAndPayloadDedup();
proveDisabledPolicyAndEscapingScopeReject();
console.log("BHY recursive website spawn is generic, deduplicated, and project-bounded");

/** Same request identity may independently belong to unrelated parent agents. */
function proveDifferentSponsorsCanSpawn() {
	const vessel = createVessel(true);
	const result = outcome();
	Admission.admitOne(vessel.record, vessel.alpha, request("shared-key", "alpha work"), result);
	Admission.admitOne(vessel.record, vessel.beta, request("shared-key", "alpha work"), result);
	assert.equal(result.accepted.length, 2);
	assert.notEqual(result.accepted[0].childAgentId, result.accepted[1].childAgentId);
	assert.deepEqual(result.accepted.map(item => item.parentAgentId), ["agent_alpha", "agent_beta"]);
}

/** One parent may fan out to several useful peers without a count-based ceiling. */
function proveOneSponsorCanSpawnMany() {
	const vessel = createVessel(true);
	const result = outcome();
	for (let index = 1; index <= 4; index += 1) {
		Admission.admitOne(
			vessel.record,
			vessel.alpha,
			request(`child-${index}`, `bounded assignment ${index}`),
			result
		);
	}
	assert.equal(result.accepted.length, 4);
	assert.equal(vessel.alpha.spawnedChildCount, 4);
	assert.equal(new Set(vessel.alpha.childAgentIds).size, 4);
}

/** Repeated request keys and equivalent payloads collapse only within one sponsor. */
function proveDuplicateRequestAndPayloadDedup() {
	const vessel = createVessel(true);
	const result = outcome();
	Admission.admitOne(vessel.record, vessel.alpha, request("first", "same bounded work"), result);
	Admission.admitOne(vessel.record, vessel.alpha, request("first", "changed text"), result);
	Admission.admitOne(vessel.record, vessel.alpha, request("second", "same bounded work"), result);
	assert.equal(result.accepted.length, 1);
	assert.equal(result.duplicates.length, 2);
	assert.equal(vessel.alpha.childAgentIds.length, 1);
}

/** Explicit recursion policy and project-root confinement remain hard safety gates. */
function proveDisabledPolicyAndEscapingScopeReject() {
	const disabled = createVessel(false);
	const disabledResult = outcome();
	Admission.admitOne(disabled.record, disabled.alpha, request("blocked", "work"), disabledResult);
	assert.equal(disabledResult.rejected[0].reason, "recursive_subagents_disabled");

	const bounded = createVessel(true);
	const escapeResult = outcome();
	Admission.admitOne(
		bounded.record,
		bounded.alpha,
		{ ...request("escape", "work"), scope: "../outside" },
		escapeResult
	);
	assert.equal(escapeResult.rejected[0].reason, "invalid_spawn_request");
}

function createVessel(allowRecursiveSubagents) {
	const alpha = sponsor("agent_alpha");
	const beta = sponsor("agent_beta");
	return {
		alpha,
		beta,
		record: {
			id: "website_mission_generic_spawn_test",
			missionId: "parent_mission_generic_spawn_test",
			plan: {
				projectRoot: process.cwd(),
				subagentPolicy: { allowRecursiveSubagents }
			},
			agents: [alpha, beta],
			spawnRegistry: {},
			spawnPayloadRegistry: {},
			events: []
		}
	};
}

function sponsor(id) {
	return Store.agentState("website_mission_generic_spawn_test", {
		id,
		name: id,
		role: "architect",
		focus: "generic parent",
		scope: ".",
		ordinal: 1
	});
}

function request(key, prompt) {
	return { requestKey: key, role: "specialist", scope: ".", childPrompt: prompt };
}

function outcome() {
	return { accepted: [], duplicates: [], rejected: [] };
}
