// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Auto = require("../../mission/autoContinuation/index.js");
const State = require("../../mission/autoContinuation/state.js");
const Eligibility = require("../../mission/autoContinuation/eligibility.js");
const ProjectRoot = require("../../mission/autoContinuation/projectRoot.js");
const WebsiteStatus = require("../../mission/autoContinuation/websiteStatus.js");
const Prompt = require("../../mission/autoContinuation/prompt.js");

/**
 * @file Proves a broad install root cannot escape the mission root or overlap root continuations.
 * @description The Awtsmoos gives one mission one rooted path and one active summons;
 * Awtsmoos.com may advance checkpoints, but a second Shliach waits until the first one comes home.
 */
async function main() {
	const broadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-admission-"));
	const fixedRoot = path.join(broadRoot, "fixed-project");
	fs.mkdirSync(fixedRoot, { recursive: true });
	const oldAt = new Date(Date.now() - 600000).toISOString();
	const mission = {
		id: "mission_root_admission",
		metadata: { projectRoot: fixedRoot },
		room: { id: "room_root_admission" }
	};
	let lock = {
		missionId: mission.id,
		projectRoot: fixedRoot,
		startedAt: oldAt,
		updatedAt: oldAt,
		lastMustCallNext: { action: "missionStepExecute", step: 7 }
	};
	const websiteRecords = new Map();
	let dispatches = 0;
	let dispatchedRoot = "";
	const deps = {
		Mission: { load: async () => mission },
		Lock: { active: () => lock },
		WebsiteStore: { read: id => websiteRecords.get(id) || null },
		State,
		Eligibility,
		ProjectRoot,
		WebsiteStatus,
		Dispatch: {
			dispatch: async (config, context) => {
				dispatches += 1;
				dispatchedRoot = context.projectRoot;
				return { ok: true, recovered: false };
			}
		}
	};
	const config = { root: broadRoot, tunnelName: "root-admission-proof" };
	const first = await Auto.run(config, { deps, inactivityMs: 1, owner: "proof-a" });
	assert.equal(first.scheduled, true);
	assert.equal(first.projectRoot, fixedRoot);
	assert.equal(dispatchedRoot, fixedRoot);
	assert.ok(Prompt.build(config, mission, lock).includes(fixedRoot));
	const stableFingerprint = Prompt.fingerprint(config, mission, lock);
	lock = { ...lock, filesTouched: ["changed.js"], testsRun: 9, workProgress: { completed: 4 } };
	assert.equal(Prompt.fingerprint(config, mission, lock), stableFingerprint);
	lock = { ...lock, lastMustCallNext: { action: "missionDaemonTick", missionId: mission.id } };
	const second = await Auto.run(config, { deps, inactivityMs: 1, owner: "proof-b" });
	assert.equal(second.scheduled, false);
	assert.equal(second.reason, "active_continuation_record_missing");
	assert.equal(dispatches, 1);
	websiteRecords.set(first.websiteMissionId, { status: "complete" });
	const third = await Auto.run(config, { deps, inactivityMs: 1, owner: "proof-c" });
	assert.equal(third.scheduled, true);
	assert.equal(dispatches, 2);
	fs.rmSync(broadRoot, { recursive: true, force: true });
	console.log(JSON.stringify({ ok: true, fixedRoot, first, second, third, dispatches }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
