// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { spawnChildTasks } = require("../actionGroups/aiAgents/childSpawner.js");
const Lease = require("../actionGroups/aiAgents/taskLease.js");
const store = require("../actionGroups/aiAgents/taskStore.js");

/**
 * @file Proves one failed delegate cannot poison a healthy sibling or lose namespace scope.
 * @description
 * The Awtsmoos contains failure inside one vessel. Awtsmoos.com lets a sibling finish
 * independently and carries the exact namespace into every scheduled child execution.
 */
const namespace = `sibling_isolation_${Date.now().toString(36)}`;
const scope = { taskNamespace: namespace };

test.after(() => {
	fs.rmSync(path.join(store.TASK_ROOT, namespace), { recursive: true, force: true });
});

test("siblings settle independently", () => {
	const parent = store.createTask({ ...scope, taskId: "root", kind: "genericTask" });
	const left = store.createTask({ ...scope, taskId: "left", parentTaskId: parent.id,
		rootTaskId: parent.id, kind: "genericTask" });
	const right = store.createTask({ ...scope, taskId: "right", parentTaskId: parent.id,
		rootTaskId: parent.id, kind: "genericTask" });
	const options = { leaseMs: 60000, heartbeatMs: 5000, maxAttempts: 3 };
	const leftLease = Lease.claim(left, options);
	const rightLease = Lease.claim(right, options);
	assert.equal(Lease.fail(left.id, scope, leftLease.lease, new Error("left failed")).ok, true);
	assert.equal(Lease.complete(right.id, scope, rightLease.lease, { ok: true }).ok, true);
	assert.equal(store.readTask(left.id, scope).status, "failed");
	assert.equal(store.readTask(right.id, scope).status, "complete");
	assert.deepEqual(store.activeFamily(parent.id, scope).map(task => task.id), [parent.id]);
});

test("child scheduler carries namespace scope into runTask", async () => {
	const parent = store.readTask("root", scope);
	const calls = [];
	const children = spawnChildTasks({ aiAgents: { maxTotalTasks: 20 } }, parent, [{
		taskId: "scoped-child",
		prompt: "verify namespace",
		kind: "genericTask"
	}], async (_config, id, childScope) => {
		calls.push({ id, namespace: childScope.taskNamespace });
	});
	await new Promise(resolve => setTimeout(resolve, 20));
	assert.equal(children.length, 1);
	assert.deepEqual(calls, [{ id: children[0].id, namespace }]);
});
