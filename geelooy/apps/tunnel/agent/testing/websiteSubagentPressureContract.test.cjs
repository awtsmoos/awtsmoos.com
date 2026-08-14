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
 * @file Guards pressure-aware recursive activation order and immutable physical safety bounds.
 * @description The Awtsmoos remembers the child before asking whether it may incarnate;
 * Awtsmoos.com rechecks the vessel before every breath and never buys throughput with transport.
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
assert.match(spawn, /seedPendingChildren\(config, record\.id, activation\.quantum\)/);

const loopIndex = drain.indexOf("for (let quantumIndex");
const drainEvaluate = drain.indexOf("Admission.evaluate", loopIndex);
const drainSeed = drain.indexOf("await seedPendingChildren", loopIndex);
assert.ok(loopIndex >= 0 && drainEvaluate > loopIndex && drainEvaluate < drainSeed);
assert.match(drain, /Admission\.effectivePolicy/);
assert.match(drain, /Fairness\.select/);
assert.match(drain, /scheduleWake\(config, id, decision\.wakeMs\)/);
assert.doesNotMatch(drain, /while\s*\(true\)/);

assert.equal(Seeder.boundedLimit(undefined), Infinity);
assert.equal(Seeder.boundedLimit(null), Infinity);
assert.equal(Seeder.boundedLimit(1.9), 1);
assert.equal(Seeder.boundedLimit(-5), 0);

assert.match(status, /spawnAdmission/);
assert.match(status, /subagentBacklog/);
for (const source of [spawn, drain, admission]) {
	assert.doesNotMatch(source, /process\.exit|replacementRequested|websocket[^\n]*\.close|\.terminate\s*\(/i);
}

const plan = Planner.plan({ root: process.cwd() }, {
	agentCount: 2,
	maxTotalWebsiteAgents: 512,
	spawnDrainQuantum: 7,
	spawnDrainMaxQuanta: 3
});
assert.equal(plan.physicalTabPolicy.maxActiveTabs, 1);
assert.equal(plan.physicalTabPolicy.postCloseCooldownMs, 18000);
assert.equal(plan.subagentPolicy.maxTotalWebsiteAgents, 512);
assert.equal(plan.subagentPolicy.spawnDrainQuantum, 7);
assert.equal(plan.subagentPolicy.spawnDrainMaxQuanta, 3);
assert.equal(plan.subagentPolicy.pressureAwareActivation, true);
assert.equal(PlannerPolicy.POST_CLOSE_COOLDOWN_MS, 18000);

console.log(JSON.stringify({
	ok: true,
	suite: "website-subagent-pressure-contract",
	admitBeforePressure: true,
	pressureBeforeSeed: true,
	boundedSeeding: true,
	physicalTabs: 1,
	postCloseCooldownMs: 18000
}));

function read(relative) {
	return fs.readFileSync(path.join(__dirname, relative), "utf8");
}
