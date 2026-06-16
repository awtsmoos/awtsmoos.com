// B"H
const assert = require("assert");
const { buildActions } = require("../actions.js");
const { normalizeTree, resolveTemplates } = require("../actionGroups/commandTreeActions.js");

const config = { root: process.cwd(), allowSecrets: true, allowWrite: false, allowCommands: false, tools: { fsRead: true, fsList: true, fsTree: true, fsWrite: false, command: false } };
const treePayload = {
  action: "commandTreeRun",
  title: "BHY Tree Test",
  vars: { target: "geelooy/api/tunnel/control/docs/actions.js" },
  budgetPerutas: 5,
  steps: [
    { id: "cfg", action: "configGet", payload: { action: "configGet" }, estimatedPerutas: 0.1 },
    { id: "readDocs", action: "read", requiresOk: "cfg", payload: { action: "read", path: "{{vars.target}}", maxChars: 120 }, estimatedPerutas: 0.1 },
    { id: "expensive", action: "aiWorkflowRun", optional: true, payload: { action: "configGet" }, estimatedPerutas: 999 }
  ]
};

(async () => {
  const normalized = normalizeTree(treePayload);
  assert.strictEqual(normalized.nodes.length, 3);
  assert.strictEqual(resolveTemplates("A {{vars.target}}", { vars: treePayload.vars, steps: {} }).includes("actions.js"), true);
  const actions = buildActions(config, treePayload, null);
  const dry = await actions.commandTreeDryRun();
  assert.strictEqual(dry.ok, true);
  assert(dry.html.includes("CommandTree"));
  const got = await actions.commandTreeRun();
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.tree.nodes[0].status, "ok");
  assert.strictEqual(got.tree.nodes[1].status, "ok");
  assert.strictEqual(got.tree.nodes[2].status, "skipped");
  assert(got.mermaid.includes("flowchart"));
  const load = await buildActions(config, { action: "commandTreeLoad", treeId: got.treeId }, null).commandTreeLoad();
  assert.strictEqual(load.ok, true);
  const replayDry = await buildActions(config, { action: "commandTreeReplay", treeId: got.treeId, dryRun: true }, null).commandTreeReplay();
  assert.strictEqual(replayDry.ok, true);
  console.log("BHY command tree core tests passed");
})().catch(error => { console.error(error); process.exit(1); });
