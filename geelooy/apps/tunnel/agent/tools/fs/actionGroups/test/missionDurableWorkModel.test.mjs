// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Mission = require("../../mission/index.js");
const Next = require("../../mission/nextActionRegistry.js");
const Progress = require("../../mission/progressRegistry.js");
const Work = require("../../mission/workRegistry.js");
const Projection = require("../missionContextProjection.js");
const WorkActions = require("../missionWorkActions.js");
const Harness = require("./missionDurableWorkHarness.js");

/**
 * @file Proves durable work consciousness survives replay, verification, persistence, and takeover.
 * @description
 * The Awtsmoos renews every deed yet keeps its truthful thread from state to state;
 * Awtsmoos.com stores remaining work and next action so a fresh Shliach can enter the gate.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	try {
		const mission = await Mission.create(sandbox.config, {
			id: "mission_durable_work",
			goal: "continue without giant handoff",
			metadata: { projectRoot: sandbox.projectRoot }
		});
		const registration = Work.register(mission, sandbox.projectRoot, {
			idempotencyKey: "missing-test",
			title: "Add missing test",
			paths: ["tests/first.test.js"],
			verification: { required: true }
		});
		const replay = Work.register(mission, sandbox.projectRoot, {
			idempotencyKey: "missing-test",
			title: "Add missing test"
		});
		assert.equal(replay.replayed, true);
		assert.equal(mission.remainingWork.length, 1);
		const updated = Work.update(mission, sandbox.projectRoot, {
			id: registration.item.id,
			paths: ["src/fix.js"]
		});
		assert.equal(updated.item.absolutePaths.length, 2);
		assert.equal(updated.item.absolutePaths.every(path.isAbsolute), true);
		assert.equal(Work.complete(mission, sandbox.projectRoot, {
			id: registration.item.id
		}).reason, "verification_required");
		const completed = Work.complete(mission, sandbox.projectRoot, {
			id: registration.item.id,
			verification: { status: "passed", evidenceIds: ["evidence_test_pass"] }
		});
		assert.equal(completed.item.state, "verified");
		Work.register(mission, sandbox.projectRoot, {
			idempotencyKey: "deployment-proof",
			title: "Verify deployment",
			paths: ["deploy/proof.md"]
		});
		const firstNext = Next.set(mission, sandbox.projectRoot, {
			idempotencyKey: "next-test",
			logicalAgentId: "agent-a",
			action: "runTests"
		});
		const replayedNext = Next.set(mission, sandbox.projectRoot, {
			idempotencyKey: "next-test",
			logicalAgentId: "agent-a",
			action: "runTests"
		});
		assert.equal(replayedNext.replayed, true);
		assert.equal(replayedNext.item.state, "active");
		const secondNext = Next.set(mission, sandbox.projectRoot, {
			idempotencyKey: "next-deploy",
			logicalAgentId: "agent-a",
			action: "deploy"
		});
		assert.equal(mission.nextActions.find(item => item.id === firstNext.item.id).state, "superseded");
		assert.equal(secondNext.item.state, "active");
		const eventA = Progress.register(mission, sandbox.projectRoot, {
			idempotencyKey: "same-key",
			type: "test_passed"
		});
		const eventB = Progress.register(mission, sandbox.projectRoot, {
			idempotencyKey: "same-key",
			type: "deployment_started"
		});
		assert.notEqual(eventA.event.id, eventB.event.id);
		await Mission.save(sandbox.config, mission);
		const reloaded = await Mission.load(sandbox.config, mission.id);
		assert.equal(Work.open(reloaded).length, 1);
		assert.equal(Next.active(reloaded).length, 1);
		const context = Projection.project(reloaded, {
			Mission,
			Collaboration: Harness.collaborationApi(),
			projectRoot: sandbox.projectRoot
		});
		assert.equal(context.remainingWork[0].title, "Verify deployment");
		assert.equal(context.nextActions[0].action, "deploy");
		const actions = WorkActions.buildMissionWorkActions({
			config: sandbox.config,
			payload: { missionId: mission.id }
		});
		assert.equal(typeof actions.missionWorkDiscover, "function");
		assert.equal(typeof actions.missionNextActionSet, "function");
		console.log(JSON.stringify({ ok: true, suite: "mission-durable-work-model" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
