// B"H
const { bodyJson } = require("./bodyPayload.js");

function queryMap($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch { return fallback; }
}

function parse64(value, fallback) {
  try { return parseJson(from64(value), fallback); } catch { return fallback; }
}

function boolValue(value) {
  if (value === true || value === false) return value;
  if (["true", "1", "yes", "on"].includes(String(value).toLowerCase())) return true;
  if (["false", "0", "no", "off"].includes(String(value).toLowerCase())) return false;
  return undefined;
}

function num(value, fallback, min, max) {
  const n = Number(value);
  const got = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, got));
}

function mergeDefined(target, source = {}) {
  for (const [key, value] of Object.entries(source || {})) {
    if (value !== undefined && value !== null && value !== "") target[key] = value;
  }
  return target;
}

function validAction(value) {
  return typeof value === "string" && /^[A-Za-z][A-Za-z0-9]*$/.test(value);
}

function actionKind(action) {
  const text = String(action || "");
  if (text.startsWith("chrome")) return "chrome";
  if (text.startsWith("command") || text === "command" || text === "nodeScriptRun") return "command";
  return "fs";
}

function carrierAction(params, params64) {
  return params.intendedAction || params.expectedAction || params.action ||
    params64.intendedAction || params64.expectedAction || params64.action || "";
}

function hasCommandIntent(raw) {
  return Boolean(raw.command || raw.command64 || raw.script || raw.scriptText || raw.script64);
}

function inferredAction(raw) {
  if (hasCommandIntent(raw)) return "commandRun";
  if (raw.jobId || raw.id || raw.job || raw.taskId) return raw.stream ? "commandJobOutputPage" : "commandStatus";
  return "";
}

function effectiveOriginalAction(originalAction, raw) {
  if (originalAction === "configGet" && hasCommandIntent(raw)) return "";
  return originalAction;
}

/**
 * B"H
 * Chapter 535: Even when the messenger drops the name, the deed testifies.
 * The explicit action still rules. Carrier action remains only a missing-action
 * fallback. But when a flaky adapter sends a command body without the action
 * query, the command itself becomes a witness and safely recovers commandRun.
 */
function buildFsPayload($i) {
  const query = queryMap($i);
  const body = bodyJson($i) || {};
  const queryParams = parseJson(query.params, {});
  const bodyParams = parseJson(body.params, {});
  const params = { ...queryParams, ...bodyParams };
  const queryParams64 = parse64(query.params64, {});
  const bodyParams64 = parse64(body.params64, {});
  const params64 = { ...queryParams64, ...bodyParams64 };
  const raw = {};
  mergeDefined(raw, query);
  mergeDefined(raw, body);
  mergeDefined(raw, params);
  mergeDefined(raw, params64);

  const originalAction = body.action || query.action || "";
  const fallbackAction = carrierAction(params, params64);
  const inferred = inferredAction(raw);
  const outerAction = effectiveOriginalAction(originalAction, raw);
  const action = validAction(outerAction) ? outerAction : validAction(fallbackAction) ? fallbackAction : inferred;
  if (!action) return { ok: false, action: "", kind: "fs", payloadError: "missing_action" };

  const pathValue = raw.p || raw.path || ".";
  const jobId = raw.jobId || raw.id || raw.job || raw.taskId || "";
  const recovered = Boolean(!validAction(outerAction) && (validAction(fallbackAction) || inferred));
  const payload = {
    kind: actionKind(action),
    action,
    adapterAction: recovered ? originalAction || undefined : undefined,
    actionRecoveredFromCarrier: recovered,
    path: pathValue,
    p: pathValue,
    absolutePath: raw.absolutePath || "",
    cwd: raw.cwd || "",
    root: raw.root || "",
    depth: num(raw.depth, 2, 0, 20),
    limit: num(raw.limit, 150, 1, 2000),
    maxChars: num(raw.maxChars, 12000, 1, 1000000),
    totalMaxChars: num(raw.totalMaxChars, 24000, 1, 5000000),
    maxFiles: num(raw.maxFiles, 5, 1, 500),
    offsetChars: num(raw.offsetChars, 0, 0, 100000000),
    maxBytes: num(raw.maxBytes, 24000, 1, 100000000),
    offsetBytes: num(raw.offsetBytes, 0, 0, 100000000),
    startLine: num(raw.startLine, 1, 1, 10000000),
    endLine: num(raw.endLine, 250, 1, 10000000),
    jobId,
    id: jobId,
    stream: raw.stream || "",
    command: raw.command || raw.script || from64(raw.command64) || from64(raw.script64),
    scriptText: raw.scriptText || from64(raw.script64),
    content: raw.content || from64(raw.content64),
    find: raw.find || from64(raw.find64),
    query: raw.query || from64(raw.query64),
    replace: raw.replace || from64(raw.replace64),
    text: raw.text || from64(raw.text64),
    expression: raw.expression || from64(raw.expression64),
    shell: raw.shell || "",
    timeoutMs: num(raw.timeoutMs, 240000, 100, 86400000),
    waitTimeoutMs: num(raw.waitTimeoutMs || raw.timeoutMs, 25000, 100, 86400000),
    pollIntervalMs: num(raw.pollIntervalMs, 1000, 10, 60000),
    maxWaitMs: raw.maxWaitMs ? num(raw.maxWaitMs, 86400000, 100, 86400000) : undefined,
    torahUnlimitedWait: boolValue(raw.torahUnlimitedWait),
    unlimitedWait: boolValue(raw.unlimitedWait),
    allowCommands: boolValue(raw.allowCommands),
    allowWrite: boolValue(raw.allowWrite),
    allowSecrets: boolValue(raw.allowSecrets),
    enableLocalHttpProxy: boolValue(raw.enableLocalHttpProxy),
    regex: boolValue(raw.regex) || false,
    replaceAll: boolValue(raw.replaceAll) !== false,
    dryRun: boolValue(raw.dryRun),
    confirm: boolValue(raw.confirm),
    inlineOutput: boolValue(raw.inlineOutput),
    async: boolValue(raw.async),
    streamLogs: boolValue(raw.streamLogs),
    maxInlineChars: raw.maxInlineChars || "",
    budgetPerutas: raw.budgetPerutas ?? raw.budget ?? null,
    title: raw.title || raw.previewTitle || "",
    previewTitle: raw.previewTitle || raw.title || "",
    visibility: raw.visibility || "",
    previewVisibility: raw.previewVisibility || raw.visibility || "",
    ttlSeconds: raw.ttlSeconds || "",
    previewTtlSeconds: raw.previewTtlSeconds || raw.ttlSeconds || "",
    autoPreview: boolValue(raw.autoPreview),
    tunnelName: raw.tunnelName || raw.targetTunnel || "",
    targetVessel: raw.targetVessel || raw.vessel || "",
    conversationId: raw.conversationId || "",
    conversationName: raw.conversationName || "",
    access: raw.access || parse64(raw.access64, null),
    sharedWith: raw.sharedWith || parse64(raw.sharedWith64, null),
    vars: raw.vars || parse64(raw.vars64, {}),
    tree: parseJson(raw.tree, parse64(raw.tree64, raw.tree || null)),
    workflow: parseJson(raw.workflow, parse64(raw.workflow64, raw.workflow || null)),
    steps: raw.steps || parse64(raw.steps64, null),
    nodes: raw.nodes || parse64(raw.nodes64, null),
    paths: raw.paths || parse64(raw.paths64, []),
    files: raw.files || parse64(raw.files64, null),
    writes: raw.writes || parse64(raw.writes64, null),
    actions: raw.actions || parseJson(raw.actionsJson, parse64(raw.actionsJson64, [])),
    input: raw.input || parse64(raw.input64, {}),
    params,
    params64
  };

  if (payload.stream !== "stdout" && payload.stream !== "stderr") delete payload.stream;
  return payload;
}

function actionRequiredScope(action) {
  const text = String(action || "");
  if (text.startsWith("command") || text === "command" || text === "nodeScriptRun") return "tunnel.command";
  if (text.startsWith("chrome")) return "tunnel.browser";
  if (["write", "bulkWrite", "bulkWriteIfHashes", "writeIfHash", "findReplace", "replaceRange", "applyPatch", "configSet", "rootSelect"].includes(text)) return "tunnel.write";
  return "tunnel.read";
}

module.exports = {
  buildFsPayload,
  actionRequiredScope,
  actionNeedsWrite: action => actionRequiredScope(action) === "tunnel.write"
};
