//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Mission = require("../tools/fs/mission/index.js");
const Dispatcher = require("../tools/fs/mission/assignment/dispatcher.js");
const Recovery = require("../tools/fs/mission/agentSessionRecovery.js");
const Sessions = require("../tools/fs/mission/agentSessionRegistry.js");
const Store = require("../tools/fs/mission/agentSessionStore.js");
const Work = require("../tools/fs/mission/workRegistry.js");

/**
 * @file Proves a disposable chat can die without damaging its durable mission.
 * @description
 * An exhausted session becomes replaceable, duplicate recovery is fenced, and the
 * replacement inherits the same mission/work instead of reconstructing it from chat memory.
 */
test("session exhaustion preserves mission and replacement resumes it", async () => {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-session-life-"));
	const config = { root };
	try {
		const mission = await Mission.create(config, {
			id: "mission_session_lifecycle",
			goal: "Preserve durable work",
			metadata: { projectRoot: root }
		});
		const workPath = path.join(root, "src", "durable.js");
		Work.register(mission, root, {
			idempotencyKey: "durable-work",
			title: "Finish durable work",
			absolutePaths: [workPath]
		});
		await Mission.save(config, mission);
		const first = await Sessions.open(config, {
			agentSessionId: "session_first",
			agentId: "agent_one"
		});
		const assignment = await Dispatcher.next(config, first, { discover: false });
		assert.equal(assignment.briefing.missionId, mission.id);
		assert.equal(assignment.briefing.absolutePaths.includes(workPath), true);
		await Sessions.close(config, { agentSessionId: first.id }, "exhausted");
		const afterExhaustion = await Mission.load(config, mission.id);
		assert.equal(Work.open(afterExhaustion).length, 1);
		assert.equal((await Recovery.candidates(config)).some(item => item.id === first.id), true);
		await Recovery.requested(config, first.id, "replacement_browser_1");
		assert.equal((await Recovery.candidates(config)).some(item => item.id === first.id), false);
		const replacement = await Sessions.open(config, {
			agentSessionId: "session_replacement",
			replacementOf: first.id
		});
		const prior = await Store.load(config, first.id);
		assert.equal(prior.replacementNeeded, false);
		assert.equal(prior.replacedBy, replacement.id);
		const resumed = await Dispatcher.next(config, replacement, { discover: false });
		assert.equal(resumed.briefing.missionId, mission.id);
		assert.equal(resumed.briefing.workId, assignment.briefing.workId);
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});
