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
const Report = require("../tools/fs/mission/assignment/report.js");
const Sessions = require("../tools/fs/mission/agentSessionRegistry.js");
const Status = require("../tools/fs/mission/assignment/status.js");
const Work = require("../tools/fs/mission/workRegistry.js");

/**
 * @file Proves zero-handoff assignment, absolute roots, bounded discovery, and reporting.
 * @description
 * A fresh Shliach can arrive with no mission ID, receive real work, contribute new work,
 * and expose mission/session truth to Tunnel Control without owning the mission itself.
 */
test("empty root creates bounded discovery mission with absolute anchors", async () => {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-assign-empty-"));
	const config = { root };
	try {
		const session = await Sessions.open(config, { agentSessionId: "fresh_empty" });
		const result = await Dispatcher.next(config, session, {});
		assert.equal(result.ok, true);
		assert.equal(result.reason, "created_discovery_mission");
		assert.equal(result.briefing.absolutePaths.every(path.isAbsolute), true);
		assert.equal(result.briefing.projectRoot, path.resolve(root));
		assert.equal(result.briefing.remainingCount, 9);
		assert.equal(result.briefing.remainingWork.every(item => item.origin === "tunnel-auto-discovery"), true);
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});

test("explicit root wins and agent report becomes durable remaining work", async () => {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-assign-root-"));
	const firstRoot = path.join(root, "first");
	const secondRoot = path.join(root, "second");
	fileSystem.mkdirSync(firstRoot);
	fileSystem.mkdirSync(secondRoot);
	const config = { root };
	try {
		const first = await Mission.create(config, {
			id: "mission_first",
			goal: "First mission",
			metadata: { projectRoot: firstRoot }
		});
		const second = await Mission.create(config, {
			id: "mission_second",
			goal: "Second mission",
			metadata: { projectRoot: secondRoot }
		});
		Work.register(first, firstRoot, { idempotencyKey: "first", title: "First work" });
		Work.register(second, secondRoot, { idempotencyKey: "second", title: "Second work" });
		await Mission.save(config, first);
		await Mission.save(config, second);
		const session = await Sessions.open(config, { agentSessionId: "root_agent" });
		const result = await Dispatcher.next(config, session, { projectRoot: secondRoot });
		assert.equal(result.briefing.missionId, second.id);
		assert.equal(result.reason, "matching_absolute_project_root");
		const newPath = path.join(secondRoot, "src", "new.js");
		const report = await Report.record(config, {
			agentSessionId: session.id,
			discoveries: [{ title: "New concrete work", absolutePaths: [newPath] }],
			improvements: ["Improve recovery proof"],
			evidence: "Inspected runtime and found a missing branch"
		});
		assert.equal(report.ok, true);
		const persisted = await Mission.load(config, second.id);
		assert.equal(Work.open(persisted).some(item => item.absolutePaths.includes(newPath)), true);
		assert.equal(persisted.improvementBacklog.some(item => item.title === "Improve recovery proof"), true);
		const snapshot = await Status.snapshot(config);
		const card = snapshot.missions.find(item => item.missionId === second.id);
		assert.equal(card.agentSessions.some(item => item.id === session.id), true);
		assert.equal(path.isAbsolute(card.projectRoot), true);
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});
