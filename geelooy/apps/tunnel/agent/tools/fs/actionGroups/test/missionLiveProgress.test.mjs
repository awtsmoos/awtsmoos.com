// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMissionActions } = require("../missionActions.js");
const { buildMissionMetaActions } = require("../missionMetaActions.js");
const AutoState = require("../../mission/autoContinuation/state.js");
const Mission = require("../../mission/index.js");

/**
 * @file Proves missionLiveProgress reveals checkpoint/successor state without becoming another mission mutation.
 * @description The Awtsmoos lets Tunnel Control witness an unfinished mission while Awtsmoos.com leaves mission bytes,
 * heartbeats, leases, and task state untouched; observation sees the successor covenant but never becomes its owner.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-live-progress-"));
const config = { root };
try {
	const start = await action("missionStart", {
		params: JSON.stringify({
			goal: "continue after a stale agent",
			definitionOfDone: ["successor visible"],
			expand: false,
			minimumInnovationWindowMs: 0
		})
	});
	const missionId = start.missionId;
	const task = await action("missionAddTask", {
		params: JSON.stringify({ missionId, title: "finish inherited checkpoint" })
	});
	const missionBefore = await Mission.load(config, missionId);
	const beforeJson = JSON.stringify(missionBefore);
	const fingerprint = "checkpoint_fingerprint";
	const identity = {
		missionId,
		fingerprint,
		websiteMissionId: "website-successor",
		recoveryReason: "stale_agent_unfinished_mission",
		predecessorAgentId: "worker-old",
		predecessorLastSeenAt: "2026-08-11T00:00:00.000Z",
		successorAgentId: "successor-worker-new",
		recoveryCheckpoint: {
			missionId,
			unfinishedTasks: [{ id: task.task.id, title: task.task.title, status: "open" }]
		}
	};
	const acquired = AutoState.acquire(config, identity, {
		owner: "test-coordinator",
		now: Date.now(),
		leaseMs: 60000
	});
	assert.equal(acquired.ok, true);
	const result = await buildMissionMetaActions({
		config,
		payload: { action: "missionLiveProgress", missionId }
	}).missionLiveProgress();
	assert.equal(result.ok, true);
	assert.equal(result.action, "missionLiveProgress");
	assert.equal(result.liveProgress.missionId, missionId);
	assert.equal(result.liveProgress.unfinishedTasks.some(item => item.id === task.task.id), true);
	assert.equal(result.liveProgress.continuation.predecessorAgentId, "worker-old");
	assert.equal(result.liveProgress.continuation.successorAgentId, "successor-worker-new");
	assert.equal(result.liveProgress.recoveryRequired, true);
	const missionAfter = await Mission.load(config, missionId);
	assert.equal(JSON.stringify(missionAfter), beforeJson, "observation must not mutate mission state");
	const active = AutoState.readActive(config, missionId);
	assert.equal(active.leaseOwner, acquired.record.leaseOwner, "observation must not renew or replace lease");
	console.log(JSON.stringify({ ok: true, suite: "mission-live-progress", missionId }));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}

async function action(name, payload) {
	const actions = buildMissionActions({ config, payload: { action: name, ...payload } });
	const result = await actions[name]();
	assert.equal(result.ok, true, `${name} should succeed`);
	return result;
}
