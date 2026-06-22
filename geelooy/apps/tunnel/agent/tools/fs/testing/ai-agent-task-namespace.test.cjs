// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const store = require("../actionGroups/aiAgents/taskStore.js");

const suffix = Date.now().toString(36);
const nsA = `test_mitzvah_world_${suffix}`;
const nsB = `test_ohr_hagnuz_${suffix}`;
const rootA = { projectRoot: "/work/MitzvahWorld", tunnelName: "awt-test", logicalAgentId: "mitzvah-agent", taskNamespace: nsA };
const rootB = { projectRoot: "/work/ohr-hagnuz", tunnelName: "awt-test", logicalAgentId: "hud-agent", taskNamespace: nsB };

try {
  const a = store.createTask({ ...rootA, kind: "genericTask", title: "Read Mitzvah World" });
  const b = store.createTask({ ...rootB, kind: "genericTask", title: "Inspect HudRenderer" });
  const sameA = store.createTask({ ...rootA, kind: "genericTask", taskId: "shared-task", parentTaskId: "shared-parent", rootTaskId: "shared-root", title: "Shared id A" });
  const sameB = store.createTask({ ...rootB, kind: "genericTask", taskId: "shared-task", parentTaskId: "shared-parent", rootTaskId: "shared-root", title: "Shared id B" });

  assert.equal(store.taskNamespace(rootA), nsA);
  assert.equal(store.taskNamespace(rootB), nsB);
  assert.equal(store.readTask(a.id, rootA).id, a.id);
  assert.equal(store.readTask(a.id, rootB), null);
  assert.equal(store.readTask(b.id, rootA), null);
  assert.equal(store.readTask(b.id, rootB).id, b.id);
  assert.equal(store.readTask("shared-task", rootA).input.title, "Shared id A");
  assert.equal(store.readTask("shared-task", rootB).input.title, "Shared id B");
  assert.deepEqual(store.childrenOf("shared-parent", rootA).map(task => task.input.title), ["Shared id A"]);
  assert.deepEqual(store.childrenOf("shared-parent", rootB).map(task => task.input.title), ["Shared id B"]);
  assert.deepEqual(store.family("shared-root", rootA).map(task => task.input.title), ["Shared id A"]);
  assert.deepEqual(store.family("shared-root", rootB).map(task => task.input.title), ["Shared id B"]);

  const listA = store.listTasks(10, rootA).map(task => task.id);
  const listB = store.listTasks(10, rootB).map(task => task.id);
  assert.deepEqual(new Set(listA), new Set([a.id, sameA.id]));
  assert.deepEqual(new Set(listB), new Set([b.id, sameB.id]));

  console.log(JSON.stringify({ ok: true, nsA, nsB }, null, 2));
} finally {
  for (const ns of [nsA, nsB]) fs.rmSync(path.join(store.TASK_ROOT, ns), { recursive: true, force: true });
}
