// B"H
const { simulateNodeDomRuntime } = require("../nodeDomRuntime/index.js");

/**
 * B"H
 * Chapter 412: Chrome words learned to wear the node-dom garment.
 * When callers pass engine=node-dom, runtime=node-dom, or virtualDom=true, the
 * familiar chrome* verbs run against the virtual DOM instead of CDP.
 */
function wantsVirtualChrome(payload = {}) {
  const engine = String(payload.engine || payload.runtime || "").toLowerCase();
  return engine === "node-dom" || engine === "virtual-dom" || payload.virtualDom === true || String(payload.virtualDom).toLowerCase() === "true";
}

async function virtualChrome(action, payload = {}) {
  const options = baseOptions(payload);
  if (action === "chromeEval") return await evalVirtual(options, payload);
  if (action === "chromeNavigate") return await snapshotVirtual(options, payload, "chromeNavigate");
  if (action === "chromeSnapshot") return await snapshotVirtual(options, payload, "chromeSnapshot");
  if (action === "chromeClick") return await actionVirtual(options, payload, { action: "click", selector: payload.selector }, "chromeClick");
  if (action === "chromeType") return await actionVirtual(options, payload, { action: payload.mode === "fill" ? "fill" : "type", selector: payload.selector, text: payload.text ?? payload.value ?? "" }, "chromeType");
  if (action === "chromeWaitForSelector") return await actionVirtual(options, payload, { action: "waitForSelector", selector: payload.selector, timeoutMs: payload.timeoutMs }, "chromeWaitForSelector");
  if (action === "chromeRunScript") return await runScriptVirtual(options, payload);
  if (action === "chromeStatus") return { ok: true, action: "chromeStatus", engine: "node-dom", connected: true, virtual: true, message: "Virtual DOM mode is stateless; provide html/files per action." };
  if (action === "chromeLaunch") return { ok: true, action: "chromeLaunch", engine: "node-dom", virtual: true, message: "No external browser launched in node-dom mode." };
  if (action === "chromeFind") return { ok: true, action: "chromeFind", engine: "node-dom", virtual: true, found: true };
  return { ok: false, action, engine: "node-dom", error: "unsupported_virtual_chrome_action" };
}

function baseOptions(payload = {}) {
  return {
    ...payload,
    engine: "node-dom",
    runtime: "browser",
    html: payload.html || htmlFromUrl(payload.url),
    files: parseMaybeJson(payload.files, payload.files || {}),
    entry: payload.entry || "index.html",
    waitMs: Number(payload.waitMs || 0),
    timeoutMs: Number(payload.timeoutMs || 30000),
    format: "json"
  };
}

async function evalVirtual(options, payload) {
  const expression = payload.expression || "document.title";
  const result = await simulateNodeDomRuntime({ ...options, returnValues: [expression] });
  const value = result.values ? result.values[expression] : undefined;
  return { ok: result.ok !== false, action: "chromeEval", engine: "node-dom", virtual: true, expression, result: { result: { value } }, runtime: result };
}

async function snapshotVirtual(options, payload, action) {
  const result = await simulateNodeDomRuntime({ ...options, browserActions: [{ action: "snapshot" }] });
  return { ok: result.ok !== false, action, engine: "node-dom", virtual: true, snapshot: result.snapshot || result.interactionLog?.at?.(-1)?.value || null, runtime: result };
}

async function actionVirtual(options, payload, step, action) {
  if (!step.selector && ["chromeClick", "chromeType", "chromeWaitForSelector"].includes(action)) return { ok: false, action, engine: "node-dom", error: "missing_selector" };
  const actions = [...existingActions(payload), step];
  const result = await simulateNodeDomRuntime({ ...options, browserActions: actions, returnValues: parseReturnValues(payload) });
  return { ok: result.ok !== false, action, engine: "node-dom", virtual: true, step, interactionLog: result.interactionLog || [], values: result.values || {}, runtime: result };
}

async function runScriptVirtual(options, payload) {
  const actions = normalizeChromeScript(payload.script || payload.steps || payload.actions || payload.actionsJson);
  const result = await simulateNodeDomRuntime({ ...options, browserActions: actions, returnValues: parseReturnValues(payload) });
  return { ok: result.ok !== false, action: "chromeRunScript", engine: "node-dom", virtual: true, count: actions.length, interactionLog: result.interactionLog || [], values: result.values || {}, runtime: result };
}

function normalizeChromeScript(raw) {
  const list = parseMaybeJson(raw, raw || []);
  if (!Array.isArray(list)) return [];
  return list.map(step => {
    const type = step.type || step.action;
    if (["goto", "navigate"].includes(type)) return { action: "snapshot" };
    if (type === "eval") return { ...step, action: "evaluate", expression: step.expression || "undefined" };
    if (type === "wait") return { ...step, action: step.selector ? "waitForSelector" : "waitForTimeout" };
    return { ...step, action: type };
  });
}

function existingActions(payload = {}) {
  const parsed = parseMaybeJson(payload.browserActions || payload.pageActions || payload.interactions || payload.actionsJson, []);
  return Array.isArray(parsed) ? parsed : [];
}

function parseReturnValues(payload = {}) {
  const parsed = parseMaybeJson(payload.returnValues || payload.values, []);
  return Array.isArray(parsed) ? parsed : [];
}

function parseMaybeJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function htmlFromUrl(url) {
  if (!url) return "<body></body>";
  return `<body data-virtual-url="${escapeHtml(String(url))}"></body>`;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
}

module.exports = { wantsVirtualChrome, virtualChrome, normalizeChromeScript };
