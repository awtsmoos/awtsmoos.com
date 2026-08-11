// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Actions = require("../../actions.js");
const Lock = require("../../mission/lock/index.js");

/**
 * @file Proves substantive work acquires one advisory mission while passive reads and diagnostics remain missionless.
 * @description The Awtsmoos lets the deed awaken memory without letting inspection pretend to be a deed;
 * Awtsmoos.com keeps reads and alias resolution silent, while real writes receive one durable seed.
 */
function config(root) {
	return {
		root,
		repoRoot: process.cwd(),
		allowWrite: true,
		tools: {
			fsRead: true,
			fsWrite: true,
			command: true
		}
	};
}

async function execute(currentConfig, payload) {
	return Actions.executeNormalized(currentConfig, {
		normalized: true,
		full: true,
		...payload
	}, null);
}

const passiveRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-passive-mission-"));
const workRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-auto-mission-"));
const optOutRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-no-mission-"));

try {
	await fs.writeFile(path.join(passiveRoot, "seed.txt"), "B'H passive\n");
	const passiveConfig = config(passiveRoot);
	const passive = await execute(passiveConfig, { action: "read", p: "seed.txt" });
	assert.equal(passive.ok, true);
	assert.equal(Lock.active(passiveConfig), null);
	assert.equal(Actions.missionManaged({ action: "read" }), false);
	assert.equal(Actions.missionManaged({ action: "actionAliasResolver" }), false);

	const workConfig = config(workRoot);
	const first = await execute(workConfig, { action: "mkdirp", p: "first" });
	const firstLock = Lock.active(workConfig);
	assert.equal(first.ok, true, JSON.stringify(first));
	assert.equal(await exists(path.join(workRoot, "first")), true);
	assert.ok(firstLock?.missionId?.startsWith("auto_"));
	assert.equal(first.missionToolReceipt?.missionId, firstLock.missionId);
	assert.equal(first.implicitMissionBoot?.missionId, firstLock.missionId);
	assert.equal(first.implicitMissionBoot?.reason, "substantive_work_auto_mission");

	const second = await execute(workConfig, { action: "mkdirp", p: "second" });
	const secondLock = Lock.active(workConfig);
	assert.equal(second.ok, true, JSON.stringify(second));
	assert.equal(secondLock.missionId, firstLock.missionId);
	assert.equal(second.missionToolReceipt?.missionId, firstLock.missionId);
	assert.equal(await exists(path.join(workRoot, "second")), true);

	const optOutConfig = config(optOutRoot);
	const optOut = await execute(optOutConfig, {
		action: "mkdirp",
		p: "missionless",
		noMission: true
	});
	assert.equal(optOut.ok, true, JSON.stringify(optOut));
	assert.equal(Lock.active(optOutConfig), null);
	assert.equal(await exists(path.join(optOutRoot, "missionless")), true);

	console.log(JSON.stringify({
		ok: true,
		suite: "mission-implicit-auto-boot-default",
		passiveReadBooted: false,
		passiveAliasResolverBooted: false,
		firstMissionId: firstLock.missionId,
		firstDeedReceipted: true,
		bootReasonTruthful: true,
		secondDeedReusedMission: true,
		explicitOptOutWorked: true
	}));
} finally {
	await Promise.all([passiveRoot, workRoot, optOutRoot].map(root =>
		fs.rm(root, { recursive: true, force: true })
	));
}

async function exists(target) {
	try {
		await fs.stat(target);
		return true;
	} catch {
		return false;
	}
}
