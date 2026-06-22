// B"H
const { bodyJson } = require("./bodyPayload.js");
const { flatQueryArray } = require("./indexedQueryArrays.js");

const FOUR_MINUTES_MS = 240000;
const ONE_DAY_MS = 86400000;
const VERY_LARGE_INT = Number.MAX_SAFE_INTEGER;

function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

function jsonFrom64(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(from64(value)); }
  catch (_e) { return fallback; }
}

function boolValue(value) {
  if (value === true || value === false) return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return undefined;
}

function queryMap($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

function valueFrom($i, body, name, fallback = "") {
  const q = queryMap($i);
  if (body && body[name] !== undefined && body[name] !== null) return body[name];
  return q[name] ?? fallback;
}

function queryValue($i, name, fallback = "") {
  return queryMap($i)[name] ?? fallback;
}

function numberFrom($i, body, name, fallback) {
  const raw = valueFrom($i, body, name, undefined);
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function intFrom($i, body, name, fallback, max = VERY_LARGE_INT) {
  const n = numberFrom($i, body, name, fallback);
  if (!Number.isFinite(n)) return fallback;
  const normalized = Math.max(0, Math.floor(n));
  if (Number.isFinite(max) && max >= VERY_LARGE_INT) return normalized;
  return normalized;
}

function parseJsonText(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  try { return JSON.parse(String(value)); }
  catch (_e) { return fallback; }
}

function parsePlainListText(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = parseJsonText(value, null);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return Object.keys(parsed);
  return String(value).split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
}

function parsePlainListText(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = parseJsonText(value, null);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return Object.keys(parsed);
  return String(value).split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
}

function queryPlainOrUndefined($i, name) {
  const q = queryMap($i);
  return q[name] === undefined ? undefined : q[name];
}

function preferBodyOr64($i, body, plainName, encodedName, fallback = "") {
  if (body && body[plainName] !== undefined) return String(body[plainName] ?? "");
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return String(plainQuery ?? "");
  return from64(queryValue($i, encodedName, "")) || fallback;
}

/**
 * B"H
 * A little mercy for wandering agents at the command gate.
 * The canonical vessel is command/command64, but older callers sometimes send
 * commands/commands64. We accept the alias, normalize to command, and keep the
 * live schema honest so the next emissary does not trip over yesterday's map.
 */
function preferBodyOr64Alias($i, body, primaryName, aliases, encodedName, encodedAliases = [], fallback = "") {
  if (body && body[primaryName] !== undefined) return String(body[primaryName] ?? "");
  const primaryQuery = queryPlainOrUndefined($i, primaryName);
  if (primaryQuery !== undefined) return String(primaryQuery ?? "");
  for (const alias of aliases) {
    if (body && body[alias] !== undefined) return String(body[alias] ?? "");
    const aliasQuery = queryPlainOrUndefined($i, alias);
    if (aliasQuery !== undefined) return String(aliasQuery ?? "");
  }
  const encodedPrimary = from64(queryValue($i, encodedName, ""));
  if (encodedPrimary) return encodedPrimary;
  for (const alias of encodedAliases) {
    const encodedAlias = from64(queryValue($i, alias, ""));
    if (encodedAlias) return encodedAlias;
  }
  return fallback;
}

function arrayBodyOr64($i, body, plainName, encodedName, fallback = []) {
  if (body && Array.isArray(body[plainName])) return body[plainName];
  if (body && typeof body[plainName] === "string") return parsePlainListText(body[plainName], fallback);
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return parsePlainListText(plainQuery, fallback);
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function objectBodyOr64($i, body, plainName, encodedName, fallback = null) {
  if (body && body[plainName] && typeof body[plainName] === "object") return body[plainName];
  if (body && typeof body[plainName] === "string") return parseJsonText(body[plainName], fallback);
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return parseJsonText(plainQuery, fallback);
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function mergeParamsIntoBody(body) {
  if (!body || typeof body !== "object") return body || {};
  const params = typeof body.params === "string" ? parseJsonText(body.params, null) : body.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) return body;
  return { ...params, ...body, params };
}

function plainStructuredOr64($i, body, plainName, encodedName, fallback = null) {
  if (body && body[plainName] !== undefined) {
    const value = body[plainName];
    return typeof value === "string" ? parseJsonText(value, value) : value;
  }
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) {
    const value = String(plainQuery ?? "");
    return parseJsonText(value, value);
  }
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function arrayWithIndexed($i, body, plainName, encodedName, fallback = [], options = {}) {
  const existing = arrayBodyOr64($i, body, plainName, encodedName, null);
  if (Array.isArray(existing)) return existing;
  const indexed = flatQueryArray(queryMap($i), options);
  return indexed.length ? indexed : fallback;
}

function boolFrom($i, body, name, fallback = false) {
  const got = boolValue(valueFrom($i, body, name, undefined));
  return got === undefined ? fallback : got;
}

const FS_WORKFLOW_ACTIONS = new Set([
  "commandTreeRun", "commandTreeValidate", "commandTreeDryRun",
  "commandTreeExplain", "commandTreeVisualize", "commandTreeResume",
  "commandTreeReplay", "commandTreeCancel", "commandTreeStatus",
  "commandTreeSave", "commandTreeLoad", "awtsmoosCommandTree",
  "merkavaCommandTree", "aiWorkflowLang", "parallelActionBatch",
  "forEachActionBatch", "retryAction", "assertAction",
  "snapshotBeforeAfter", "policyGuard", "destructiveIntentGate",
  "actionBatch", "workflowRun", "workflowValidate", "workflowList", "workflowGet",
  "testMatrix", "runtimeWorkflow", "merkavaWorkflowRun", "aiWorkflowRun"
]);

function actionKind(action) {
  action = String(action || "");
  if (FS_WORKFLOW_ACTIONS.has(action)) return "fs";
  if (["inspectRuntime", "launchPreview", "listPreviews", "previewLogs", "stopPreview", "restartPreview"].includes(action)) return "tunnel.read";
  if (action.startsWith("mission")) return "fs";
  if (action.startsWith("chrome") || action === "httpUseChromeCookies") return "chrome";
  if (action.startsWith("command") || action === "nodeScriptRun") return "command";
  if (action === "nodeCheck" || action === "nodeCheckTree") return "command";
  return "fs";
}

/**
 * B"H
 * Builds the payload carried through the relay to the local agent.
 *
 * @param {object} $i Awtsmoos request vessel.
 * @returns {object} Agent payload.
 */
function buildFsPayload($i) {
  const body = bodyJson($i);
  const mergedBody = mergeParamsIntoBody(body);
  const action = valueFrom($i, mergedBody, "action", "list");
  const kind = actionKind(action);
  const p = valueFrom($i, mergedBody, "p", valueFrom($i, mergedBody, "path", "."));

  const payload = {
    kind,
    action,
    path: p,
    absolutePath: valueFrom($i, mergedBody, "absolutePath", ""),
    paths: arrayWithIndexed($i, mergedBody, "paths", "paths64", [], {
      prefixes: ["f", "file", "path", "paths"],
      brackets: ["paths", "files"]
    }),
    files: plainStructuredOr64($i, mergedBody, "files", "files64", null),
    writes: plainStructuredOr64($i, mergedBody, "writes", "writes64", null),
    edits: plainStructuredOr64($i, mergedBody, "edits", "edits64", []),
    ranges: arrayBodyOr64($i, mergedBody, "ranges", "ranges64", []),

    depth: intFrom($i, mergedBody, "depth", 2),
    limit: intFrom($i, mergedBody, "limit", 150),
    maxChars: intFrom($i, mergedBody, "maxChars", 12000),
    totalMaxChars: intFrom($i, mergedBody, "totalMaxChars", 24000),
    maxFiles: intFrom($i, mergedBody, "maxFiles", 5, 500),
    maxRanges: intFrom($i, mergedBody, "maxRanges", 20, 60),
    maxEntries: intFrom($i, mergedBody, "maxEntries", 3000, 20000),
    offsetChars: intFrom($i, mergedBody, "offsetChars", 0),
    maxBytes: intFrom($i, mergedBody, "maxBytes", 24000),
    offsetBytes: intFrom($i, mergedBody, "offsetBytes", 0),
    startLine: intFrom($i, mergedBody, "startLine", 1),
    endLine: intFrom($i, mergedBody, "endLine", 250),
    maxResults: intFrom($i, mergedBody, "maxResults", 80, 500),
    maxFileBytes: intFrom($i, mergedBody, "maxFileBytes", 800000),
    sinceMinutes: intFrom($i, mergedBody, "sinceMinutes", 120),
    minBytes: intFrom($i, mergedBody, "minBytes", 500000),
    modifiedAfterMs: intFrom($i, mergedBody, "modifiedAfterMs", 0),
    indent: intFrom($i, mergedBody, "indent", 2, 8),

    content: preferBodyOr64($i, mergedBody, "content", "content64"),
    find: preferBodyOr64($i, mergedBody, "find", "find64"),
    query: preferBodyOr64($i, mergedBody, "query", "query64"),
    replace: preferBodyOr64($i, mergedBody, "replace", "replace64"),
    expectedSha256: valueFrom($i, mergedBody, "expectedSha256", ""),
    sha256: valueFrom($i, mergedBody, "sha256", ""),
    ext: valueFrom($i, mergedBody, "ext", ""),
    from: valueFrom($i, mergedBody, "from", ""),
    to: valueFrom($i, mergedBody, "to", ""),
    source: valueFrom($i, mergedBody, "source", ""),
    dest: valueFrom($i, mergedBody, "dest", ""),
    target: valueFrom($i, mergedBody, "target", ""),
    expectedSourceSha256: valueFrom($i, mergedBody, "expectedSourceSha256", ""),
    dryRun: boolFrom($i, mergedBody, "dryRun", true),
    confirm: boolFrom($i, mergedBody, "confirm", false),
    headers: objectBodyOr64($i, mergedBody, "headers", "headers64", {}),
    body: preferBodyOr64($i, mergedBody, "body", "body64"),
    bodyEncoding: valueFrom($i, mergedBody, "bodyEncoding", "utf8"),
    method: valueFrom($i, mergedBody, "method", "GET"),
    cookieJarName: valueFrom($i, mergedBody, "cookieJarName", ""),
    jar: valueFrom($i, mergedBody, "jar", ""),
    useCookies: boolFrom($i, mergedBody, "useCookies", true),
    saveCookies: boolFrom($i, mergedBody, "saveCookies", true),
    followRedirects: boolFrom($i, mergedBody, "followRedirects", true),
    maxRedirects: intFrom($i, mergedBody, "maxRedirects", 5, 10),
    responseBodyMode: valueFrom($i, mergedBody, "responseBodyMode", "text"),
    saveResponseTo: valueFrom($i, mergedBody, "saveResponseTo", valueFrom($i, mergedBody, "to", "")),
    includeValues: boolFrom($i, mergedBody, "includeValues", false),
    name: valueFrom($i, mergedBody, "name", ""),
    value: valueFrom($i, mergedBody, "value", ""),
    domain: valueFrom($i, mergedBody, "domain", ""),
    path: p,
    expires: valueFrom($i, mergedBody, "expires", ""),
    secure: boolFrom($i, mergedBody, "secure", false),
    httpOnly: boolFrom($i, mergedBody, "httpOnly", false),
    sameSite: valueFrom($i, mergedBody, "sameSite", ""),
    storageType: valueFrom($i, mergedBody, "storageType", ""),
    localStorage: objectBodyOr64($i, mergedBody, "localStorage", "localStorage64", {}),
    sessionStorage: objectBodyOr64($i, mergedBody, "sessionStorage", "sessionStorage64", {}),
    cookies: arrayBodyOr64($i, mergedBody, "cookies", "cookies64", []),

    regex: boolFrom($i, mergedBody, "regex", false),
    replaceAll: boolFrom($i, mergedBody, "replaceAll", true),
    includeDirs: boolFrom($i, mergedBody, "includeDirs", false),
    write: boolFrom($i, mergedBody, "write", false),

    command: preferBodyOr64Alias($i, mergedBody, "command", ["commands"], "command64", ["commands64"]),
    jobId: valueFrom($i, mergedBody, "jobId", valueFrom($i, mergedBody, "id", "")),
    id: valueFrom($i, mergedBody, "id", valueFrom($i, mergedBody, "jobId", "")),
    stream: valueFrom($i, mergedBody, "stream", "stdout"),
    waitTimeoutMs: intFrom($i, mergedBody, "waitTimeoutMs", 240000, ONE_DAY_MS),
    pollIntervalMs: intFrom($i, mergedBody, "pollIntervalMs", 1000, 30000),
    intervalMs: intFrom($i, mergedBody, "intervalMs", 1000, 30000),
    inlineOutput: boolFrom($i, mergedBody, "inlineOutput", true),
    scriptText: preferBodyOr64($i, mergedBody, "scriptText", "script64"),
    input: objectBodyOr64($i, mergedBody, "input", "input64", {}),
    shell: valueFrom($i, mergedBody, "shell", ""),
    cwd: valueFrom($i, mergedBody, "cwd", ""),
    timeoutMs: intFrom($i, mergedBody, "timeoutMs", FOUR_MINUTES_MS, ONE_DAY_MS),

    url: valueFrom($i, mergedBody, "url", ""),
    selector: valueFrom($i, mergedBody, "selector", ""),
    text: preferBodyOr64($i, mergedBody, "text", "text64"),
    expression: preferBodyOr64($i, mergedBody, "expression", "expression64"),
    script: arrayBodyOr64($i, mergedBody, "script", "script64", []),
    port: intFrom($i, mergedBody, "port", 9222, 65535),
    chromePath: valueFrom($i, mergedBody, "chromePath", ""),
    userDataDir: valueFrom($i, mergedBody, "userDataDir", ""),
    headless: boolFrom($i, mergedBody, "headless", false),
    clearLogs: boolFrom($i, mergedBody, "clearLogs", false),
    snapshot: boolFrom($i, mergedBody, "snapshot", true),
    fullPage: boolFrom($i, mergedBody, "fullPage", true),
    failedOnly: boolFrom($i, mergedBody, "failedOnly", true),
    assertNoConsoleErrors: boolFrom($i, mergedBody, "assertNoConsoleErrors", false),
    maxLogs: intFrom($i, mergedBody, "maxLogs", 200, 1000),
    waitMs: intFrom($i, mergedBody, "waitMs", 0, 30000),
    selectorTimeoutMs: intFrom($i, mergedBody, "selectorTimeoutMs", 10000, FOUR_MINUTES_MS),
    maxText: intFrom($i, mergedBody, "maxText", 4000, 30000),
    maxHtml: intFrom($i, mergedBody, "maxHtml", 0, 100000),
    format: valueFrom($i, mergedBody, "format", "png"),
    host: valueFrom($i, mergedBody, "host", ""),
    index: valueFrom($i, mergedBody, "index", ""),
    serverId: valueFrom($i, mergedBody, "serverId", ""),
    spaFallback: boolFrom($i, mergedBody, "spaFallback", false),
    cors: boolFrom($i, mergedBody, "cors", false),
    keepServer: boolFrom($i, mergedBody, "keepServer", false),
    keepSandbox: boolFrom($i, mergedBody, "keepSandbox", false),
    sandboxId: valueFrom($i, mergedBody, "sandboxId", ""),
    entry: valueFrom($i, mergedBody, "entry", ""),
    urlPath: valueFrom($i, mergedBody, "urlPath", ""),
    testCode: preferBodyOr64($i, mergedBody, "testCode", "testCode64"),
    html: preferBodyOr64($i, mergedBody, "html", "html64"),
    actionsJson: preferBodyOr64($i, mergedBody, "actionsJson", "actionsJson64"),
    browserActions: plainStructuredOr64($i, mergedBody, "browserActions", "browserActions64", null),
    pageActions: plainStructuredOr64($i, mergedBody, "pageActions", "pageActions64", null),
    actionsJson: preferBodyOr64($i, mergedBody, "actionsJson", "actionsJson64"),
    browserActions: plainStructuredOr64($i, mergedBody, "browserActions", "browserActions64", null),
    pageActions: plainStructuredOr64($i, mergedBody, "pageActions", "pageActions64", null),
    packageJson: objectBodyOr64($i, mergedBody, "packageJson", "packageJson64", null),
    checkOnly: boolFrom($i, mergedBody, "checkOnly", false),
    workflowName: valueFrom($i, mergedBody, "workflowName", ""),
    workflow: objectBodyOr64($i, mergedBody, "workflow", "workflow64", null),
    steps: arrayBodyOr64($i, mergedBody, "steps", "steps64", []),
    probes: arrayBodyOr64($i, mergedBody, "probes", "probes64", []),
    interactions: arrayBodyOr64($i, mergedBody, "interactions", "interactions64", []),
    returnValues: arrayBodyOr64($i, mergedBody, "returnValues", "returnValues64", []),
    values: arrayBodyOr64($i, mergedBody, "values", "values64", []),
    params: objectBodyOr64($i, mergedBody, "params", "params64", {}),
    maxSteps: intFrom($i, mergedBody, "maxSteps", 50, 100),
    maxIterations: intFrom($i, mergedBody, "maxIterations", 20, 100),
    maxStepOutputChars: intFrom($i, mergedBody, "maxStepOutputChars", 12000, 60000),
    responseMode: valueFrom($i, mergedBody, "responseMode", "inline"),
    maxInlineBytes: intFrom($i, mergedBody, "maxInlineBytes", 12000, 1000000),
    ttlSeconds: intFrom($i, mergedBody, "ttlSeconds", 300, 900),
    page: intFrom($i, mergedBody, "page", 1, 1000000),
    pageSize: intFrom($i, mergedBody, "pageSize", 50, 1000),
    sort: valueFrom($i, mergedBody, "sort", ""),
    order: valueFrom($i, mergedBody, "order", "asc"),
    conversationId: valueFrom($i, mergedBody, "conversationId", ""),
    conversationName: valueFrom($i, mergedBody, "conversationName", valueFrom($i, mergedBody, "conversation", ""))
  };

  for (const key of ["root", "local", "relay", "setTunnelName"]) {
    const value = valueFrom($i, mergedBody, key, "");
    if (value) payload[key === "setTunnelName" ? "tunnelName" : key] = value;
  }

  for (const key of ["tools", "chrome", "commandConfig"]) {
    const value = objectBodyOr64($i, mergedBody, key, key + "64", null);
    if (value) payload[key] = value;
  }

  for (const key of ["allowWrite", "allowSecrets", "enableLocalHttpProxy", "allowCommands"]) {
    const value = boolValue(valueFrom($i, mergedBody, key, undefined));
    if (value !== undefined) payload[key] = value;
  }

  return payload;
}

function actionRequiredScope(action) {
  action = String(action || "");
  if (FS_WORKFLOW_ACTIONS.has(action)) return "tunnel.write";
  if (action.startsWith("mission")) return "tunnel.write";
  if (action.startsWith("command") || action === "nodeScriptRun") return "tunnel.command";
  if (action === "nodeCheck" || action === "nodeCheckTree" || action === "isolatedJsTest" || action === "isolatedNodeCheck") return "tunnel.command";
  if (action.startsWith("chrome") || action === "isolatedHtmlTest") return "tunnel.browser";

  if ([
    "writeIfHash", "bulkWriteIfHashes", "jsonFormat", "mkdirp", "ensureFile", "touch", "copyFile", "copyTree", "moveFile", "moveTree", "deleteFile", "deleteTree", "emptyDir", "staticServerStart", "mkdirp", "ensureFile", "touch", "copyFile", "copyTree", "moveFile", "moveTree", "deleteFile", "deleteTree", "emptyDir",
    "workflowRun", "workflowRun", "configSet", "rootSelect", "openRoot"
  ].includes(action)) return "tunnel.write";

  return "tunnel.read";
}

module.exports = {
  FOUR_MINUTES_MS,
  buildFsPayload,
  actionRequiredScope,
  actionNeedsWrite: action => actionRequiredScope(action) === "tunnel.write"
};



