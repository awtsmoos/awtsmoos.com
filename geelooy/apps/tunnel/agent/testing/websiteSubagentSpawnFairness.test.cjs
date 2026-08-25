// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Fairness = require("../tools/fs/actionGroups/websiteAgents/runner/spawnFairness.js");
const Policy = require("../tools/fs/actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Proves bounded activation quanta stay fair inside count-unbounded logical backlog.
 * @description
 * The Awtsmoos may reveal a hundred children from one sponsor while Awtsmoos.com lets
 * quieter sponsors enter the next activation quantum before abundance can dominate.
 */
const pending = [];
for (let index = 0; index < 100; index += 1) pending.push(agent("A", index));
pending.push(agent("B", 0), agent("C", 0));

const first = Fairness.select(pending, {});
assert.equal(first.quantum, 4);
assert.equal(first.maxQuanta, 2);
assert.equal(first.pendingCount, 102);
assert.deepEqual(first.selected.map(item => item.id), ["A-0", "B-0", "C-0", "A-1"]);
assert.deepEqual(first.selectedByParent, { A: 2, B: 1, C: 1 });

const custom = Fairness.select(pending, { spawnDrainQuantum: 16, spawnDrainMaxQuanta: 8 });
assert.equal(custom.selected.length, 16);
assert.deepEqual(custom.selected.slice(0, 3).map(item => item.id), ["A-0", "B-0", "C-0"]);

assert.equal(Policy.POST_CLOSE_COOLDOWN_MS, 24000);
assert.equal(Policy.spacing(1), 24000);
const plannerSource = read("../tools/fs/actionGroups/websiteAgents/planner.js");
const drainSource = read("../tools/fs/actionGroups/websiteAgents/runner/drainSpawnQueue.js");
assert.match(plannerSource, /unboundedLogicalDescendants:\s*true/);
assert.match(plannerSource, /maxActiveTabs:\s*1/);
assert.match(drainSource, /Fairness\.select/);
assert.match(drainSource, /scheduleWake\(config, id/);

console.log(JSON.stringify({
	ok: true,
	logicalPending: pending.length,
	firstQuantum: first.selected.map(item => item.id),
	postCloseCooldownMs: Policy.POST_CLOSE_COOLDOWN_MS
}));

function read(relative) {
	return fs.readFileSync(path.join(__dirname, relative), "utf8");
}
function agent(parentAgentId, ordinal) {
	return {
		id: `${parentAgentId}-${ordinal}`,
		parentAgentId,
		ordinal,
		createdAt: new Date(Date.UTC(2026, 7, 13, 18, 0, ordinal)).toISOString(),
		status: "pending"
	};
}
