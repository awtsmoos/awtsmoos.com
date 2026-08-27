//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { AgentStateStore } from "../AgentStateStore.mjs";
import { MasterAgentOrchestrator } from "../MasterAgentOrchestrator.mjs";
import { UnfinishedWorkScanner } from "../UnfinishedWorkScanner.mjs";

test("state persists mappings and identifies duplicate prepared sends", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-agent-state-"));
	try {
		const storagePath = path.join(root, "private", "agents.json");
		const first = new AgentStateStore({ storagePath, clock: () => 10 });
		first.upsertAgent("tester", { conversationKey: "opaque-local-key" });
		const intent = first.recordIntent({ agentId: "tester", prompt: "prove it" });
		const duplicate = first.recordIntent({ agentId: "tester", prompt: "prove it" });
		const second = new AgentStateStore({ storagePath, clock: () => 20 });
		assert.equal(intent.newlyPrepared, true);
		assert.equal(duplicate.newlyPrepared, false);
		assert.equal(second.getAgent("tester").conversationKey, "opaque-local-key");
		assert.equal(fs.statSync(storagePath).mode & 0o777, 0o600);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("scanner reveals stale and explicitly unfinished agents", () => {
	const scanner = new UnfinishedWorkScanner();
	const work = scanner.scan({
		now: 500,
		staleAfterMs: 100,
		agents: [{ logicalAgentId: "a", heartbeat: 1, unfinishedWork: ["finish tests"] }]
	});
	assert(work.some(entry => entry.source === "agent-report"));
	assert(work.some(entry => entry.source === "stale-agent"));
});

test("master sends a new intent once and deduplicates accepted evidence", async () => {
	const fixture = createFixture();
	try {
		const assignment = basicAssignment(fixture.root);
		const first = await fixture.orchestrator.assign("worker", assignment);
		const second = await fixture.orchestrator.assign("worker", assignment);
		assert.equal(fixture.sends(), 1);
		assert.equal(first.conversationKey, "BH_DIRECT_STABLE");
		assert.equal(second.conversationKey, "BH_DIRECT_STABLE");
		assert.equal(second.deduplicated, true);
	} finally {
		fixture.cleanup();
	}
});

test("master blocks a pre-existing uncertain prepared intent", async () => {
	const fixture = createFixture();
	try {
		const assignment = basicAssignment(fixture.root);
		const prompt = fixture.orchestrator.promptBuilder.build(assignment);
		fixture.stateStore.recordIntent({ agentId: "worker", prompt });
		await assert.rejects(
			() => fixture.orchestrator.assign("worker", assignment),
			error => error.code === "uncertain_prepared_intent"
		);
		assert.equal(fixture.sends(), 0);
	} finally {
		fixture.cleanup();
	}
});

function createFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-master-"));
	const stateStore = new AgentStateStore({ storagePath: path.join(root, "agents.json") });
	let sendCount = 0;
	const orchestrator = new MasterAgentOrchestrator({
		stateStore,
		room: { announcePlan: async () => {} },
		directService: {
			send: async () => {
				sendCount += 1;
				return { conversationKey: "BH_DIRECT_STABLE", sameConversation: false, status: 200, done: true };
			}
		}
	});
	return {
		root,
		stateStore,
		orchestrator,
		sends: () => sendCount,
		cleanup: () => fs.rmSync(root, { recursive: true, force: true })
	};
}

function basicAssignment(root) {
	return { projectRoot: root, role: "worker", objective: "finish", roomId: "room" };
}
