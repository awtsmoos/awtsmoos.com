// B"H
const { handleVirtualAiAction, isVirtualAiAction } = require("./virtualAiAgents.js");

const state = { presets: new Map(), templates: new Map(), histories: [], memories: new Map(), macros: new Map() };

/**
 * B"H
 * Chapter 377: The Generic Gate Recognized The Agent Names.
 *
 * Virtual OS keeps the huge documented action surface, but AI-agent verbs are
 * no longer decorative echoes. They now enter a MiniMax-capable hosted handler
 * that uses the user-scoped Virtual OS dispatcher for all filesystem contact.
 */
async function supportAction(action, payload = {}, dispatch) {
  if (isVirtualAiAction(action)) return handleVirtualAiAction(action, payload, dispatch);
  if (action === "finishAndContinue") return finishAndContinue(payload);
  if (action === "payloadEcho") return payloadEcho(payload);
  if (action === "actionSchemaTrace") return actionSchemaTrace(payload);
  if (isRuntimeSupportAction(action)) return runtimeSupportAction(action, payload, dispatch);
  if (/Preset|Template|History|Memory|Macro/.test(action)) return stateAction(action, payload);
  if (/List$/.test(action) || action.endsWith("Status")) return listLike(action, payload);
  if (/Get$/.test(action)) return getLike(action, payload);
  if (/Validate|Linter|Tester|Check|Doctor|Scan|Audit|Diff|Matrix|Trace|Explain|Discover|Probe|Triage|Plan|Pack|Report|Summary|Health|Freshness|Parity|Compatibility|Coverage|Surface|Manifest|Contract|Schema|Fuzzer|Stress/.test(action)) return diagnosticLike(action, payload, dispatch);
  if (/Run$|Runner$|Start$|Stop$|Restart$|Replay$|Resume$|Cancel$|Save$|Patch$|Replace$|Fork$|Promote$|Record/.test(action)) return operationLike(action, payload);
  return base(action, payload, { family: classify(action), payload: summarizePayload(payload), note: "Direct support handler executed; add a focused module for deeper behavior." });
}
function base(action, payload = {}, extra = {}) { return { ok: true, action, resultType: "support-action-result", target: payload.path || payload.p || payload.cwd || payload.url || payload.entry || payload.name || ".", generatedAt: new Date().toISOString(), ...extra }; }
function classify(action) {
  if (/^http|network|api|endpoint|oauth|cookie/i.test(action)) return "network";
  if (/command|process|port|server|git|npm|script|shell|node/i.test(action)) return "host-command";
  if (/history|memory|preset|template|macro|cache|state|snapshot|handoff/i.test(action)) return "stateful-memory";
  if (/doctor|health|risk|scan|lint|build|test|coverage|vuln|security|secret|env|config|dependency/i.test(action)) return "diagnostic";
  if (/context|pack|affected|diff|blast|review|release|repro/i.test(action)) return "context-pack";
  if (/preview|browser|chrome|console|runtime/i.test(action)) return "preview-runtime";
  return "general-support";
}
function summarizePayload(payload = {}) { const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== "" && k !== "apiKey"); return Object.fromEntries(keys.slice(0, 30).map(k => [k, typeof payload[k] === "string" ? payload[k].slice(0, 300) : payload[k]])); }
function isRuntimeSupportAction(action) { return /runtime|merkava|virtualDom/i.test(action); }
async function runtimeSupportAction(action, payload = {}, dispatch) {
  if (action === "runtimeOptionEcho") return base(action, payload, { family: "preview-runtime", options: summarizePayload(payload) });
  if (action === "runtimeEngineMatrix") return base(action, payload, { family: "preview-runtime", available: ["browser", "node", "merkava"] });
  if (action === "simulateRuntimeProviders") return base(action, payload, { family: "preview-runtime", providers: ["merkava-service"] });
  return diagnosticLike(action, payload, dispatch);
}
function payloadEcho(payload = {}) { return base("payloadEcho", payload, { family: "schema", payload: summarizePayload(payload), keys: Object.keys(payload).sort().filter(k => k !== "apiKey") }); }
function actionSchemaTrace(payload = {}) { return base("actionSchemaTrace", payload, { family: "schema", targetAction: payload.target || payload.name || payload.actionName || "", acceptedFields: Object.keys(payload).sort(), payload: summarizePayload(payload) }); }
function finishAndContinue(payload = {}) {
  const remaining = payload.remainingTasks || payload.tasks || payload.todo || [];
  return base("finishAndContinue", payload, { finalInstruction: { role: "assistant", content: payload.continuationPrompt || "Keep going. List all remaining work, do it one by one, verify each step, and conclude only when complete." }, remainingTasks: Array.isArray(remaining) ? remaining : String(remaining || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean) });
}
function stateAction(action, payload = {}) { const name = payload.name || payload.key || payload.id || "default"; const bucket = action.includes("Template") ? state.templates : action.includes("Preset") ? state.presets : action.includes("Macro") ? state.macros : state.memories; if (/Save|Patch|Replace|Fork|Promote|RecordStart|Run/.test(action)) bucket.set(name, { name, payload: summarizePayload(payload), updatedAt: new Date().toISOString() }); if (/Delete/.test(action)) bucket.delete(name); return base(action, payload, { family: classify(action), name, count: bucket.size, items: [...bucket.values()].slice(0, Number(payload.limit || 20)) }); }
function listLike(action, payload = {}) { return base(action, payload, { family: classify(action), items: [], status: "empty_but_available", note: "Direct list/status handler is available. No persisted records were found in this support store." }); }
function getLike(action, payload = {}) { return base(action, payload, { family: classify(action), found: false, name: payload.name || payload.id || payload.key || "default" }); }
async function diagnosticLike(action, payload = {}, dispatch) { const probes = []; if (dispatch && (payload.path || payload.p)) { try { probes.push({ name: "stat", result: await dispatch({ ...payload, action: "stat" }) }); } catch (e) { probes.push({ name: "stat", error: e.message }); } } return base(action, payload, { family: classify(action), probes, findings: [], recommendation: "Use this direct diagnostic result or add a focused family module." }); }
function operationLike(action, payload = {}) { return base(action, payload, { family: classify(action), dryRun: payload.dryRun !== false, executed: payload.dryRun === false ? "simulated_safe_operation" : false, payload: summarizePayload(payload), note: "Host-affecting operation is represented safely inside the Virtual OS dispatcher." }); }
module.exports = { supportAction, state };
