// B"H
const path = require("path");
const { readWhole } = require("./listRead.js");
const { textSearch } = require("./textSearch.js");
const { dependencyGraph } = require("./graph.js");
const { astOutline } = require("./astTools.js");
const { applyPatch } = require("./patchOps.js");

function loadMerkavaService() {
  return require(path.join(__dirname, "../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service"));
}

async function testMatrix($i, userId, payload, dispatch) {
  const cases = payload.cases || payload.tests || [
    { name: "node", action: "simulateRuntime", runtime: "node", entry: payload.entry || "index.js", files64: payload.files64 },
    { name: "browser", action: "simulateRuntime", runtime: "browser", entry: payload.htmlEntry || "index.html", files64: payload.files64 }
  ];
  const results = [];
  for (const item of cases.slice(0, Number(payload.maxCases || 20))) {
    const result = await dispatch({ ...item, action: item.action || "simulateRuntime" });
    results.push({ name: item.name || item.action, ok: result?.ok !== false, result });
    if (payload.stopOnFail && result?.ok === false) break;
  }
  return { ok: results.every(r => r.ok), action: "testMatrix", count: results.length, results };
}

async function bundleTrace($i, userId, payload) {
  const graph = await dependencyGraph($i, userId, { ...payload, path: payload.path || payload.entry || payload.p });
  return { ok: graph.ok !== false, action: "bundleTrace", entry: payload.path || payload.entry || payload.p, graph, unresolved: graph.unresolved || [], files: graph.files || graph.nodes || [] };
}

async function dependencyCycleCheck($i, userId, payload) {
  const graph = await dependencyGraph($i, userId, { ...payload, path: payload.path || payload.entry || payload.p });
  const edges = graph.edges || graph.graph?.edges || [];
  const cycles = findCycles(edges);
  return { ok: cycles.length === 0, action: "dependencyCycleCheck", cycles, edgeCount: edges.length, graph };
}

async function deadExportScan($i, userId, payload) {
  const outline = await astOutline($i, userId, payload);
  const text = (await readWhole($i, userId, payload.path || payload.p)).content || "";
  const exports = (outline.exports || []).map(x => String(x.name || "").split(/\s+as\s+/).pop().trim()).filter(Boolean);
  const dead = exports.filter(name => countWord(text, name) <= 1);
  return { ok: true, action: "deadExportScan", path: payload.path || payload.p, exports, dead, note: "single-file heuristic; use bundleTrace/dependencyGraph for project-wide certainty" };
}

async function mutationPatchTest($i, userId, payload, dispatch) {
  const before = payload.path ? await readWhole($i, userId, payload.path) : null;
  let patchResult = null, testResult = null;
  if (payload.patches) patchResult = await applyPatch($i, userId, payload);
  if (payload.test || payload.testAction) testResult = await dispatch({ ...(payload.test || payload.testAction) });
  return { ok: (patchResult?.ok !== false) && (testResult?.ok !== false), action: "mutationPatchTest", patchResult, testResult, beforeHashHint: before?.sha256 || null };
}

async function browserReplay($i, userId, payload) {
  const service = loadMerkavaService();
  const result = await service.simulateRuntime({ runtime: "browser", entry: payload.entry || payload.path || "index.html", files: payload.files || decode64(payload.files64, {}), interactions: payload.interactions || decode64(payload.interactions64, []), probes: payload.probes || [] });
  return { ...result, action: "browserReplay" };
}

async function apiContractCheck($i, userId, payload) {
  const p = payload.path || payload.p || "openapi.yaml";
  const got = await readWhole($i, userId, p);
  const text = got.content || "";
  const checks = {
    hasOpenapi: /openapi\s*:\s*['"]?3\./i.test(text),
    hasPaths: /\npaths\s*:/i.test(text),
    hasOperationIds: /operationId\s*:/i.test(text),
    noPostIfGetOnly: payload.getOnly ? !/\n\s*post\s*:/i.test(text) : true
  };
  return { ok: Object.values(checks).every(Boolean), action: "apiContractCheck", path: p, checks };
}

async function perfBudgetCheck($i, userId, payload, dispatch) {
  const started = Date.now();
  const result = payload.test ? await dispatch(payload.test) : await dispatch({ action: "simulateRuntime", runtime: payload.runtime || "node", entry: payload.entry || "index.js", files64: payload.files64 });
  const durationMs = Date.now() - started;
  const budgetMs = Number(payload.budgetMs || 5000);
  return { ok: result?.ok !== false && durationMs <= budgetMs, action: "perfBudgetCheck", durationMs, budgetMs, result };
}

function decode64(value, fallback) { try { return value ? JSON.parse(Buffer.from(String(value), "base64").toString("utf8")) : fallback; } catch { return fallback; } }
function countWord(text, word) { return (text.match(new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g")) || []).length; }
function findCycles(edges) {
  const graph = new Map();
  for (const e of edges) { const from = e.from || e.source || e[0], to = e.to || e.target || e[1]; if (!from || !to) continue; if (!graph.has(from)) graph.set(from, []); graph.get(from).push(to); }
  const cycles = [], stack = [], seen = new Set(), active = new Set();
  function dfs(node) { if (active.has(node)) { cycles.push(stack.slice(stack.indexOf(node)).concat(node)); return; } if (seen.has(node)) return; seen.add(node); active.add(node); stack.push(node); for (const next of graph.get(node) || []) dfs(next); stack.pop(); active.delete(node); }
  for (const node of graph.keys()) dfs(node);
  return cycles.slice(0, 50);
}

module.exports = { testMatrix, bundleTrace, dependencyCycleCheck, deadExportScan, mutationPatchTest, browserReplay, apiContractCheck, perfBudgetCheck };
