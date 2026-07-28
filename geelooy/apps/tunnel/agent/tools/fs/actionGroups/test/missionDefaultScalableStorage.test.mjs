// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fileSystem from "node:fs";
import filePromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMissionActions } = require("../missionActions.js");
const AwdbStore = require("../../mission/awdbStore.js");

delete process.env.AWTSMOOS_MISSION_AWDB;
const root = await filePromises.mkdtemp(path.join(os.tmpdir(), "mission-scalable-default-"));
const config = {
	root,
	metadataRoot: path.join(root, ".metadata")
};

async function action(actionName, payload = {}) {
	return buildMissionActions({
		config,
		payload: {
			action: actionName,
			...payload
		}
	})[actionName]();
}

const startedAt = Date.now();
const start = await action("missionStart", {
	goal: "default scalable storage"
});
for (let index = 0; index < 24; index += 1) {
	const joined = await action("missionRoomJoin", {
		missionId: start.missionId,
		agentId: `agent-${index}`,
		role: index % 2 ? "tester" : "builder"
	});
	assert.equal(joined.ok, true);
}
const status = await action("missionRoomStatus", {
	missionId: start.missionId
});
const documentPath = path.join(
	root,
	`.awtsmoos/missions/${start.missionId}/mission.json`
);

assert.equal(status.roomStatus.counts.agents, 24);
assert.equal(fileSystem.existsSync(documentPath), true);
assert.equal(fileSystem.existsSync(AwdbStore.status(config).file), false);
assert(Date.now() - startedAt < 15_000, "24-agent default storage flow must finish within 15 seconds");

console.log(JSON.stringify({
	ok: true,
	suite: "mission-default-scalable-storage",
	agents: status.roomStatus.counts.agents,
	elapsedMs: Date.now() - startedAt,
	backend: "atomic-per-mission-json"
}, null, 2));
