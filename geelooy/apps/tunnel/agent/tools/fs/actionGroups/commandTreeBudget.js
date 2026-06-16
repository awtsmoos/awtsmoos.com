// B"H

const DEFAULT_ACTION_COSTS = Object.freeze({
  read: 0.1,
  list: 0.1,
  tree: 1,
  grep: 0.5,
  bulkSearch: 2,
  write: 0.25,
  command: 2,
  domDomRenderLab: 8,
  virtualDomScreenshot: 8,
  aiAgentSpawnTask: 50,
  aiWorkflowRun: 150
});

/**
 * B"H
 * Chapter: The command tree learned to count its breath before it breathed.
 */
function estimateNode(node = {}) {
  const action = String(node.action || node.name || "note");
  const explicit = Number(node.estimatedPerutas ?? node.cost ?? node.perutas);
  if (Number.isFinite(explicit) && explicit >= 0) return round(explicit);
  const base = DEFAULT_ACTION_COSTS[action] ?? inferCost(action);
  const bytes = Math.max(0, Number(node.maxBytes || node.payload?.maxBytes || node.payload?.maxChars || 0));
  const files = Math.max(0, Number(node.maxFiles || node.payload?.maxFiles || node.payload?.pageSize || 0));
  return round(base + bytes * 0.0000001 + files * fileRate(action));
}

function estimateTree(steps = []) {
  return round(steps.reduce((sum, step) => sum + estimateNode(step), 0));
}

function budgetState(input = {}) {
  const budget = Number(input.budgetPerutas ?? input.budget ?? input.maxPerutas ?? Infinity);
  return { budgetPerutas: Number.isFinite(budget) ? Math.max(0, budget) : null, spentPerutas: 0, estimatedPerutas: 0, skippedPerutas: 0 };
}

function canSpend(state, estimate, required = true) {
  if (state.budgetPerutas === null) return { ok: true, decision: "unbounded" };
  const remaining = state.budgetPerutas - state.spentPerutas;
  if (estimate <= remaining) return { ok: true, decision: "within_budget", remaining };
  return { ok: !required, decision: required ? "over_budget_required" : "over_budget_optional", remaining };
}

function recordSpend(state, estimate, skipped = false) {
  state.estimatedPerutas = round(state.estimatedPerutas + estimate);
  if (skipped) state.skippedPerutas = round(state.skippedPerutas + estimate);
  else state.spentPerutas = round(state.spentPerutas + estimate);
  return state;
}

function inferCost(action = "") {
  if (/command|test|build|lint|typecheck/i.test(action)) return 2;
  if (/chrome|browser|screenshot|render/i.test(action)) return 8;
  if (/search|grep|find/i.test(action)) return 0.5;
  if (/write|delete|move|copy|patch|replace/i.test(action)) return 0.25;
  if (/ai|agent|workflow/i.test(action)) return 50;
  return 0.1;
}

function fileRate(action = "") {
  return /search|grep|find/i.test(action) ? 0.03 : 0.01;
}

function round(n) { return Number(Number(n || 0).toFixed(6)); }

module.exports = { DEFAULT_ACTION_COSTS, budgetState, canSpend, estimateNode, estimateTree, recordSpend, round };
