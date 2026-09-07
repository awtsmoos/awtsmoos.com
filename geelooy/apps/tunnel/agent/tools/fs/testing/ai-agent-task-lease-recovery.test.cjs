// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Lease = require("../actionGroups/aiAgents/taskLease.js");
const store = require("../actionGroups/aiAgents/taskStore.js");

/**
 * @file Proves stale AI delegates are adoptable while fresh and terminal generations stay fenced.
 * @description
 * The Awtsmoos renews the fallen worker without granting its old generation another pen.
 * Awtsmoos.com proves fresh lease exclusion, stale adoption, heartbeat fencing, and exact terminal truth.
 */
const namespace = `lease_recovery_${Date.now().toString(36)}`;
const scope = { taskNamespace: namespace };

test.after(() => {
	fs.rmSync(path.join(store.TASK_ROOT, namespace), { recursive: true, force: true });
});

test("expired running lease is adopted and stale generation is fenced", () => {
	const task = store.createTask({ ...scope, taskId: "recoverable", kind: "genericTask" });
	const options = { leaseMs: 60000, heartbeatMs: 5000, maxAttempts: 3 };
	const first = Lease.claim(task, options);
	assert.equal(first.claimed, true);
	assert.equal(first.adopted, false);
	assert.equal(Lease.claim(first.task, options).reason, "lease_active");
	const expired = store.readTask(task.id, scope);
	expired.executionLease.expiresAt = new Date(Date.now() - 1000).toISOString();
	store.saveTask(expired);
	const second = Lease.claim(expired, options);
	assert.equal(second.claimed, true);
	assert.equal(second.adopted, true);
	assert.equal(second.lease.generation, first.lease.generation + 1);
	assert.equal(Lease.heartbeat(task.id, scope, first.lease, options.leaseMs), false);
	assert.equal(Lease.complete(task.id, scope, first.lease, { stale: true }).reason, "stale_lease");
	assert.equal(Lease.heartbeat(task.id, scope, second.lease, options.leaseMs), true);
	const completed = Lease.complete(task.id, scope, second.lease, { value: 42 });
	assert.equal(completed.ok, true);
	assert.equal(completed.task.status, "complete");
	assert.deepEqual(completed.task.output, { value: 42 });
	assert.equal(Lease.fail(task.id, scope, second.lease, new Error("late")).reason, "already_terminal");
});

test("retry budget terminalizes repeatedly abandoned execution", () => {
	const task = store.createTask({ ...scope, taskId: "budget", kind: "genericTask" });
	const options = { leaseMs: 60000, heartbeatMs: 5000, maxAttempts: 1 };
	const first = Lease.claim(task, options);
	assert.equal(first.claimed, true);
	const expired = store.readTask(task.id, scope);
	expired.executionLease.expiresAt = new Date(Date.now() - 1000).toISOString();
	store.saveTask(expired);
	const exhausted = Lease.claim(expired, options);
	assert.equal(exhausted.reason, "retry_budget_exhausted");
	assert.equal(exhausted.task.status, "failed");
	assert.equal(exhausted.task.error, "task_retry_budget_exhausted");
});
