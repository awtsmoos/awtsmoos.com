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
const Claims = require("../tools/fs/mission/assignment/claims.js");
const Sessions = require("../tools/fs/mission/agentSessionRegistry.js");
const Work = require("../tools/fs/mission/workRegistry.js");

/**
 * @file Proves exclusive durable work borrowing across concurrent disposable chats.
 * @description
 * New sessions cannot share one node; exhausted sessions preserve custody for one
 * replacement, while a cleanly ended chat releases its unfinished claim for reuse.
 */
function fixture() {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-claims-"));
	return { root, config: { root } };
}

async function seeded(config, root, count = 2) {
	const mission = await Mission.create(config, {
		id: "mission_claims",
		goal: "Claim work",
		metadata: { projectRoot: root }
	});
	for (let index = 0; index < count; index += 1) {
		Work.register(mission, root, {
			idempotencyKey: `work-${index}`,
			title: `Work ${index}`
		});
	}
	await Mission.save(config, mission);
	return mission;
}

test("concurrent newborn sessions receive different exclusive work", async () => {
	const { root, config } = fixture();
	try {
		const mission = await seeded(config, root, 2);
		const first = await Sessions.open(config, { agentSessionId: "claim_first" });
		const second = await Sessions.open(config, { agentSessionId: "claim_second" });
		const [left, right] = await Promise.all([
			Dispatcher.next(config, first, { missionId: mission.id }),
			Dispatcher.next(config, second, { missionId: mission.id })
		]);
		assert.ok(left.briefing.workId);
		assert.ok(right.briefing.workId);
		assert.notEqual(left.briefing.workId, right.briefing.workId);
		const persisted = await Mission.load(config, mission.id);
		assert.equal(Claims.available(persisted, {}).length, 0);
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});

test("replacement inherits exhausted claim and clean end releases it", async () => {
	const { root, config } = fixture();
	try {
		const mission = await seeded(config, root, 1);
		const first = await Sessions.open(config, { agentSessionId: "claim_old" });
		const assigned = await Dispatcher.next(config, first, { missionId: mission.id });
		const workId = assigned.briefing.workId;
		await Sessions.close(config, { agentSessionId: first.id }, "exhausted");
		let persisted = await Mission.load(config, mission.id);
		assert.equal(persisted.remainingWork[0].claim.sessionId, first.id);
		const replacement = await Sessions.open(config, {
			agentSessionId: "claim_new",
			replacementOf: first.id,
			missionId: mission.id
		});
		const resumed = await Dispatcher.next(config, replacement, { missionId: mission.id });
		assert.equal(resumed.briefing.workId, workId);
		persisted = await Mission.load(config, mission.id);
		assert.equal(persisted.remainingWork[0].claim.sessionId, replacement.id);
		assert.equal(persisted.remainingWork[0].claim.inheritedFrom, first.id);
		await Sessions.close(config, { agentSessionId: replacement.id }, "ended");
		persisted = await Mission.load(config, mission.id);
		assert.equal(persisted.remainingWork[0].claim, null);
		assert.equal(Claims.available(persisted, {}).length, 1);
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});
