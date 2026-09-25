// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("../tools/fs/actionGroups/asyncTaskLifecycle.js");

/**
 * @file Proves async tasks carry durable lifecycle milestones and named crash boundaries.
 * @description The Awtsmoos distinguishes a deed that never began from one that began and
 * vanished. Awtsmoos.com proves milestones persist in order, never-started tasks fail before
 * execution, disappeared tasks are interrupted-ambiguous, and side-effect testimony survives.
 */

test("milestones record in order and stamp lifecycle timestamps", () => {
	let task = { taskId: "t1", status: "created" };
	task = Lifecycle.recordMilestone(task, "created");
	task = Lifecycle.recordMilestone(task, "accepted");
	task = Lifecycle.recordMilestone(task, "started", { pid: 123 });
	assert.deepEqual(task.lifecycle.map(entry => entry.milestone), ["created", "accepted", "started"]);
	assert.ok(task.acceptedAt);
	assert.ok(task.startedAt);
	assert.equal(task.lifecycle[2].detail.pid, 123);
	assert.ok(Date.parse(task.lifecycle[0].at));
});

test("unknown milestone names are rejected, not silently stored", () => {
	assert.throws(() => Lifecycle.recordMilestone({}, "vaporized"), /unknown_lifecycle_milestone/);
});

test("never started task fails before execution", () => {
	const crash = Lifecycle.classifyCrash({ taskId: "t2", status: "accepted" }, false);
	assert.equal(crash.boundary, "never_started");
	assert.equal(crash.failedBeforeExecution, true);
	assert.equal(crash.interruptedAmbiguous, false);
});

test("started then disappeared task is interrupted ambiguous", () => {
	const crash = Lifecycle.classifyCrash(
		{ taskId: "t3", status: "running", startedAt: "2026-09-18T17:00:00.000Z", pid: 99999 },
		false
	);
	assert.equal(crash.boundary, "started_then_disappeared");
	assert.equal(crash.interruptedAmbiguous, true);
	assert.equal(crash.failedBeforeExecution, false);
});

test("live process keeps a running boundary, verified or not", () => {
	const verified = Lifecycle.classifyCrash(
		{ taskId: "t4", status: "running", startedAt: "2026-09-18T17:00:00.000Z", pid: 1, processIdentityVerified: true },
		true
	);
	assert.equal(verified.boundary, "running_verified");
	const unverified = Lifecycle.classifyCrash(
		{ taskId: "t5", status: "running", startedAt: "2026-09-18T17:00:00.000Z", pid: 1 },
		true
	);
	assert.equal(unverified.boundary, "running_unverified");
});

test("terminal tasks keep their completed or failed boundary", () => {
	assert.equal(Lifecycle.classifyCrash({ status: "succeeded", completedAt: "2026-09-18T17:01:00.000Z" }).boundary, "completed");
	assert.equal(Lifecycle.classifyCrash({ status: "failed", error: "boom" }).boundary, "failed");
});

test("side-effect testimony names what the task touched", () => {
	const effects = Lifecycle.sideEffectsOf({
		writtenPaths: ["a/b.txt", "c/d.txt"],
		command: "npm test"
	});
	assert.deepEqual(effects, [
		{ kind: "file_written", target: "a/b.txt" },
		{ kind: "file_written", target: "c/d.txt" },
		{ kind: "command_executed", target: "npm test" }
	]);
	const explicit = Lifecycle.sideEffectsOf({ sideEffects: [{ kind: "api_called", target: "https://x" }] });
	assert.deepEqual(explicit, [{ kind: "api_called", target: "https://x" }]);
});

test("summarize exposes the durable lifecycle for reconciliation", () => {
	let task = { taskId: "t6", status: "running" };
	task = Lifecycle.recordMilestone(task, "created");
	task = Lifecycle.recordMilestone(task, "started");
	const summary = Lifecycle.summarize(task);
	assert.equal(summary.taskId, "t6");
	assert.deepEqual(summary.milestones, ["created", "started"]);
	assert.equal(summary.milestoneCount, 2);
	assert.equal(summary.lastMilestone.milestone, "started");
});
