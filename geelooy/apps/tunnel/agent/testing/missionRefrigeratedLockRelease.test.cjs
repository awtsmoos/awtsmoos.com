// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mission = require("../tools/fs/mission/index.js");
const Lock = require("../tools/fs/mission/lock/index.js");
const Discover = require("../tools/fs/mission/activeGuard/discover.js");
const ProjectRoots = require("../tools/fs/mission/projectRootRegistry.js");

/**
 * @file Proves refrigeration preserves mission history while revoking filesystem authority.
 * @description
 * The Awtsmoos lets a mission sleep without leaving its hand around the root;
 * Awtsmoos.com fences stale authority and lets a later thaw grow a fresh generation shoot.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-refrigerated-lock-"));
	const privateRoot = path.join(root, "private");
	const previousPrivate = process.env.AWTSMOOS_PRIVATE_STATE_ROOT;
	const previousAwdb = process.env.AWTSMOOS_MISSION_AWDB;
	process.env.AWTSMOOS_PRIVATE_STATE_ROOT = privateRoot;
	process.env.AWTSMOOS_MISSION_AWDB = "0";
	const config = { root, repoRoot: process.cwd(), tunnelName: "awt-refrigeration-test" };
	try {
		const mission = await Mission.create(config, { goal: "refrigeration authority test", minimumInnovationWindowMs: 0 });
		await Mission.save(config, mission);
		const first = Lock.start(config, { action: "missionStart", missionId: mission.id }, { autoSeedNext8: false });
		assert.equal(Lock.active(config).missionId, mission.id);
		const state = { id: "cold-state", createdAt: new Date().toISOString(), reason: "test" };
		mission.refrigeratedStates.push(state);
		await Mission.save(config, mission);
		const blockers = await Discover.find(config, {});
		assert.deepEqual(blockers, []);
		assert.equal(Lock.active(config), null);
		assert.equal(Lock.get(config).releaseStatus, "revoked");
		assert.equal(Lock.get(config).revocation.reason, "mission_refrigerated");
		assert.equal(ProjectRoots.read(config), null);
		mission.thawHistory.push({ stateId: state.id, at: new Date(Date.now() + 10).toISOString() });
		await Mission.save(config, mission);
		const thawed = Lock.after(config, { action: "missionThaw", missionId: mission.id }, { ok: true, action: "missionThaw", missionId: mission.id });
		assert.equal(thawed.releaseAllowed, false);
		assert.notEqual(thawed.authorityGeneration, first.authorityGeneration);
		assert.equal(ProjectRoots.read(config).missionId, mission.id);
		console.log(JSON.stringify({ ok: true, suite: "mission-refrigerated-lock-release", missionId: mission.id }, null, 2));
	} finally {
		restore("AWTSMOOS_PRIVATE_STATE_ROOT", previousPrivate);
		restore("AWTSMOOS_MISSION_AWDB", previousAwdb);
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function restore(name, value) {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

main().catch(error => { console.error(error); process.exit(1); });
