// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Fairness = require("../tools/fs/actionGroups/websiteAgents/runner/spawnFairness.js");
const Policy = require("../tools/fs/actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Proves pressure-aware draining preserves parent fairness above the one-tab vessel.
 * @description The Awtsmoos may reveal one hundred children from one parent, yet Awtsmoos.com
 * lets quieter parents enter the next bounded activation quantum before abundance can dominate.
 */
const pending = [];
for (let index = 0; index < 100; index += 1) pending.push(agent("A", index));
pending.push(agent("B", 0), agent("C", 0));

const first = Fairness.select(pending, {});
assert.equal(first.quantum, 4);
assert.equal(first.maxQuanta, 2);
assert.equal(first.pendingCount, 102);
assert.equal(first.parentCount, 3);
assert.deepEqual(first.selected.map(item => item.id), ["A-0", "B-0", "C-0", "A-1"]);
assert.deepEqual(first.selectedByParent, { A: 2, B: 1, C: 1 });
assert.equal(first.remainingCount, 98);

const custom = Fairness.select(pending, { spawnDrainQuantum: 16, spawnDrainMaxQuanta: 8 });
assert.equal(custom.selected.length, 16);
assert.equal(custom.maxQuanta, 8);
assert.deepEqual(custom.selected.slice(0, 3).map(item => item.id), ["A-0", "B-0", "C-0"]);
assert.deepEqual(custom.selected.filter(item => item.parentAgentId === "A").map(item => item.ordinal),
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

assert.equal(Policy.POST_CLOSE_COOLDOWN_MS, 18_000);
assert.equal(Policy.spacing(1), 18_000);
const plannerSource = fs.readFileSync(path.join(__dirname,
	"../tools/fs/actionGroups/websiteAgents/planner.js"), "utf8");
const drainSource = fs.readFileSync(path.join(__dirname,
	"../tools/fs/actionGroups/websiteAgents/runner/drainSpawnQueue.js"), "utf8");
assert.match(plannerSource, /maxActiveTabs:\s*1/);
assert.match(drainSource, /decision\.maxQuanta/);
assert.match(drainSource, /Admission\.effectivePolicy/);
assert.match(drainSource, /Fairness\.select/);
assert.match(drainSource, /scheduleWake\(config, id/);

console.log(JSON.stringify({
	ok: true,
	suite: "website-subagent-spawn-fairness",
	logicalPending: pending.length,
	firstQuantum: first.selected.map(item => item.id),
	pressureAwareLimiter: true,
	physicalTabs: 1,
	postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
}, null, 2));

function agent(parentAgentId, ordinal) {
	return {
		id: `${parentAgentId}-${ordinal}`,
		parentAgentId,
		ordinal,
		createdAt: new Date(Date.UTC(2026, 7, 13, 18, 0, ordinal)).toISOString(),
		status: "pending"
	};
}
