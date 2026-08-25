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
 * @file Proves logical descendants stay count-unbounded while physical pacing starts at settlement.
 * @description
 * The Awtsmoos allows many logical shluchim, yet Awtsmoos.com advances the physical clock
 * only after accepted submission and verified close; merely waiting to start never moves it.
 */
test.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

test("large logical populations do not create a count rejection", () => {
	const record = {
		agents: Array.from({ length: 10000 }, (_, index) => ({ id: `agent-${index}` })),
		plan: { subagentPolicy: { allowRecursiveSubagents: true } }
	};
	assert.equal(Admission.rejectionReason(record), "");
});

test("wait reads prior settlement but never advances it", async () => {
	fs.mkdirSync(path.dirname(Spacing.statePath), { recursive: true });
	const prior = Date.now() - 24001;
	fs.writeFileSync(Spacing.statePath, JSON.stringify({ lastSettledAt: prior }));
	const before = fs.readFileSync(Spacing.statePath, "utf8");
	const result = await Spacing.wait(1);
	assert.equal(result.spacingMs, 24000);
	assert.equal(result.lastSettledAt, prior);
	assert.equal(fs.readFileSync(Spacing.statePath, "utf8"), before);
});

test("only verified accepted close creates the next cooldown anchor", async () => {
	const rejected = await Spacing.markSettled({ responseStatus: 202, closeVerified: false });
	assert.equal(rejected.recorded, false);
	const settled = await Spacing.markSettled({
		missionId: "mission-A",
		logicalAgentId: "child-A",
		responseStatus: 202,
		closeVerified: true,
		submissionUncertain: false,
		spacingMs: 1
	});
	assert.equal(settled.recorded, true);
	assert.equal(settled.spacingMs, 24000);
	assert.equal(Spacing.remainingMs(settled.lastSettledAt, settled.lastSettledAt + 23999, 1), 1);
	assert.equal(Spacing.remainingMs(settled.lastSettledAt, settled.lastSettledAt + 24000, 1), 0);
	const persisted = JSON.parse(fs.readFileSync(Spacing.statePath, "utf8"));
	assert.equal(persisted.logicalAgentId, "child-A");
	assert.equal(persisted.closeVerified, true);
});
