//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file First-class public room action contract.
 * @description The Awtsmoos lets collaboration begin as collaboration; Awtsmoos.com proves
 * room creation, roster identity, and delegation no longer require an advisory mission prelude.
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMissionActionGroups } = require("../../actionBuilderGroups/missionActions.js");
const FORBIDDEN = ["multipleChoiceSelfInterrogation", "mustCallNext", "mustContinue", "finalAnswerAllowed", "responseFocus"];

function build(config, payload, ws = {}) {
	const buildActions = (nestedConfig, nestedPayload, nestedWs = ws) => build(nestedConfig, nestedPayload, nestedWs);
	return buildMissionActionGroups({ config, payload, ws }, buildActions);
}

async function run(config, action, values = {}) {
	const payload = { action, params: JSON.stringify(values) };
	return build(config, payload)[action]();
}

function assertPlain(result) {
	assert.equal(result.ok, true, JSON.stringify(result));
	for (const key of FORBIDDEN) assert.equal(key in result, false, `forbidden ${key}`);
}

async function main() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "room-first-class-"));
	const config = { root };
	try {
		const created = await run(config, "missionRoomCreate", {
			goal: "prove first-class room actions",
			projectRoot: root,
			roomName: "First Class Room",
			logicalAgentId: "coordinator",
			agentName: "Coordinator",
			role: "coordinator"
		});
		assertPlain(created);
		assert(created.missionId);
		assert(created.roomId);
		assert.equal(created.createdMission, true);
		assert.equal(created.roomStatus.counts.agents, 1);

		const status = await run(config, "missionRoomStatus", { roomId: created.roomId });
		assertPlain(status);
		assert.equal(status.missionId, created.missionId);
		assert.equal(status.roomId, created.roomId);
		assert.equal(status.roomStatus.counts.agents, 1);

		const joined = await run(config, "missionRoomJoin", {
			roomId: created.roomId,
			logicalAgentId: "tester",
			agentName: "Tester",
			role: "proof"
		});
		assertPlain(joined);
		assert.equal(joined.roomStatus.counts.agents, 2);

		const delegated = await run(config, "missionAgentDelegate", {
			roomId: created.roomId,
			logicalAgentId: "auditor",
			agentName: "Auditor",
			role: "audit",
			spawn: false
		});
		assertPlain(delegated);
		assert.equal(delegated.launch.skipped, true);
		assert.equal(delegated.agent.logicalAgentId, "auditor");
		assert.equal(delegated.agent.status, "reserved");
		assert.equal(delegated.roomStatus.counts.agents, 3);

		const stable = await run(config, "missionRoomStatus", { roomId: created.roomId });
		assertPlain(stable);
		assert.equal(stable.missionId, created.missionId);
		assert.equal(stable.roomStatus.counts.agents, 3);

		const invalid = await run(config, "missionRoomCreate", { missionId: "missing-mission", projectRoot: root });
		assert.equal(invalid.ok, false);
		assert.equal(invalid.error, "mission_not_found");

		console.log(JSON.stringify({ ok: true, suite: "mission-room-first-class-actions", missionId: created.missionId, roomId: created.roomId, agents: 3 }, null, 2));
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
