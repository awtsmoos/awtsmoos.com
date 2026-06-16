// B"H
const crypto = require("crypto");
const { budgetState, canSpend, estimateNode, estimateTree, recordSpend, round } = require("./commandTreeBudget.js");
const visualize = require("./commandTreeVisualize.js");

const SAVED = new Map();

/**
 * B"H
 * Chapter: The scattered commands gathered into one living tree.
 */
function buildCommandTreeActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const normalize = () => normalizeTree(payload);
  return {
    async commandTreeValidate() { return explain(normalize(), "commandTreeValidate"); },
    async commandTreeExplain() { return explain(normalize(), "commandTreeExplain"); },
    async commandTreeDryRun() { return dryRun(normalize(), "commandTreeDryRun"); },
    async commandTreeRun() { return runTree(normalize(), config, ws, buildActions, "commandTreeRun"); },
    async commandTreeResume() { return resumeTree(payload, config, ws, buildActions); },
    async commandTreeReplay() { return replayTree(payload, config, ws, buildActions); },
    async commandTreeVisualize() { const tree = normalize(); return { ok: true, action: "commandTreeVisualize", tree, mermaid: visualize.mermaid(tree), html: visualize.html(tree) }; },
    async commandTreeSave() { const tree = normalize(); SAVED.set(tree.treeId, tree); return { ok: true, action: "commandTreeSave", treeId: tree.treeId, tree }; },
    async commandTreeLoad() { const tree = SAVED.get(payload.treeId || payload.id); return tree ? { ok: true, action: "commandTreeLoad", tree } : { ok: false, action: "commandTreeLoad", error: "tree_not_found" }; },
    async commandTreeStatus() { const tree = SAVED.get(payload.treeId || payload.id); return tree ? { ok: true, action: "commandTreeStatus", treeId: tree.treeId, status: tree.status || "saved", nodes: tree.nodes || [] } : { ok: false, action: "commandTreeStatus", error: "tree_not_found" }; },
    async commandTreeCancel() { const id = payload.treeId || payload.id; const tree = SAVED.get(id); if (tree) tree.status = "cancelled"; return { ok: true, action: "commandTreeCancel", treeId: id, cancelled: !!tree }; },
    async awtsmoosCommandTree() { return runTree(normalize(), config, ws, buildActions, "awtsmoosCommandTree"); },
    async merkavaCommandTree() { return runTree(normalize(), config, ws, buildActions, "merkavaCommandTree"); }
  };
}

function normalizeTree(input = {}) {
  const parsedTree = parseMaybe(input.tree || input.workflow, null);
  const tree = Array.isArray(parsedTree) ? { steps: parsedTree } : parsedTree && typeof parsedTree === "object" ? parsedTree : input;
  const rawSteps = tree.steps ?? tree.nodes ?? tree.actions ?? input.steps ?? input.nodes ?? input.actions ?? [];
  const steps = normalizeSteps(rawSteps);
  const treeId = tree.treeId || tree.id || input.treeId || input.id || `tree_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
  return { treeId, title: tree.title || input.title || "Awtsmoos Command Tree", goal: tree.goal || input.goal || input.prompt || "", vars: { ...(tree.vars || {}), ...(input.vars || {}) }, budgetPerutas: tree.budgetPerutas ?? input.budgetPerutas ?? input.budget ?? null, nodes: steps.map((step, i) => normalizeNode(step, i)) };
}

function normalizeSteps(value) {
  const parsed = parseMaybe(value, value);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return Object.values(parsed);
  return [];
}

function normalizeNode(node = {}, index = 0) {
  const id = String(node.id || node.name || `step_${index + 1}`);
  const payload = { ...(node.payload || node.params || {}) };
  const action = node.action || payload.action || node.type || "configGet";
  payload.action = action;
  return { ...node, id, parentId: node.parentId || node.after || null, action, payload, required: node.required !== false, optional: node.optional === true, status: "planned", estimatedPerutas: estimateNode({ ...node, action, payload }) };
}

function explain(tree, action) {
  const warnings = [];
  if (!tree.nodes.length) warnings.push("Tree has no nodes.");
  const duplicateIds = duplicates(tree.nodes.map(n => n.id));
  duplicateIds.forEach(id => warnings.push(`Duplicate node id: ${id}`));
  return { ok: warnings.length === 0, action, tree: annotateTree(tree), estimatedPerutas: estimateTree(tree.nodes), warnings, mermaid: visualize.mermaid(tree) };
}

function dryRun(tree, action) {
  const budget = budgetState(tree);
  const nodes = tree.nodes.map(node => {
    const estimate = estimateNode(node);
    const decision = canSpend(budget, estimate, node.required && !node.optional);
    const skip = !decision.ok || decision.decision === "over_budget_optional";
    recordSpend(budget, estimate, skip);
    return { ...node, status: skip ? "would_skip" : "would_run", estimatedPerutas: estimate, budgetDecision: decision.decision, budgetRemaining: budget.budgetPerutas === null ? null : round(budget.budgetPerutas - budget.spentPerutas) };
  });
  const out = { ...tree, nodes };
  return { ok: true, action, tree: out, budget, estimatedPerutas: estimateTree(nodes), mermaid: visualize.mermaid(out), html: visualize.html(out) };
}

async function runTree(tree, config, ws, buildActions, action = "commandTreeRun") {
  const budget = budgetState(tree);
  const context = { vars: { ...tree.vars }, steps: {} };
  const nodes = [];
  const startedAt = new Date().toISOString();
  for (const node of tree.nodes) {
    const estimate = estimateNode(node);
    const decision = canSpend(budget, estimate, node.required && !node.optional);
    const budgetSkip = !decision.ok || decision.decision === "over_budget_optional";
    const conditionOk = conditionPasses(node, context);
    const runnable = !budgetSkip && conditionOk;
    if (!runnable) {
      recordSpend(budget, estimate, true);
      const skipped = { ...node, status: "skipped", estimatedPerutas: estimate, budgetDecision: decision.decision, reason: budgetSkip ? decision.decision : "condition_false" };
      nodes.push(skipped); context.steps[node.id] = skipped; continue;
    }
    recordSpend(budget, estimate, false);
    const payload = resolveTemplates(node.payload, context);
    const result = await executeNode(payload, config, ws, buildActions, node.id);
    const status = result?.ok === false ? "failed" : "ok";
    const done = { ...node, payload, status, estimatedPerutas: estimate, actualPerutas: estimate, budgetDecision: decision.decision, outputRef: result?.outputRef || null, resultRef: result?.resultRef || result?.ephemeral?.resultRef || null, resultSummary: summarize(result), result };
    nodes.push(done); context.steps[node.id] = done;
    context.vars[node.id] = result;
    if (status === "failed" && node.continueOnError !== true) break;
  }
  const finishedAt = new Date().toISOString();
  const finalTree = { ...tree, status: nodes.some(n => n.status === "failed") ? "failed" : "ok", startedAt, finishedAt, nodes };
  SAVED.set(finalTree.treeId, finalTree);
  return { ok: finalTree.status === "ok", action, treeId: finalTree.treeId, tree: finalTree, budget, mermaid: visualize.mermaid(finalTree), html: visualize.html(finalTree) };
}

async function executeNode(payload, config, ws, buildActions, nodeId) {
  const actions = buildActions(config, { ...payload, parentNodeId: nodeId }, ws);
  const fn = actions[payload.action];
  if (!fn) return { ok: false, error: "unknown_node_action", action: payload.action };
  try { return await fn(); } catch (error) { return { ok: false, error: error.message, stack: error.stack, action: payload.action }; }
}

async function resumeTree(payload, config, ws, buildActions) {
  const tree = SAVED.get(payload.treeId || payload.id);
  if (!tree) return { ok: false, action: "commandTreeResume", error: "tree_not_found" };
  const remaining = { ...tree, nodes: (tree.nodes || []).filter(n => !["ok", "skipped"].includes(n.status)) };
  return runTree(remaining, config, ws, buildActions, "commandTreeResume");
}

async function replayTree(payload, config, ws, buildActions) {
  const tree = payload.tree ? normalizeTree(payload.tree) : SAVED.get(payload.treeId || payload.id);
  if (!tree) return { ok: false, action: "commandTreeReplay", error: "tree_not_found" };
  const replay = { ...tree, treeId: `replay_${tree.treeId}_${Date.now().toString(36)}`, nodes: (tree.nodes || []).map((n, i) => normalizeNode({ ...n, status: "planned" }, i)) };
  return payload.dryRun === true || payload.dryRun === "true" ? dryRun(replay, "commandTreeReplay") : runTree(replay, config, ws, buildActions, "commandTreeReplay");
}

function conditionPasses(node, context) {
  if (node.requiresOk) { const prev = context.steps[node.requiresOk]; if (!prev || prev.status !== "ok") return false; }
  if (node.if !== undefined && !truthy(resolveTemplates(node.if, context))) return false;
  if (node.unless !== undefined && truthy(resolveTemplates(node.unless, context))) return false;
  return true;
}

function resolveTemplates(value, context) {
  if (typeof value === "string") return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => String(getPath(context, expr.trim()) ?? ""));
  if (Array.isArray(value)) return value.map(item => resolveTemplates(item, context));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveTemplates(v, context)]));
  return value;
}

function getPath(root, expr) { return expr.split(".").reduce((box, key) => box == null ? undefined : box[key], root); }
function truthy(value) { return ![false, "false", "0", 0, "", null, undefined].includes(value); }
function parseMaybe(value, fallback) { if (typeof value !== "string") return value ?? fallback; try { return JSON.parse(value); } catch (_) { return fallback; } }
function duplicates(items) { const seen = new Set(), dup = new Set(); for (const item of items) seen.has(item) ? dup.add(item) : seen.add(item); return [...dup]; }
function annotateTree(tree) { return { ...tree, nodes: tree.nodes.map(node => ({ ...node, estimatedPerutas: estimateNode(node) })) }; }
function summarize(result) { if (!result || typeof result !== "object") return result; return Object.fromEntries(Object.entries(result).filter(([k]) => ["ok", "action", "path", "bytes", "count", "returnedCount", "returnedResults", "error", "outputRef", "resultRef"].includes(k)).slice(0, 20)); }

module.exports = { buildCommandTreeActions, normalizeTree, dryRun, explain, runTree, resolveTemplates, conditionPasses };
