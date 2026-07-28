// B"H
const fs = require("fs");
const path = require("path");
const { ROOT } = require("../../lib/config.js");

const MAX_LOGS = 2000;
const entries = [];
const NETWORK_LOG = path.join(
  ROOT,
  "state",
  "browser-logs",
  `chrome-network-${process.pid}.jsonl`
);

/**
 * B"H
 * Chapter 424: Every Hidden Token Left A Shadow.
 *
 * The Awtsmoos does not expose secrets, yet it records their silhouettes. This
 * logger captures ChatGPT request ancestry, URL, method, status, post-body
 * shape, cookie names, and sensitive header names with length summaries. Thus
 * the prepare/conduit/sentinel choreography can be traced without printing the
 * living seals themselves.
 */
function addChromeLog(source, level, message, details = {}) {
  const entry = {
    ts: Date.now(),
    iso: new Date().toISOString(),
    source: String(source || "chrome"),
    level: String(level || "info"),
    message: String(message || ""),
    details: details && typeof details === "object" ? details : {}
  };
  entries.push(entry);
  while (entries.length > MAX_LOGS) entries.shift();
  return entry;
}

function remoteValue(arg) {
  if (!arg) return "";
  if (arg.value !== undefined) return typeof arg.value === "string" ? arg.value : JSON.stringify(arg.value);
  if (arg.description) return String(arg.description);
  if (arg.unserializableValue) return String(arg.unserializableValue);
  return arg.type || "";
}

function captureCdpEvent(event = {}) {
  const method = event.method;
  const params = event.params || {};
  if (method === "Runtime.consoleAPICalled") return captureConsole(params);
  if (method === "Runtime.exceptionThrown") return captureException(params);
  if (method === "Log.entryAdded") return captureLogEntry(params);
  if (method === "Network.loadingFailed") return captureNetworkFailure(params);
  if (method === "Network.requestWillBeSent") return captureNetworkRequest(params);
  if (method === "Network.requestWillBeSentExtraInfo") return captureNetworkRequestExtra(params);
  if (method === "Network.responseReceived") return captureNetworkResponse(params);
  if (method === "Network.responseReceivedExtraInfo") return captureNetworkResponseExtra(params);
  if (method === "Network.loadingFinished") return captureNetworkFinished(params);
  if (method === "Page.javascriptDialogOpening") return addChromeLog("page.dialog", "warning", params.message || "JavaScript dialog opened", params);
  if (method === "Page.loadEventFired") return addChromeLog("page.load", "info", "Page load event fired", params);
  return null;
}

function captureConsole(params) {
  const message = (params.args || []).map(remoteValue).filter(Boolean).join(" ");
  return addChromeLog("runtime.console", params.type || "log", message, { type: params.type, stackTrace: params.stackTrace || null, executionContextId: params.executionContextId || null });
}

function captureException(params) {
  const ex = params.exceptionDetails || {};
  return addChromeLog("runtime.exception", "error", ex.text || ex.exception?.description || "JavaScript exception", ex);
}

function captureLogEntry(params) {
  const entry = params.entry || {};
  return addChromeLog("log.entry", entry.level || "info", entry.text || "", entry);
}

function captureNetworkFailure(params) {
  const safe = { kind: "loadingFailed", requestId: params.requestId, errorText: params.errorText, blockedReason: params.blockedReason, type: params.type, timestamp: params.timestamp };
  writeNetwork(safe);
  // Chrome emits ERR_ABORTED when a deliberate navigation replaces the page
  // that was still loading. It is evidence of cancellation, not an application
  // or transport failure, and must not poison another action's error verdict.
  const cancelled = params.canceled === true || String(params.errorText || "").toUpperCase() === "NET::ERR_ABORTED";
  return addChromeLog(
    "network.loadingFailed",
    cancelled ? "warning" : "error",
    params.errorText || "Network loading failed",
    { ...safe, cancelled }
  );
}

function captureNetworkRequest(params) {
  const request = params.request || {};
  if (!isRelevantUrl(request.url)) return null;
  const safe = {
    kind: "requestWillBeSent",
    requestId: params.requestId,
    loaderId: params.loaderId,
    documentURL: params.documentURL,
    type: params.type,
    url: request.url,
    method: request.method,
    headers: redactHeaders(request.headers || {}),
    sensitiveHeaders: summarizeSensitiveHeaders(request.headers || {}),
    postDataPreview: safePostPreview(request.postData || ""),
    postDataShape: postDataShape(request.postData || ""),
    initiator: simplifyInitiator(params.initiator || {}),
    wallTime: params.wallTime || null,
    timestamp: params.timestamp || null
  };
  writeNetwork(safe);
  return addChromeLog("network.request", "info", `${safe.method || "GET"} ${safe.url}`, safe);
}

function captureNetworkRequestExtra(params) {
  const headers = params.headers || {};
  if (!looksRelevantHeaders(headers)) return null;
  writeNetwork({ kind: "requestWillBeSentExtraInfo", requestId: params.requestId, headers: redactHeaders(headers), sensitiveHeaders: summarizeSensitiveHeaders(headers), associatedCookies: summarizeCookies(params.associatedCookies || []) });
  return null;
}

function captureNetworkResponse(params) {
  const response = params.response || {};
  if (!isRelevantUrl(response.url)) return null;
  const safe = {
    kind: "responseReceived",
    requestId: params.requestId,
    type: params.type,
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    mimeType: response.mimeType,
    headers: redactHeaders(response.headers || {}),
    sensitiveHeaders: summarizeSensitiveHeaders(response.headers || {}),
    protocol: response.protocol || "",
    remoteIPAddress: response.remoteIPAddress || "",
    securityDetails: response.securityDetails ? { protocol: response.securityDetails.protocol, issuer: response.securityDetails.issuer, validFrom: response.securityDetails.validFrom, validTo: response.securityDetails.validTo } : null
  };
  writeNetwork(safe);
  return addChromeLog("network.response", response.status >= 400 ? "error" : "info", `${safe.status} ${safe.url}`, safe);
}

function captureNetworkResponseExtra(params) {
  const headers = params.headers || {};
  if (!params.statusCode && !looksRelevantHeaders(headers)) return null;
  writeNetwork({ kind: "responseReceivedExtraInfo", requestId: params.requestId, statusCode: params.statusCode, headers: redactHeaders(headers), sensitiveHeaders: summarizeSensitiveHeaders(headers), blockedCookies: summarizeCookies(params.blockedCookies || []) });
  return null;
}

function captureNetworkFinished(params) {
  writeNetwork({ kind: "loadingFinished", requestId: params.requestId, encodedDataLength: params.encodedDataLength || 0 });
  return null;
}

function isRelevantUrl(url = "") {
  return /chatgpt\.com\/(backend-api|backend-alt|api\/auth|c\/|$)/i.test(String(url));
}

function looksRelevantHeaders(headers = {}) {
  return Object.keys(headers).some(key => /authorization|cookie|sentinel|conduit|turnstile|proof|content-type|user-agent|oai|arkose|cf-|csrf/i.test(key));
}

function simplifyInitiator(initiator = {}) {
  return {
    type: initiator.type || "",
    url: initiator.url || "",
    lineNumber: initiator.lineNumber,
    columnNumber: initiator.columnNumber,
    requestId: initiator.requestId || "",
    stack: simplifyStack(initiator.stack || null)
  };
}

function simplifyStack(stack) {
  if (!stack) return null;
  return {
    description: stack.description || "",
    callFrames: (stack.callFrames || []).map(frame => ({ functionName: frame.functionName || "", url: frame.url || "", lineNumber: frame.lineNumber, columnNumber: frame.columnNumber })).slice(0, 100),
    parent: simplifyStack(stack.parent || null),
    parentId: stack.parentId || null
  };
}

function sensitiveHeaderName(key = "") {
  return /authorization|cookie|token|sentinel|csrf|arkose|cf-|clearance|oai-|device|conduit|turnstile|proof/i.test(key);
}

function redactHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => sensitiveHeaderName(key) ? [key, "[[redacted]]"] : [key, value]));
}

function summarizeSensitiveHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).filter(([key]) => sensitiveHeaderName(key)).map(([key, value]) => [key, { present: true, length: String(value || "").length }]));
}

function summarizeCookies(cookies = []) {
  return cookies.map(item => ({ name: item.cookie?.name || item.name || "", blockedReasons: item.blockedReasons || [], exemptionReason: item.exemptionReason || "" })).slice(0, 120);
}

function safePostPreview(text = "") {
  const raw = String(text || "");
  if (!raw) return "";
  try { return JSON.stringify(redactJson(JSON.parse(raw))).slice(0, 5000); }
  catch { return raw.slice(0, 1200); }
}

function postDataShape(text = "") {
  try {
    const json = JSON.parse(String(text || "{}"));
    return shapeJson(json);
  } catch { return null; }
}

function shapeJson(value) {
  if (Array.isArray(value)) return { type: "array", length: value.length, first: value.length ? shapeJson(value[0]) : null };
  if (!value || typeof value !== "object") return { type: typeof value };
  return { type: "object", keys: Object.keys(value), fields: Object.fromEntries(Object.entries(value).slice(0, 40).map(([key, item]) => [key, /token|authorization|cookie|proof|arkose|sentinel|csrf|conduit|turnstile/i.test(key) ? "[[sensitive]]" : shapeJson(item)])) };
}

function redactJson(value) {
  if (Array.isArray(value)) return value.map(redactJson);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = /token|authorization|cookie|proof|arkose|sentinel|csrf|conduit|turnstile/i.test(key) ? "[[redacted]]" : redactJson(item);
  return out;
}

function writeNetwork(record) {
  try {
    fs.mkdirSync(path.dirname(NETWORK_LOG), { recursive: true });
    fs.appendFileSync(NETWORK_LOG, JSON.stringify({ at: new Date().toISOString(), ...record }) + "\n");
  } catch {}
}

function resetNetworkLog() {
  fs.mkdirSync(path.dirname(NETWORK_LOG), { recursive: true });
  fs.writeFileSync(NETWORK_LOG, "");
  return NETWORK_LOG;
}

function readChromeLogs(options = {}) {
  const maxLogs = Math.max(1, Math.min(Number(options.maxLogs || 200), 1500));
  const logs = entries.slice(-maxLogs);
  if (options.clear) entries.length = 0;
  return { logs, count: logs.length, totalBuffered: entries.length, cleared: !!options.clear, networkLog: NETWORK_LOG };
}

module.exports = { addChromeLog, captureCdpEvent, readChromeLogs, resetNetworkLog, NETWORK_LOG, simplifyInitiator, simplifyStack };
