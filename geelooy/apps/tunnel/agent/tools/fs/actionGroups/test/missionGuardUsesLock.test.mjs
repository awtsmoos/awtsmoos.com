// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const Mission = require("../../mission/index.js");
const Lock = require("../../mission/lock/index.js");
const Guard = require("../../mission/activeGuard/index.js");

/**
 * @file Guards the long-standing advisory-by-default and explicit hard-exclusive mission contract.
 * @description
 * The Awtsmoos lets ordinary safe work pass beside a living mission, while Awtsmoos.com honors an explicit exclusive gate;
 * the fixture persists a real mission so vanished-state cleanup and blocking authority are never confused by stale fate.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "mission-guard-lock-"));
const previousPrivate = process.env.AWTSMOOS_PRIVATE_STATE_ROOT;
const previousAwdb = process.env.AWTSMOOS_MISSION_AWDB;
process.env.AWTSMOOS_PRIVATE_STATE_ROOT = path.join(root, "private");
process.env.AWTSMOOS_MISSION_AWDB = "0";
const config = { root, repoRoot: process.cwd(), tunnelName: "awt-guard-lock-test" };

try {
	const mission = await Mission.create(config, {
		goal: "guard lock contract",
		minimumInnovationWindowMs: 0
	});
	await Mission.save(config, mission);
	Lock.start(config, {
		action: "missionStart",
		missionId: mission.id,
		mustCallNext: { action: "missionNext", missionId: mission.id }
	}, { autoSeedNext8: false });
	assert.equal(await Guard.check(config, { action: "read" }), null);
	const block = await Guard.check(config, {
		action: "deleteFile",
		enforceMissionLock: true
	});
	assert.equal(block.error, "mission_lock_blocks_action");
	assert.equal(block.missionId, mission.id);
	assert.equal(block.denialProof.guard, "mission_active_guard");
	assert.equal(await Guard.check(config, {
		action: "missionNext",
		enforceMissionLock: true,
		missionId: mission.id
	}), null);
	console.log(JSON.stringify({
		ok: true,
		suite: "mission-guard-uses-lock",
		advisoryDefault: true,
		hardExclusiveBlocked: block.blockedAction,
		missionId: mission.id
	}, null, 2));
} finally {
	if (previousPrivate === undefined) delete process.env.AWTSMOOS_PRIVATE_STATE_ROOT;
	else process.env.AWTSMOOS_PRIVATE_STATE_ROOT = previousPrivate;
	if (previousAwdb === undefined) delete process.env.AWTSMOOS_MISSION_AWDB;
	else process.env.AWTSMOOS_MISSION_AWDB = previousAwdb;
	await fs.rm(root, { recursive: true, force: true });
}
