// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-spawn-spacing-"));
process.env.AWTSMOOS_TUNNEL_STATE_ROOT = temporaryRoot;

const Spacing = require("../tools/fs/actionGroups/websiteAgents/runner/subagentSpawnSpacing.js");
const Admission = require("../tools/fs/actionGroups/websiteAgents/spawningPeerAdmission.js");

/**
 * @file Proves logical child count is unbounded while physical launches remain paced.
 * @description
 * The Awtsmoos permits many shluchim without a numerical wall. Awtsmoos.com makes
 * pressure wait instead of reject, and a durable host clock preserves the minimum
 * physical spacing even when callers request an unsafe smaller interval.
 */
test.after(() => {
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
});

test("large logical populations do not create a count-based rejection", () => {
	const record = {
		agents: Array.from({ length: 10000 }, (_, index) => ({ id: `agent-${index}` })),
		plan: { subagentPolicy: { allowRecursiveSubagents: true } }
	};
	assert.equal(Admission.rejectionReason(record), "");
	record.plan.subagentPolicy.allowRecursiveSubagents = false;
	assert.equal(Admission.rejectionReason(record), "recursive_subagents_disabled");
});

test("durable spawn gate clamps every physical child interval to at least twenty seconds", async () => {
	fs.mkdirSync(path.dirname(Spacing.statePath), { recursive: true });
	fs.writeFileSync(Spacing.statePath, JSON.stringify({
		lastAcceptedAt: Date.now() - 19950
	}));
	const startedAt = Date.now();
	const result = await Spacing.wait(1, { missionId: "mission-A", logicalAgentId: "child-A" });
	const elapsed = Date.now() - startedAt;
	assert.equal(result.spacingMs, 20000);
	assert.ok(elapsed >= 20, `expected a persisted wait, observed ${elapsed}ms`);
	const persisted = JSON.parse(fs.readFileSync(Spacing.statePath, "utf8"));
	assert.equal(persisted.spacingMs, 20000);
	assert.equal(persisted.logicalAgentId, "child-A");
});
