// B"H
const { handleVirtualAiAction, isVirtualAiAction } = require("./virtualAiAgents.js");
const { interpretedAction, virtualSurfaceReport } = require("./virtualActionBridge.js");

const state = { presets: new Map(), templates: new Map(), histories: [], memories: new Map(), macros: new Map() };

/**
 * B"H
 * Chapter 382: The Generic Gate Became A Translator Instead Of A Fog.
 *
 * When a documented tunnel verb reaches the Virtual OS and no native handler
 * claimed it, the Awtsmoos now classifies and interprets it immediately. The
 * upstairs GPT receives a precise realtime contract: native, AI, hosted-state,
 * network, diagnostic, or host-only-safe-report.
 */
async function supportAction(action, payload = {}, dispatch) {
  if (isVirtualAiAction(action)) return handleVirtualAiAction(action, payload, dispatch);
  if (action === "virtualActionSurface" || action === "capabilityParityAudit") return virtualSurfaceReport();
  if (action === "finishAndContinue") return finishAndContinue(payload);
  if (action === "payloadEcho") return payloadEcho(payload);
  if (action === "actionSchemaTrace") return actionSchemaTrace(payload);
  if (isRuntimeSupportAction(action)) return runtimeSupportAction(action, payload, dispatch);
  if (/Preset|Template|History|Memory|Macro/.test(action)) return stateAction(action, payload);
  if (/List$/.test(action) || action.endsWith("Status")) return listLike(action, payload);
  if (/Get$/.test(action)) return getLike(action, payload);
  return interpretedAction(action, payload, dispatch);
}
function base(action, payload = {}, extra = {}) { return { ok: true, action, resultType: "support-action-result", target: payload.path || payload.p || payload.cwd || payload.url || payload.entry || payload.name || ".", generatedAt: new Date().toISOString(), ...extra }; }
function summarizePayload(payload = {}) { const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== "" && k !== "apiKey"); return Object.fromEntries(keys.slice(0, 30).map(k => [k, typeof payload[k] === "string" ? payload[k].slice(0, 300) : payload[k]])); }
function isRuntimeSupportAction(action) { return /runtime|merkava|virtualDom/i.test(action); }
async function runtimeSupportAction(action, payload = {}, dispatch) {
  if (action === "runtimeOptionEcho") return base(action, payload, { family: "preview-runtime", options: summarizePayload(payload) });
  if (action === "runtimeEngineMatrix") return base(action, payload, { family: "preview-runtime", available: ["browser", "node", "merkava"] });
  if (action === "simulateRuntimeProviders") return base(action, payload, { family: "preview-runtime", providers: ["merkava-service"] });
  return interpretedAction(action, payload, dispatch);
}
function payloadEcho(payload = {}) { return base("payloadEcho", payload, { family: "schema", payload: summarizePayload(payload), keys: Object.keys(payload).sort().filter(k => k !== "apiKey") }); }
function actionSchemaTrace(payload = {}) { return base("actionSchemaTrace", payload, { family: "schema", targetAction: payload.target || payload.name || payload.actionName || "", acceptedFields: Object.keys(payload).sort(), payload: summarizePayload(payload) }); }
function finishAndContinue(payload = {}) {
  const remaining = payload.remainingTasks || payload.tasks || payload.todo || [];
  return base("finishAndContinue", payload, { finalInstruction: { role: "assistant", content: payload.continuationPrompt || "Keep going. List all remaining work, do it one by one, verify each step, and conclude only when complete." }, remainingTasks: Array.isArray(remaining) ? remaining : String(remaining || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean) });
}
function stateAction(action, payload = {}) { const name = payload.name || payload.key || payload.id || "default"; const bucket = action.includes("Template") ? state.templates : action.includes("Preset") ? state.presets : action.includes("Macro") ? state.macros : state.memories; if (/Save|Patch|Replace|Fork|Promote|RecordStart|Run/.test(action)) bucket.set(name, { name, payload: summarizePayload(payload), updatedAt: new Date().toISOString() }); if (/Delete/.test(action)) bucket.delete(name); return base(action, payload, { family: "stateful-memory", mode: "hosted-state", name, count: bucket.size, items: [...bucket.values()].slice(0, Number(payload.limit || 20)) }); }
function listLike(action, payload = {}) { return base(action, payload, { family: "stateful-memory", mode: "hosted-state", items: [], status: "empty_but_available", note: "Virtual OS hosted list/status handler is available. No persisted records were found in this support store." }); }
function getLike(action, payload = {}) { return base(action, payload, { family: "stateful-memory", mode: "hosted-state", found: false, name: payload.name || payload.id || payload.key || "default" }); }
module.exports = { supportAction, state };
