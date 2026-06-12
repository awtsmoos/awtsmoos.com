// B"H
const { capabilityReport } = require("./capabilities/index.js");

/** B"H: shapes node-dom output like the existing Merkava runtime response. */
function makeResult({ options, runtime, errors, interactionLog, values, hydration }) {
  const snapshot = runtime.snapshot();
  const allErrors = [...errors, ...(runtime.errors || []), ...(runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ || [])];
  return {
    ok: allErrors.length === 0,
    action: "simulateRuntime",
    engine: "node-dom",
    score: allErrors.length ? 50 : 100,
    entry: options.entry,
    errors: allErrors,
    console: snapshot.window?.console || snapshot.console || runtime.window.console?.toJSON?.() || [],
    interactionLog,
    values,
    hydration,
    domSnapshot: snapshot.window?.document ? snapshot.window : { documentElement: runtime.window.document.documentElement.toJSON() },
    snapshot,
    capabilities: capabilityReport(),
    virtualEnv: options.virtualEnv
  };
}

module.exports = { makeResult };
