//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actionGroups/asyncTaskActions.js");
const Lifecycle = require("../tools/fs/actionGroups/asyncTaskLifecycle.js");
const Reconcile = require("../tools/fs/actionGroups/asyncTaskReconcile.js");
const Store = require("../tools/fs/actionGroups/asyncTaskStore.js");

/**
 * @file Proves reconcile names every crash boundary and persists the lifecycle trail.
 * @description The Awtsmoos distinguishes a deed that never began from one that began and
 * vanished. Awtsmoos.com seals never-started tasks as failed-before-execution, keeps the legacy
 * missing-process error string while adding the boundary vocabulary, carries side-effect
 * testimony through the seal, and persists created/started/heartbeat/succeeded milestones.
 */

function withMockedStore(fn) {
	const originalWrite = Store.write;
	let persisted = null;
	Store.write = (_config, _taskId, task) => {
		persisted = task;
		return task;
	};
	try {
		return { result: fn(), persisted };
	} finally {
		Store.write = originalWrite;
	}
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

test("never-started task fails before execution with a named boundary", () => {
	const { result, persisted } = withMockedStore(() =>
		Reconcile.reconcile({}, "task_never", { status: "running", stdout: "" }, null));
	assert.equal(result.status, "failed");
	assert.equal(result.error, "async_task_never_started");
	assert.equal(result.reconciliation.state, "process_missing_after_restart");
	assert.equal(result.reconciliation.boundary, "never_started");
	assert.equal(result.reconciliation.failedBeforeExecution, true);
	assert.equal(result.reconciliation.interruptedAmbiguous, false);
	assert.ok(result.lifecycle.some(entry => entry.milestone === "failed"));
	assert.equal(persisted.status, "failed");
	assert.ok(Array.isArray(persisted.lifecycle));
});

test("disappeared task keeps the legacy error string and gains boundary plus side-effect testimony", () => {
	const { result } = withMockedStore(() =>
		Reconcile.reconcile({}, "task_gone", {
			status: "running",
			pid: 2147483647,
			stdout: "",
			writtenPaths: ["a/b.txt", "c/d.txt"],
			command: "node worker.js"
		}, null));
	assert.equal(result.status, "failed");
	assert.equal(result.error, "async_task_process_missing_after_restart");
	assert.equal(result.reconciliation.state, "process_missing_after_restart");
	assert.equal(result.reconciliation.boundary, "started_then_disappeared");
	assert.equal(result.reconciliation.interruptedAmbiguous, true);
	assert.equal(result.reconciliation.failedBeforeExecution, false);
	assert.deepEqual(result.reconciliation.sideEffectTestimony, [
		{ kind: "file_written", target: "a/b.txt" },
		{ kind: "file_written", target: "c/d.txt" },
		{ kind: "command_executed", target: "node worker.js" }
	]);
	assert.ok(result.lifecycle.some(entry => entry.milestone === "interrupted"));
});

test("live process keeps a running boundary, verified or not", () => {
	const verified = Reconcile.reconcile({}, "task_live_verified", {
		status: "running",
		pid: process.pid,
		processIdentityVerified: true,
		stdout: ""
	}, null);
	assert.equal(verified.status, "running_unverified");
	assert.equal(verified.reconciliation.state, "pid_alive_identity_unverified");
	assert.equal(verified.reconciliation.boundary, "running_verified");
	const unverified = Reconcile.reconcile({}, "task_live_unverified", {
		status: "running",
		pid: process.pid,
		stdout: ""
	}, null);
	assert.equal(unverified.status, "running_unverified");
	assert.equal(unverified.reconciliation.boundary, "running_unverified");
	assert.equal(unverified.reconciliation.interruptedAmbiguous, false);
});

test("terminal output recovered after restart seals with a completed boundary", () => {
	const { result } = withMockedStore(() =>
		Reconcile.reconcile({}, "task_recovered", {
			status: "running",
			pid: 2147483647,
			stdout: JSON.stringify({ ok: true, value: 1 })
		}, null));
	assert.equal(result.status, "completed");
	assert.equal(result.reconciliation.state, "terminal_output_recovered_after_restart");
	assert.equal(result.reconciliation.boundary, "completed");
	assert.ok(result.lifecycle.some(entry => entry.milestone === "succeeded"));
});

test("lifecycle milestones persist from created through heartbeat to succeeded", async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-async-lifecycle-"));
	const config = { allowCommands: true, deviceStateRoot: path.join(base, "device-state"), root: base };
	try {
		const started = await Actions.start(config, {
			command: process.execPath,
			args: ["-e", "setTimeout(()=>process.stdout.write('BH lifecycle'),1500)"],
			timeoutMs: 15000
		});
		assert.equal(started.ok, true);
		const taskId = started.taskId;
		let seen = null;
		for (let attempt = 0; attempt < 60 && !seen; attempt++) {
			const current = Actions.status({ taskId }, config);
			if (current.status === "running") seen = current;
			else await sleep(25);
		}
		assert.ok(seen, "expected to observe the task running");
		assert.ok(seen.lifecycle.milestones.includes("created"));
		assert.ok(seen.lifecycle.milestones.includes("started"));
		assert.ok(seen.lifecycle.milestones.includes("heartbeat"));
		for (let attempt = 0; attempt < 120; attempt++) {
			const stored = Store.read(config, taskId);
			if (stored && stored.status !== "running") break;
			await sleep(25);
		}
		const persisted = Store.read(config, taskId);
		assert.equal(persisted.status, "completed");
		const milestones = persisted.lifecycle.map(entry => entry.milestone);
		assert.deepEqual(milestones.slice(0, 2), ["created", "started"]);
		assert.ok(milestones.includes("heartbeat"));
		assert.equal(milestones[milestones.length - 1], "succeeded");
		const final = Actions.status({ taskId }, config);
		assert.ok(final.lifecycle.milestoneCount >= 4);
		assert.equal(final.lifecycle.taskId, taskId);
		Actions.TASKS.delete(taskId);
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
});

test("classifyCrash never guesses: terminal tasks keep their boundary", () => {
	const crash = Lifecycle.classifyCrash({ status: "failed", error: "boom" }, false);
	assert.equal(crash.boundary, "failed");
	assert.equal(crash.failedBeforeExecution, false);
});
