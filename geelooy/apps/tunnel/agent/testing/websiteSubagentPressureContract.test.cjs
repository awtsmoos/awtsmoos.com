// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Seeder = require("../tools/fs/actionGroups/websiteAgents/runner/seedPendingChildren.js");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const PlannerPolicy = require("../tools/fs/actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Guards pressure-aware activation beneath an unbounded logical descendant policy.
 * @description
 * The Awtsmoos records children before pressure may delay them; Awtsmoos.com never buys
 * throughput by weakening one-tab safety or the twenty-four-second verified-close covenant.
 */
const spawn = read("../tools/fs/actionGroups/websiteAgents/runner/spawn.js");
const drain = read("../tools/fs/actionGroups/websiteAgents/runner/drainSpawnQueue.js");
const status = read("../tools/fs/actionGroups/websiteAgents/runner/status.js");
const admission = read("../tools/fs/actionGroups/websiteAgents/runner/spawnAdmission.js");

const admitIndex = spawn.indexOf("Spawning.admit");
const evaluateIndex = spawn.indexOf("Admission.evaluate");
const seedCallIndex = spawn.indexOf("await seedPendingChildren");
assert.ok(admitIndex >= 0 && admitIndex < evaluateIndex);
assert.ok(evaluateIndex >= 0 && evaluateIndex < seedCallIndex);
assert.match(spawn, /if \(!activation\.allowActivation\)[\s\S]*scheduleWake/);

const loopIndex = drain.indexOf("for (let quantumIndex");
assert.ok(loopIndex >= 0);
assert.ok(drain.indexOf("Admission.evaluate", loopIndex) > loopIndex);
assert.ok(drain.indexOf("await seedPendingChildren", loopIndex) > loopIndex);
assert.match(drain, /Fairness\.select/);
assert.doesNotMatch(drain, /while\s*\(true\)/);
assert.equal(Seeder.boundedLimit(undefined), Infinity);
assert.equal(Seeder.boundedLimit(null), Infinity);
assert.match(status, /spawnAdmission/);
assert.match(status, /subagentBacklog/);
for (const source of [spawn, drain, admission]) {
	assert.doesNotMatch(source, /process\.exit|replacementRequested|\.terminate\s*\(/i);
}

const plan = Planner.plan({ root: process.cwd() }, {
	agentCount: 2,
	maxTotalWebsiteAgents: 512,
	spawnDrainQuantum: 7,
	spawnDrainMaxQuanta: 3
});
assert.equal(plan.physicalTabPolicy.maxActiveTabs, 1);
assert.equal(plan.physicalTabPolicy.postCloseCooldownMs, 24000);
assert.equal(plan.subagentPolicy.maxTotalWebsiteAgents, null);
assert.equal(plan.subagentPolicy.unboundedLogicalDescendants, true);
assert.equal(plan.subagentPolicy.spawnDrainQuantum, 7);
assert.equal(plan.subagentPolicy.spawnDrainMaxQuanta, 3);
assert.equal(PlannerPolicy.POST_CLOSE_COOLDOWN_MS, 24000);

console.log(JSON.stringify({
	ok: true,
	boundedSeeding: true,
	unboundedLogicalDescendants: true,
	physicalTabs: 1,
	postCloseCooldownMs: 24000
}));

function read(relative) {
	return fs.readFileSync(path.join(__dirname, relative), "utf8");
}
