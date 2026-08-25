// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-subagent-settle-"));
process.env.AWTSMOOS_TUNNEL_STATE_ROOT = root;
const recordSettlement = require("../tools/fs/actionGroups/websiteAgents/runner/recordSubagentSettlement.js");
const Spacing = require("../tools/fs/actionGroups/websiteAgents/runner/subagentSpawnSpacing.js");

/**
 * @file Proves settlement follows accepted delivery and verified browser closure.
 * @description
 * The Awtsmoos distinguishes an imported helper from the moment its covenant is actually
 * invoked; Awtsmoos.com therefore witnesses both observable persistence behavior and the
 * exact dispatch call order, so a mere require statement can never masquerade as settlement.
 */
(async () => {
	try {
		const prepared = {
			agent: {
				id: "child-A",
				parentAgentId: "parent-A",
				generation: 2
			},
			record: {
				missionId: "mission-A",
				plan: {
					subagentPolicy: {
						subagentStartSpacingMs: 24000
					}
				}
			}
		};
		const uncertain = await recordSettlement(prepared, {
			acceptedAt: "2026-08-21T19:00:00.000Z",
			responseStatus: 202,
			tabLifecycle: {
				closeVerified: false,
				submissionUncertain: true
			}
		});
		assert.equal(uncertain.recorded, false);
		assert.equal(fs.existsSync(Spacing.statePath), false);

		const settled = await recordSettlement(prepared, {
			acceptedAt: "2026-08-21T19:00:01.000Z",
			responseStatus: 202,
			tabLifecycle: {
				closeVerified: true,
				submissionUncertain: false
			}
		});
		assert.equal(settled.recorded, true);
		const state = JSON.parse(fs.readFileSync(Spacing.statePath, "utf8"));
		assert.equal(state.logicalAgentId, "child-A");
		assert.equal(state.closeVerified, true);
		assert.equal(state.spacingMs, 24000);

		const source = fs.readFileSync(path.join(
			__dirname,
			"../tools/fs/actionGroups/websiteAgents/runner/dispatchRunTurn.js"
		), "utf8");
		const sendCall = source.indexOf("const result = await service.send");
		const settlementCall = source.indexOf(
			"const settlement = await recordSubagentSettlement"
		);
		assert.notEqual(sendCall, -1);
		assert.notEqual(settlementCall, -1);
		assert.ok(sendCall < settlementCall);
	} finally {
		fs.rmSync(root, {
			recursive: true,
			force: true
		});
	}
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
