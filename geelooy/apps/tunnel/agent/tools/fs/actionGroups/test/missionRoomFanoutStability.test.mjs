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
const Mission = require("../../mission/index.js");

/**
 * @file Stress-proves unlimited logical invitation fanout with bounded per-call and wake idempotency.
 * @description The Awtsmoos welcomes hundreds of distinct Shluchim without multiplying duplicate testimony;
 * Awtsmoos.com bounds one lock-held batch and coalesces repeated wake nudges before they manufacture room artifacts.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-room-fanout-"));
const config = { root };
try {
	const start = await action("missionStart", {
		goal: "fan out logical agents without physical storms",
		minimumInnovationWindowMs: 0
	});
	const missionId = start.missionId;
	await action("missionRoomCreate", { missionId, roomName: "Fanout Room", projectRoot: root });
	const agents = Array.from({ length: 500 }, (_value, index) => `fanout-${String(index).padStart(3, "0")}`);
	const first = await action("missionRoomInviteAgent", { missionId, agents });
	assert.equal(first.invite.batch, true);
	assert.equal(first.invite.requested, 500);
	assert.equal(first.invite.created, 500);
	assert.equal(first.invite.fanout.openInvites, 500);
	assert.equal(first.invite.fanout.distinctInviteTargets, 500);
	const replay = await action("missionRoomInviteAgent", { missionId, agents });
	assert.equal(replay.invite.created, 0);
	assert.equal(replay.invite.reused, 500);
	assert.equal(replay.invite.fanout.openInvites, 500);
	assert.equal(replay.invite.fanout.inviteAttempts, 1000);
	const duplicates = Array.from({ length: 200 }, () => "fanout-duplicate");
	const duplicateBatch = await action("missionRoomInviteAgent", { missionId, agents: duplicates });
	assert.equal(duplicateBatch.invite.created, 1);
	assert.equal(duplicateBatch.invite.reused, 199);
	assert.equal(duplicateBatch.invite.fanout.distinctInviteTargets, 501);
	const beforeReject = duplicateBatch.invite.fanout.openInvites;
	await assert.rejects(
		() => rawAction("missionRoomInviteAgent", { missionId, agents: Array.from({ length: 501 }, (_v, i) => `too-many-${i}`) }),
		/room_invite_batch_too_large/
	);
	const afterReject = await action("missionRoomStatus", { missionId });
	assert.equal(afterReject.roomStatus.fanout.openInvites, beforeReject);
	const joined = await action("missionRoomJoin", { missionId, agentId: agents[0], role: "worker" });
	assert.equal(joined.roomStatus.fanout.acceptedInvites, 1);
	assert.equal(joined.roomStatus.fanout.openInvites, beforeReject - 1);
	const reinvite = await action("missionRoomInviteAgent", { missionId, toAgent: agents[0] });
	assert.equal(reinvite.invite.joined, true);
	assert.equal(reinvite.roomStatus.fanout.openInvites, beforeReject - 1);
	assert.equal(reinvite.roomStatus.fanout.logicalAdmission, "unlimited_by_default");
	assert.equal(reinvite.roomStatus.fanout.inviteBatchMax, 500);
	assert.equal(reinvite.roomStatus.fanout.physicalExecution, "bounded_by_command_scheduler");
	const wakeOne = await action("missionRoomWakeAgent", {
		missionId,
		agentId: agents[0],
		projectRoot: root,
		wakeKey: "fanout-wake",
		wakeCooldownMs: 60000
	});
	assert.equal(wakeOne.wake.coalesced, false);
	assert.ok(wakeOne.wake.brainstorm);
	const brainstorms = wakeOne.roomStatus.brainstorms.length;
	const wakeTwo = await action("missionRoomWakeAgent", {
		missionId,
		agentId: agents[0],
		projectRoot: root,
		wakeKey: "fanout-wake",
		wakeCooldownMs: 60000
	});
	assert.equal(wakeTwo.wake.coalesced, true);
	assert.equal(wakeTwo.wake.brainstorm, null);
	assert.equal(wakeTwo.roomStatus.brainstorms.length, brainstorms);
	const forced = await action("missionRoomWakeAgent", {
		missionId,
		agentId: agents[0],
		projectRoot: root,
		wakeKey: "fanout-wake",
		wakeCooldownMs: 60000,
		forceWake: true
	});
	assert.equal(forced.wake.coalesced, false);
	assert.equal(forced.roomStatus.brainstorms.length, brainstorms + 1);
	assert.equal(forced.roomStatus.fanout.coalescedWakes, 1);
	assert.equal(forced.roomStatus.fanout.executedWakes, 2);
	const mission = await Mission.load(config, missionId);
	assert.equal(Object.keys(mission.room.agents).length, 1);
	assert.equal(mission.room.invites.filter(item => item.status !== "coalesced").length, 501);
	JSON.stringify(mission);
	console.log(JSON.stringify({ ok: true, missionId, logicalTargets: 501, physicalAgents: 1 }));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}

async function action(name, input) {
	const result = await rawAction(name, input);
	assert.equal(result.ok, true, `${name} should succeed`);
	return result;
}

async function rawAction(name, input) {
	const actions = buildMissionActions({ config, payload: { action: name, params: JSON.stringify(input) } });
	return await actions[name]();
}
