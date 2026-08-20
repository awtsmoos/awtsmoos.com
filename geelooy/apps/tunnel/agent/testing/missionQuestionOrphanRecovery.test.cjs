// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mission = require("../tools/fs/mission/index.js");
const Lock = require("../tools/fs/mission/lock/index.js");
const Watchdog = require("../tools/fs/mission/watchdog/index.js");

/**
 * @file Proves an unrecoverable legacy question cannot hold filesystem authority forever.
 * @description
 * The Awtsmoos preserves the unanswered wound without letting it become an eternal chain;
 * Awtsmoos.com marks the orphan, revokes only write authority, and leaves the mission for repair again.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-question-orphan-"));
	const previousPrivate = process.env.AWTSMOOS_PRIVATE_STATE_ROOT;
	const previousAwdb = process.env.AWTSMOOS_MISSION_AWDB;
	process.env.AWTSMOOS_PRIVATE_STATE_ROOT = path.join(root, "private");
	process.env.AWTSMOOS_MISSION_AWDB = "0";
	const config = { root, repoRoot: process.cwd(), tunnelName: "awt-question-orphan" };
	try {
		const mission = await Mission.create(config, { goal: "orphan question", minimumInnovationWindowMs: 0 });
		await Mission.save(config, mission);
		Lock.start(config, { action: "missionStart", missionId: mission.id }, { autoSeedNext8: false });
		const lock = Lock.get(config);
		lock.blockedOn = { action: "missionAnswer", questionId: "missing-question" };
		lock.lastMustCallNext = { action: "missionAnswer", missionId: mission.id, questionId: "missing-question" };
		Lock.set(config, lock);
		const result = await Watchdog.recover(config);
		assert.equal(result.ok, false);
		assert.equal(result.error, "question_payload_missing");
		assert.equal(result.questionOrphaned, true);
		assert.equal(result.filesystemAuthorityRevoked, true);
		assert.equal(result.nextSuggestedToolCall.action, "missionGet");
		assert.equal(Lock.active(config), null);
		assert.equal(Lock.get(config).releaseStatus, "revoked");
		assert.equal(Lock.get(config).revocation.reason, "question_payload_missing");
		assert.equal((await Mission.load(config, mission.id)).id, mission.id);
		console.log(JSON.stringify({ ok: true, suite: "mission-question-orphan-recovery", missionId: mission.id }, null, 2));
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
