// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const NEWLINE = String.fromCharCode(10);

/**
 * @file Proves terminal completion creates a fresh connected prompt with living absolute paths.
 * @description
 * The Awtsmoos carries unfinished meaning into one new browser vessel; Awtsmoos.com now gives
 * that successor the verified current root and handoff file explicitly while stale predecessor
 * coordinates remain redacted and deterministic mission lineage stays bound to the same flame.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts terminal root "));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");
const Activation = require("../tools/fs/mission/successorActivation.js");

try {
	fs.mkdirSync(path.join(root, ".git"), { recursive: true });
	fs.mkdirSync(path.join(root, "api"), { recursive: true });
	const liveRoot = fs.realpathSync(root);
	const handoff = path.join(root, "handoff", "next mission.md");
	fs.mkdirSync(path.dirname(handoff), { recursive: true });
	fs.writeFileSync(handoff, ["Continue the verified unfinished work.", ""].join(NEWLINE));
	const liveHandoff = fs.realpathSync(handoff);
	const missionId = "mission-terminal-connected";
	const websiteId = `terminal-prompt-${process.pid}-${Date.now()}`;
	const plan = Planner.plan({ root: liveRoot }, { agentCount: 1, projectRoot: liveRoot });
	const record = Store.create({
		id: websiteId,
		goal: "Finish the mission through a fresh successor chat.",
		missionId,
		plan
	});
	const predecessorId = record.agents[0].id;
	Store.update(websiteId, (current) => {
		const predecessor = current.agents.find((agent) => agent.id === predecessorId);
		predecessor.generation = 4;
		predecessor.spawnGroupId = "generation-family-one";
		predecessor.scope = "api";
		return current;
	});
	const mission = {
		id: missionId,
		goal: "Finish the mission through a fresh successor chat.",
		status: "active",
		room: { projectRoot: liveRoot, agents: {} },
		events: [{ type: "mission_handoff", data: { handoffPaths: [liveHandoff] } }]
	};
	const work = {
		unfinishedTasks: ["Fix /Users/old-machine/project/src/legacy.js"],
		issues: ["Historical path must not leak"],
		mustCallNext: {
			action: "commandStatus",
			path: "/Users/old-machine/project/jobs/old.json"
		}
	};
	const activation = Activation.plan(
		{ root: liveRoot }, mission, predecessorId, "terminal-connected-key", work
	);
	assert.equal(activation.mode, "website");
	assert.equal(activation.freshChat, true);
	assert.equal(activation.projectRoot, liveRoot);
	assert.equal(activation.generation, 5);
	assert.equal(activation.predecessorId, predecessorId);
	assert.ok(activation.absoluteHandoffPaths.includes(liveHandoff));
	assert.ok(activation.handoffReferences.includes("project:handoff/next mission.md"));
	assert.ok(activation.prompt.includes(`verifiedAbsoluteProjectRoot: ${liveRoot}`));
	assert.ok(activation.prompt.includes(liveHandoff));
	assert.ok(activation.prompt.includes(missionId));
	assert.ok(activation.prompt.includes(predecessorId));
	assert.ok(activation.prompt.includes(activation.successorId));
	assert.ok(activation.prompt.includes("existing main branch only"));
	assert.ok(activation.prompt.includes("[historical-path-redacted]"));
	assert.equal(activation.prompt.includes("/Users/old-machine"), false);
	console.log(JSON.stringify({ ok: true, suite: "terminal-successor-connected-prompt" }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
