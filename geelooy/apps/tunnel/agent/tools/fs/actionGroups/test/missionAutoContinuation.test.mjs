// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Auto = require("../../mission/autoContinuation/index.js");
const Eligibility = require("../../mission/autoContinuation/eligibility.js");
const Prompt = require("../../mission/autoContinuation/prompt.js");
const State = require("../../mission/autoContinuation/state.js");
const Planner = require("../websiteAgents/planner.js");
const Harness = require("./missionAutoContinuationHarness.js");

/**
 * @file Proves unfinished mission continuation is leased, custody-aware, and browser-idempotent.
 * @description
 * The Awtsmoos lets one silent checkpoint call one declared successor, never a phantom guest;
 * Awtsmoos.com preserves project, task lease, plan, and website identity through the recovery test.
 */
const originalAuthority = process.env.AWTSMOOS_PROJECT_ROOT;
delete process.env.AWTSMOOS_PROJECT_ROOT;
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-auto-continuation-"));
const config = { root };
const now = Date.now();
const oldAt = new Date(now - 10 * 60 * 1000).toISOString();
const mission = {
	id: "mission_continue_test",
	goal: "finish the existing mission",
	room: { id: "room_continue_test" }
};
const custody = Harness.attachRecoverableWork(mission, oldAt);
const lock = {
	missionId: mission.id,
	startedAt: oldAt,
	updatedAt: new Date(now).toISOString(),
	lastAction: "missionBootResume",
	lastMustCallNext: { action: "missionStepExecute", payload: { step: 7 } },
	filesTouched: ["alpha.js"],
	testsRun: 3
};

try {
	const planDir = path.join(root, "geelooy", "ai", "thoughts", "verification");
	fs.mkdirSync(planDir, { recursive: true });
	fs.writeFileSync(path.join(planDir, "140_CONTINUE.md"), "B\"H\ncontinue\n");
	const fingerprint = Prompt.fingerprint(config, mission, lock);
	assert.equal(fingerprint, Prompt.fingerprint(config, mission, lock));
	const prompt = Prompt.build(config, mission, lock, fingerprint);
	for (const value of [root, mission.id, "missionStepExecute", "140_CONTINUE.md"]) {
		assert.equal(prompt.includes(value), true, value);
	}
	assert.equal(Planner.plan(config, { continuationOnly: true, agentCount: 99 }).agentCount, 1);
	assert.equal(Planner.plan(config, { agentCount: 1 }).agentCount, 3);
	assert.equal(Eligibility.decide({ mission, lock, now, taskLease: custody.taskLease }).eligible, true);
	assert.equal(Eligibility.decide({ mission: { ...mission, completed: true }, lock, now, taskLease: custody.taskLease }).eligible, false);
	const firstLease = State.acquire(config, { missionId: mission.id, fingerprint, websiteMissionId: "web_a" }, { owner: "owner_a", now });
	const secondLease = State.acquire(config, { missionId: mission.id, fingerprint, websiteMissionId: "web_a" }, { owner: "owner_b", now });
	assert.equal(firstLease.ok, true);
	assert.equal(secondLease.ok, false);
	assert.equal(secondLease.reason, "continuation_lease_held");
	const fake = Harness.fakeDependencies(mission, lock, Eligibility);
	const first = await Auto.run(config, { now, deps: fake.deps, owner: "coordinator" });
	const second = await Auto.run(config, { now: now + 1, deps: fake.deps, owner: "coordinator" });
	assert.equal(first.scheduled, true);
	assert.equal(first.reason, "continuation_scheduled");
	assert.equal(second.scheduled, false);
	assert.equal(fake.dispatchCount(), 1);
	fake.setWebsite({ id: first.websiteMissionId, createdAt: oldAt });
	const recovered = await Auto.run(config, { now: now + 2, deps: fake.deps });
	assert.equal(recovered.reason, "existing_dispatch_recovered");
	assert.equal(fake.dispatchCount(), 1);
	const candidateLock = {
		active() {
			throw new Error("candidate_touched_mission");
		}
	};
	const candidate = await Auto.run(config, {
		env: { AWTSMOOS_REGISTRATION_MODE: "candidate-probe" },
		deps: { Lock: candidateLock }
	});
	assert.equal(candidate.reason, "candidate_probe_suppressed");
	console.log(JSON.stringify({ ok: true, suite: "mission-auto-continuation", fingerprint, dispatches: 1 }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
	if (originalAuthority === undefined) {
		delete process.env.AWTSMOOS_PROJECT_ROOT;
	} else {
		process.env.AWTSMOOS_PROJECT_ROOT = originalAuthority;
	}
}
