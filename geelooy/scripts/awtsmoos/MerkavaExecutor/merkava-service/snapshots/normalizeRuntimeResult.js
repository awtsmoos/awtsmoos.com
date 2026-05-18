// B"H
/**
 * B"H
 * Normalizes RuntimeAssembler output into the simulate_runtime shape.
 *
 * @param {object} raw RuntimeAssembler result.
 * @param {object} options Simulation options.
 * @returns {object} Stable headless report.
 */
function normalizeRuntimeResult(raw = {}, options = {}) {
  const snapshot = raw.result?.snapshot || raw.snapshot || null;
  const win = snapshot?.window || {};
  const errors = []
    .concat(snapshot?.errors || [])
    .concat(win.errors || [])
    .concat(raw.result?.ok === false ? [{ message: raw.result.error, stack: raw.result.stack }] : [])
    .filter(Boolean);

  return {
    BH: "B\"H",
    ok: raw.ok !== false && errors.length === 0,
    runtime: options.runtime || "browser",
    entry: options.entry || "index.html",
    console: raw.console || win.console || snapshot?.logs || [],
    errors,
    stackTraces: errors.map(e => e.stack).filter(Boolean),
    variableSnapshots: win.probes || snapshot?.probes || [],
    domSnapshot: win.document || snapshot?.document || null,
    networkLog: win.network || snapshot?.network || null,
    moduleGraph: raw.assembly?.moduleGraph || null,
    assetGraph: raw.assembly?.html || null,
    runtimeGraph: raw.graph || raw.assembly?.graph || null,
    score: errors.length ? 40 : 100,
    suggestions: errors.length ? ["Inspect stackTraces and add AST probes near the failing line."] : []
  };
}

module.exports = { normalizeRuntimeResult };
