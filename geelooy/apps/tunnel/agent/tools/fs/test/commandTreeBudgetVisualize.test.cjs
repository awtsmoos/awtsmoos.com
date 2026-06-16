// B"H
const assert = require("assert");
const { budgetState, canSpend, estimateNode, estimateTree, recordSpend } = require("../actionGroups/commandTreeBudget.js");
const { mermaid, html } = require("../actionGroups/commandTreeVisualize.js");

const cheap = { id: "cheap", action: "read", estimatedPerutas: 0.25 };
const costly = { id: "costly", action: "aiWorkflowRun", estimatedPerutas: 50, optional: true };
assert.strictEqual(estimateNode(cheap), 0.25);
assert.strictEqual(estimateTree([cheap, costly]), 50.25);
const state = budgetState({ budgetPerutas: 1 });
const ok = canSpend(state, estimateNode(cheap), true);
assert.strictEqual(ok.ok, true);
recordSpend(state, estimateNode(cheap), false);
const denied = canSpend(state, estimateNode(costly), false);
assert.strictEqual(denied.ok, true);
assert.strictEqual(denied.decision, "over_budget_optional");
recordSpend(state, estimateNode(costly), true);
assert(state.skippedPerutas >= 50);
const tree = { title: "Budget Tree", nodes: [{ ...cheap, status: "ok" }, { ...costly, status: "skipped", budgetDecision: "over_budget_optional" }] };
assert(mermaid(tree).includes("flowchart TD"));
assert(html(tree).includes("Budget Tree"));
console.log("BHY command tree budget/visualize tests passed");
