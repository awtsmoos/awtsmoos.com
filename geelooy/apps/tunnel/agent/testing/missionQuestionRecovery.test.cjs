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
 * @file Proves a legacy skeletal watchdog gate can recover the original durable A-E question.
 * @description
 * The Awtsmoos keeps the question in mission history even when an old lock forgets its letters;
 * Awtsmoos.com rebuilds only from durable evidence, never by inventing choices for its betters.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-question-recovery-"));
	const privateRoot = path.join(root, "private");
	const previousPrivate = process.env.AWTSMOOS_PRIVATE_STATE_ROOT;
	const previousAwdb = process.env.AWTSMOOS_MISSION_AWDB;
	process.env.AWTSMOOS_PRIVATE_STATE_ROOT = privateRoot;
	process.env.AWTSMOOS_MISSION_AWDB = "0";
	const config = { root, repoRoot: process.cwd(), tunnelName: "awt-question-recovery" };
	try {
		const mission = await Mission.create(config, { goal: "question recovery", minimumInnovationWindowMs: 0 });
		const asked = Mission.ask(mission);
		assert.ok(asked.question.id);
		assert.ok(Array.isArray(asked.question.choices));
		assert.ok(asked.question.choices.length > 1);
		await Mission.save(config, mission);
		Lock.start(config, {
			action: "missionStart",
			missionId: mission.id,
			multipleChoiceSelfInterrogation: asked.question,
			mustCallNext: { action: "missionAnswer", missionId: mission.id, questionId: asked.question.id }
		}, { autoSeedNext8: false });
		const lock = Lock.get(config);
		delete lock.blockedOn.question;
		lock.lastMustCallNext = { action: "missionAnswer", missionId: mission.id, questionId: asked.question.id };
		Lock.set(config, lock);
		mission.questions = [];
		await Mission.save(config, mission);
		const recovered = await Watchdog.recover(config);
		assert.equal(recovered.ok, true);
		assert.equal(recovered.questionRecovered, true);
		assert.equal(recovered.multipleChoiceSelfInterrogation.id, asked.question.id);
		assert.deepEqual(recovered.multipleChoiceSelfInterrogation.choices, asked.question.choices);
		assert.equal(recovered.nextSuggestedToolCall.action, "missionAnswer");
		console.log(JSON.stringify({ ok: true, suite: "mission-question-recovery", questionId: asked.question.id }, null, 2));
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
