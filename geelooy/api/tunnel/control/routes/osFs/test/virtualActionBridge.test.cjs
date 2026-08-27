// B"H
const assert = require("assert");
const { actions } = require("../../../docs/actions.js");
const { classifyVirtualAction, virtualSurfaceReport, interpretedAction } = require("../virtualActionBridge.js");
const { supportAction } = require("../supportActions.js");

/**
 * B"H
 * Chapter 383: The 397 Names Were Counted At The Hosted Gate.
 *
 * This test proves the Virtual OS no longer drops unknown tunnel verbs into
 * vague smoke. Every documented action has a bridge classification, and common
 * host-only actions become safe reports instead of pretending to execute.
 */
async function run() {
  const surface = virtualSurfaceReport();
  assert.equal(surface.total, actions.length);
  assert.equal(surface.items.length, actions.length);
  assert.equal(actions.every(action => classifyVirtualAction(action).mode), true);
  const host = await supportAction("gitStatusDeep", { action: "gitStatusDeep", path: "home/project" }, async () => ({ ok: true }));
  assert.equal(host.resultType, "virtual-action-bridge");
  assert.equal(host.classification.mode, "host-only-safe-report");
  const diagnostic = await interpretedAction("dependencyBlindSpotScan", { action: "dependencyBlindSpotScan", path: "home/project" }, async next => ({ ok: true, action: next.action, exists: true }));
  assert.equal(diagnostic.classification.mode, "interpreted-diagnostic");
  assert.equal(diagnostic.probe.ok, true);
  console.log(JSON.stringify({ ok: true, total: surface.total, counts: surface.counts, examples: { host: host.classification, diagnostic: diagnostic.classification } }, null, 2));
}
run().catch(error => { console.error(error.stack || error); process.exit(1); });
