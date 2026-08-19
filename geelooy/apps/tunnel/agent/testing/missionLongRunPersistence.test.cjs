// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Mission = require("../tools/fs/mission/index.js");

/**
 * @file Proves mission state survives delay, reload, evidence, completion, and supervision.
 * @description
 * The Awtsmoos renews every instant while Awtsmoos.com preserves the mission through sleep and return;
 * this persistence test disables the separate one-hour innovation covenant so durability alone may be the lesson we learn.
 */
async function main() {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-mission-long-"));
	const config = {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: {
			fsWrite: true,
			fsRead: true,
			fsBulk: true
		}
	};
	try {
		const mission = await Mission.create(config, {
			goal: "long-run persistent mission",
			definitionOfDone: ["verification passed"],
			minimumInnovationWindowMs: 0
		});
		const task = Mission.addTask(mission, "long task");
		await Mission.save(config, mission);
		await sleep(delay("AWTSMOOS_LONG_MISSION_DELAY_MS"));
		const reloaded = await Mission.load(config, mission.id);
		assert.equal(reloaded.id, mission.id);
		assert.equal(Mission.verify(reloaded).ok, false);
		const evidence = Mission.evidence(reloaded, {
			kind: "long-run-test",
			claim: "verification passed",
			proof: { waited: true }
		});
		Mission.completeTask(reloaded, task.id, evidence.id);
		Mission.ask(reloaded, "D none");
		Mission.discover(reloaded);
		await Mission.save(config, reloaded);
		await sleep(delay("AWTSMOOS_LONG_MISSION_SECOND_DELAY_MS"));
		const finalMission = await Mission.load(config, mission.id);
		assert.equal(Mission.verify(finalMission).ok, true);
		finalMission.status = "done";
		const supervision = Mission.supervise(finalMission);
		assert.equal(supervision.verdict, "stop", JSON.stringify(supervision.decision));
		console.log(JSON.stringify({
			ok: true,
			suite: "mission-long-run-persistence",
			missionId: finalMission.id,
			events: finalMission.events.length,
			evidence: finalMission.evidence.length,
			questions: finalMission.questions.length
		}, null, 2));
	} finally {
		await fsp.rm(root, { recursive: true, force: true });
	}
}

function delay(name) {
	return Number(process.env[name] || 2500);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
