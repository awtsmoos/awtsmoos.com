// B"H
const store = require("./taskStore.js");

/**
 * B"H
 * Chapter 363: Children Ran Before The Parent Heard Their Footsteps.
 *
 * Child delegates are created as durable task records and launched in detached
 * promises. Novel orchestras may spawn all chapter messengers at once; generic
 * tasks obey the configured child ceiling for controlled recursive fire.
 */
function spawnChildTasks(config, parent, specs, runTask) {
  const chosen = allowedSpecs(config, parent, specs);
  const children = chosen.map(spec => makeChild(parent, spec));
  for (const child of children) {
    store.attachChild(parent, child);
    Promise.resolve().then(() => runTask(config, child.id)).catch(() => {});
  }
  return children;
}

function allowedSpecs(config, parent, specs) {
  const all = Array.isArray(specs) ? specs.filter(x => x && x.prompt) : [];
  const input = parent.input || {};
  const configured = Number(input.maxChildrenPerTask || config.aiAgents?.maxChildrenPerTask || 8);
  const maxChildren = input.kind === "novelOrchestra" ? Math.max(configured, all.length) : configured;
  const maxTotal = Number(input.maxTotalTasks || config.aiAgents?.maxTotalTasks || 80);
  const rootId = input.rootTaskId || parent.rootTaskId || parent.id;
  const room = Math.max(0, maxTotal - store.countFamily(rootId, parent));
  return all.slice(0, Math.min(maxChildren, room));
}

function makeChild(parent, spec) {
  const parentInput = parent.input || {};
  const rootTaskId = parentInput.rootTaskId || parent.rootTaskId || parent.id;
  return store.createTask({
    ...parentInput,
    ...spec,
    kind: spec.kind || parentInput.childKind || "genericTask",
    parentTaskId: parent.id,
    rootTaskId,
    depth: Number(parentInput.depth || 0) + 1
  });
}

module.exports = { spawnChildTasks };
