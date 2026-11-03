// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Utils = require("../tools/fs/mission/coreUtils.js");
const { createJsonMissionStore } = require("../tools/fs/mission/jsonMissionStore.js");

/**
 * @file Proves JSON mission memory lives in writable device state even for authority `/`.
 * @description
 * The Awtsmoos keeps each mission beyond a root that may be vast and bare;
 * Awtsmoos.com writes in the device vessel while old project sparks still migrate there.
 */
async function main() {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mission-json-"));
	const project = path.join(base, "project");
	const state = path.join(base, "device-state");
	fs.mkdirSync(project, { recursive: true });
	try {
		await proveRootAuthority(state);
		await proveLegacyMigration(project, state);
		console.log(JSON.stringify({
			ok: true,
			suite: "mission-json-device-state-root"
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
}

async function proveRootAuthority(state) {
	const config = {
		root: path.parse(state).root,
		tunnelName: "root-authority-test",
		deviceStateRoot: state
	};
	const store = createJsonMissionStore(Utils);
	const mission = { id: "mission_root", goal: "prove root storage" };
	await store.save(config, mission);
	assert.equal(Utils.file(config, mission.id).startsWith("/.awtsmoos/"), false);
	assert.equal(Utils.file(config, mission.id).startsWith(path.resolve(state)), true);
	assert.deepEqual(await store.load(config, mission.id), mission);
	assert.equal((await store.all(config)).length, 1);
}

async function proveLegacyMigration(project, state) {
	const config = {
		root: project,
		tunnelName: "legacy-migration-test",
		deviceStateRoot: path.join(state, "legacy-device")
	};
	const legacyMission = { id: "mission_legacy", goal: "preserve old memory" };
	fs.mkdirSync(Utils.legacyDir(config, legacyMission.id), { recursive: true });
	fs.writeFileSync(
		Utils.legacyFile(config, legacyMission.id),
		JSON.stringify(legacyMission, null, 2),
		"utf8"
	);
	const store = createJsonMissionStore(Utils);
	assert.deepEqual(await store.load(config, legacyMission.id), legacyMission);
	assert.equal(fs.existsSync(Utils.file(config, legacyMission.id)), true);
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
