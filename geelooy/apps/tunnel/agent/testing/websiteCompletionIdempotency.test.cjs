// B"H
// Boruch Hashem
// Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves website completion is idempotent end to end through the message stage.
 * @description The Awtsmoos never lets a repeated completion double-write the room.
 * Awtsmoos.com proves the same completion input twice (with no stable reportId) yields
 * duplicate:true with identical milestones and no second room write or finalize, and that
 * crash-recovery resumes after the persisted event without rewriting the room.
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-completion-idem-"));
process.env.AWTSMOOS_PRIVATE_STATE_ROOT = path.join(root, "private");

const Context = require("../tools/fs/actionGroups/websiteAgents/runner/context.js");
require("../tools/fs/actionGroups/websiteAgents/runner/event.js");
const WebsiteStore = require("../tools/fs/actionGroups/websiteAgents/store.js");
const CompletionReceipts = require("../tools/fs/actionGroups/websiteCompletionReceipts.js");
const CompletionReceiptStore = require("../tools/fs/actionGroups/websiteAgents/runner/completionReceiptStore.js");

const counters = { roomWrites: 0, missionSaves: 0, finalizes: 0, emits: 0, schedules: 0 };

Context.shared.M = {
	load: async (_config, _missionId) => ({ id: "collab_1", room: { messages: [] } }),
	save: async (_config, _mission) => { counters.missionSaves += 1; },
	roomMessage: (_mission, _routed) => {
		counters.roomWrites += 1;
		return { message: { id: `msg_${counters.roomWrites}` }, interrupt: null };
	},
	roomUserMessage: (_mission, _routed) => {
		counters.roomWrites += 1;
		return { message: { id: `msg_${counters.roomWrites}` }, interrupt: null };
	}
};

Context.register("failure", (code, details) => ({ ok: false, error: code, ...(details || {}) }));
Context.register("finalize", async (_config, id) => {
	counters.finalizes += 1;
	return WebsiteStore.read(id);
});
Context.register("schedule", () => { counters.schedules += 1; });
Context.register("emitRoom", () => { counters.emits += 1; });

const message = require("../tools/fs/actionGroups/websiteAgents/runner/message.js");

const config = { root };
const WEBSITE_MISSION_ID = "web_completion_1";

WebsiteStore.create({
	id: WEBSITE_MISSION_ID,
	missionId: "collab_1",
	goal: "idempotent completion test",
	plan: { agents: [{ id: "agent-7", name: "Seven", role: "tester" }] }
});

function completionInput(overrides = {}) {
	return {
		websiteMissionId: WEBSITE_MISSION_ID,
		agentId: "agent-7",
		kind: "completion",
		complete: true,
		body: "All work finished. Nothing remains.",
		...overrides
	};
}

const FULL_MILESTONES = {
	accepted: true,
	eventPersisted: true,
	completionTransitionPersisted: true,
	deliveryAcknowledged: true
};

test("first completion runs every step and names every milestone", async () => {
	const before = { ...counters };
	const result = await message(config, completionInput());
	assert.equal(result.ok, true);
	assert.equal(result.duplicate, false);
	assert.equal(result.action, "websiteAgentMissionMessage");
	assert.equal(result.websiteMissionId, WEBSITE_MISSION_ID);
	assert.deepEqual(result.milestones, FULL_MILESTONES);
	assert.equal(result.delivery.dashboard, "committed");
	assert.equal(result.delivery.websiteAgents, "lifecycle_committed");
	assert.equal(counters.roomWrites, before.roomWrites + 1);
	assert.equal(counters.missionSaves, before.missionSaves + 1);
	assert.equal(counters.finalizes, before.finalizes + 1);
	assert.equal(counters.emits, before.emits + 1);
	const stored = CompletionReceiptStore.load("completion:mission:web_completion_1:completion");
	assert.equal(stored.complete, true);
	assert.deepEqual({ ...CompletionReceipts.emptyMilestones(), ...stored.milestones }, FULL_MILESTONES);
});

test("same completion input twice is a duplicate with identical milestones", async () => {
	const before = { ...counters };
	const first = await message(config, completionInput());
	const second = await message(config, completionInput());
	assert.equal(second.ok, true);
	assert.equal(second.duplicate, true);
	assert.deepEqual(second.milestones, FULL_MILESTONES);
	assert.deepEqual(second.milestones, first.milestones);
	assert.equal(second.delivery.dashboard, "committed");
	assert.equal(second.delivery.websiteAgents, "lifecycle_committed");
	assert.deepEqual({ ...counters }, before);
});

test("crash recovery after eventPersisted never double-writes the room", async () => {
	const key = "completion:mission:web_completion_1:completion";
	CompletionReceiptStore.remove(key);
	CompletionReceiptStore.save(key, {
		requestKey: key,
		missionId: WEBSITE_MISSION_ID,
		kind: "completion",
		createdAt: new Date().toISOString(),
		eventRef: { messageId: "msg_recovered" },
		milestones: {
			accepted: true,
			eventPersisted: true,
			completionTransitionPersisted: false,
			deliveryAcknowledged: false
		}
	});
	const before = { ...counters };
	const result = await message(config, completionInput({ body: "Retry after crash." }));
	assert.equal(result.ok, true);
	assert.equal(result.duplicate, false);
	assert.deepEqual(result.milestones, FULL_MILESTONES);
	assert.equal(counters.roomWrites, before.roomWrites);
	assert.equal(counters.missionSaves, before.missionSaves);
	assert.equal(counters.finalizes, before.finalizes + 1);
	assert.equal(counters.emits, before.emits + 1);
	const after = { ...counters };
	const replay = await message(config, completionInput({ body: "Retry after crash." }));
	assert.equal(replay.duplicate, true);
	assert.deepEqual(replay.milestones, FULL_MILESTONES);
	assert.deepEqual({ ...counters }, after);
});

test("non-completion messages keep the direct path", async () => {
	const before = { ...counters };
	const result = await message(config, {
		websiteMissionId: WEBSITE_MISSION_ID,
		agentId: "agent-7",
		kind: "message",
		body: "Status update, not a completion."
	});
	assert.equal(result.ok, true);
	assert.equal(result.duplicate, false);
	assert.equal(result.milestones, undefined);
	assert.equal(counters.roomWrites, before.roomWrites + 1);
	assert.equal(counters.finalizes, before.finalizes);
});
