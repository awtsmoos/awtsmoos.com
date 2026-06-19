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
  const action = valueFrom($i, body, "action", "list");
  const kind = actionKind(action);
  const p = valueFrom($i, body, "p", valueFrom($i, body, "path", "."));

  const payload = {
    kind,
    action,
    path: p,
    absolutePath: valueFrom($i, body, "absolutePath", ""),
    paths: arrayWithIndexed($i, body, "paths", "paths64", [], {
      prefixes: ["f", "file", "path", "paths"],
      brackets: ["paths", "files"]
    }),
    files: plainStructuredOr64($i, body, "files", "files64", null),
    writes: plainStructuredOr64($i, body, "writes", "writes64", null),
    edits: plainStructuredOr64($i, body, "edits", "edits64", []),
    ranges: arrayBodyOr64($i, body, "ranges", "ranges64", []),

    depth: intFrom($i, body, "depth", 2),
    limit: intFrom($i, body, "limit", 150),
    maxChars: intFrom($i, body, "maxChars", 12000),
    totalMaxChars: intFrom($i, body, "totalMaxChars", 24000),
    maxFiles: intFrom($i, body, "maxFiles", 5, 500),
    maxRanges: intFrom($i, body, "maxRanges", 20, 60),
    maxEntries: intFrom($i, body, "maxEntries", 3000, 20000),
    offsetChars: intFrom($i, body, "offsetChars", 0),
    maxBytes: intFrom($i, body, "maxBytes", 24000),
    offsetBytes: intFrom($i, body, "offsetBytes", 0),
    startLine: intFrom($i, body, "startLine", 1),
    endLine: intFrom($i, body, "endLine", 250),
    maxResults: intFrom($i, body, "maxResults", 80, 500),
    maxFileBytes: intFrom($i, body, "maxFileBytes", 800000),
    sinceMinutes: intFrom($i, body, "sinceMinutes", 120),
    minBytes: intFrom($i, body, "minBytes", 500000),
    modifiedAfterMs: intFrom($i, body, "modifiedAfterMs", 0),
    indent: intFrom($i, body, "indent", 2, 8),

    content: preferBodyOr64($i, body, "content", "content64"),
    find: preferBodyOr64($i, body, "find", "find64"),
    query: preferBodyOr64($i, body, "query", "query64"),
    replace: preferBodyOr64($i, body, "replace", "replace64"),
    expectedSha256: valueFrom($i, body, "expectedSha256", ""),
    sha256: valueFrom($i, body, "sha256", ""),
    ext: valueFrom($i, body, "ext", ""),
    from: valueFrom($i, body, "from", ""),
    to: valueFrom($i, body, "to", ""),
    source: valueFrom($i, body, "source", ""),
    dest: valueFrom($i, body, "dest", ""),
    target: valueFrom($i, body, "target", ""),
    expectedSourceSha256: valueFrom($i, body, "expectedSourceSha256", ""),
    dryRun: boolFrom($i, body, "dryRun", true),
    confirm: boolFrom($i, body, "confirm", false),
    headers: objectBodyOr64($i, body, "headers", "headers64", {}),
    body: preferBodyOr64($i, body, "body", "body64"),
    bodyEncoding: valueFrom($i, body, "bodyEncoding", "utf8"),
    method: valueFrom($i, body, "method", "GET"),
    cookieJarName: valueFrom($i, body, "cookieJarName", ""),
    jar: valueFrom($i, body, "jar", ""),
    useCookies: boolFrom($i, body, "useCookies", true),
    saveCookies: boolFrom($i, body, "saveCookies", true),
    followRedirects: boolFrom($i, body, "followRedirects", true),
    maxRedirects: intFrom($i, body, "maxRedirects", 5, 10),
    responseBodyMode: valueFrom($i, body, "responseBodyMode", "text"),
    saveResponseTo: valueFrom($i, body, "saveResponseTo", valueFrom($i, body, "to", "")),
    includeValues: boolFrom($i, body, "includeValues", false),
    name: valueFrom($i, body, "name", ""),
    value: valueFrom($i, body, "value", ""),
    domain: valueFrom($i, body, "domain", ""),
    path: p,
    expires: valueFrom($i, body, "expires", ""),
    secure: boolFrom($i, body, "secure", false),
    httpOnly: boolFrom($i, body, "httpOnly", false),
    sameSite: valueFrom($i, body, "sameSite", ""),
    storageType: valueFrom($i, body, "storageType", ""),
    localStorage: objectBodyOr64($i, body, "localStorage", "localStorage64", {}),
    sessionStorage: objectBodyOr64($i, body, "sessionStorage", "sessionStorage64", {}),
    cookies: arrayBodyOr64($i, body, "cookies", "cookies64", []),

    regex: boolFrom($i, body, "regex", false),
    replaceAll: boolFrom($i, body, "replaceAll", true),
    includeDirs: boolFrom($i, body, "includeDirs", false),
    write: boolFrom($i, body, "write", false),

    command: preferBodyOr64Alias($i, body, "command", ["commands"], "command64", ["commands64"]),
    scriptText: preferBodyOr64($i, body, "scriptText", "script64"),
    input: objectBodyOr64($i, body, "input", "input64", {}),
    shell: valueFrom($i, body, "shell", ""),
    cwd: valueFrom($i, body, "cwd", ""),
    timeoutMs: intFrom($i, body, "timeoutMs", FOUR_MINUTES_MS, ONE_DAY_MS),

    url: valueFrom($i, body, "url", ""),
    selector: valueFrom($i, body, "selector", ""),
    text: preferBodyOr64($i, body, "text", "text64"),
    expression: preferBodyOr64($i, body, "expression", "expression64"),
    script: arrayBodyOr64($i, body, "script", "script64", []),
    port: intFrom($i, body, "port", 9222, 65535),
    chromePath: valueFrom($i, body, "chromePath", ""),
    userDataDir: valueFrom($i, body, "userDataDir", ""),
    headless: boolFrom($i, body, "headless", false),
    clearLogs: boolFrom($i, body, "clearLogs", false),
    snapshot: boolFrom($i, body, "snapshot", true),
    fullPage: boolFrom($i, body, "fullPage", true),
    failedOnly: boolFrom($i, body, "failedOnly", true),
    assertNoConsoleErrors: boolFrom($i, body, "assertNoConsoleErrors", false),
    maxLogs: intFrom($i, body, "maxLogs", 200, 1000),
    waitMs: intFrom($i, body, "waitMs", 0, 30000),
    selectorTimeoutMs: intFrom($i, body, "selectorTimeoutMs", 10000, FOUR_MINUTES_MS),
    maxText: intFrom($i, body, "maxText", 4000, 30000),
    maxHtml: intFrom($i, body, "maxHtml", 0, 100000),
    format: valueFrom($i, body, "format", "png"),
    host: valueFrom($i, body, "host", ""),
    index: valueFrom($i, body, "index", ""),
    serverId: valueFrom($i, body, "serverId", ""),
    spaFallback: boolFrom($i, body, "spaFallback", false),
    cors: boolFrom($i, body, "cors", false),
    keepServer: boolFrom($i, body, "keepServer", false),
    keepSandbox: boolFrom($i, body, "keepSandbox", false),
    sandboxId: valueFrom($i, body, "sandboxId", ""),
    entry: valueFrom($i, body, "entry", ""),
    urlPath: valueFrom($i, body, "urlPath", ""),
    testCode: preferBodyOr64($i, body, "testCode", "testCode64"),
    html: preferBodyOr64($i, body, "html", "html64"),
    actionsJson: preferBodyOr64($i, body, "actionsJson", "actionsJson64"),
    browserActions: plainStructuredOr64($i, body, "browserActions", "browserActions64", null),
    pageActions: plainStructuredOr64($i, body, "pageActions", "pageActions64", null),
    actionsJson: preferBodyOr64($i, body, "actionsJson", "actionsJson64"),
    browserActions: plainStructuredOr64($i, body, "browserActions", "browserActions64", null),
    pageActions: plainStructuredOr64($i, body, "pageActions", "pageActions64", null),
    packageJson: objectBodyOr64($i, body, "packageJson", "packageJson64", null),
    checkOnly: boolFrom($i, body, "checkOnly", false),
    workflowName: valueFrom($i, body, "workflowName", ""),
    workflow: objectBodyOr64($i, body, "workflow", "workflow64", null),
    steps: arrayBodyOr64($i, body, "steps", "steps64", []),
    probes: arrayBodyOr64($i, body, "probes", "probes64", []),
    interactions: arrayBodyOr64($i, body, "interactions", "interactions64", []),
    returnValues: arrayBodyOr64($i, body, "returnValues", "returnValues64", []),
    values: arrayBodyOr64($i, body, "values", "values64", []),
    params: objectBodyOr64($i, body, "params", "params64", {}),
    maxSteps: intFrom($i, body, "maxSteps", 50, 100),
    maxIterations: intFrom($i, body, "maxIterations", 20, 100),
    maxStepOutputChars: intFrom($i, body, "maxStepOutputChars", 12000, 60000),
    responseMode: valueFrom($i, body, "responseMode", "inline"),
    maxInlineBytes: intFrom($i, body, "maxInlineBytes", 12000, 1000000),
    ttlSeconds: intFrom($i, body, "ttlSeconds", 300, 900),
    page: intFrom($i, body, "page", 1, 1000000),
    pageSize: intFrom($i, body, "pageSize", 50, 1000),
    sort: valueFrom($i, body, "sort", ""),
    order: valueFrom($i, body, "order", "asc"),
    conversationId: valueFrom($i, body, "conversationId", ""),
    conversationName: valueFrom($i, body, "conversationName", valueFrom($i, body, "conversation", ""))
  };

  for (const key of ["root", "local", "relay", "setTunnelName"]) {
    const value = valueFrom($i, body, key, "");
    if (value) payload[key === "setTunnelName" ? "tunnelName" : key] = value;
  }

  for (const key of ["tools", "chrome", "commandConfig"]) {
    const value = objectBodyOr64($i, body, key, key + "64", null);
    if (value) payload[key] = value;
  }

  for (const key of ["allowWrite", "allowSecrets", "enableLocalHttpProxy", "allowCommands"]) {
    const value = boolValue(valueFrom($i, body, key, undefined));
    if (value !== undefined) payload[key] = value;
  }

  return payload;
}

function actionRequiredScope(action) {
  action = String(action || "");
  if (FS_WORKFLOW_ACTIONS.has(action)) return "tunnel.write";
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



