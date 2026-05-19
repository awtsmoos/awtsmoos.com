// B"H
const { bodyJson } = require("./bodyPayload.js");

const FOUR_MINUTES_MS = 240000;

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

function intFrom($i, body, name, fallback, max = Number.MAX_SAFE_INTEGER) {
  const n = numberFrom($i, body, name, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.min(Math.floor(n), max)) : fallback;
}

function parseJsonText(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  try { return JSON.parse(String(value)); }
  catch (_e) { return fallback; }
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

function arrayBodyOr64($i, body, plainName, encodedName, fallback = []) {
  if (body && Array.isArray(body[plainName])) return body[plainName];
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return parseJsonText(plainQuery, fallback);
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function objectBodyOr64($i, body, plainName, encodedName, fallback = null) {
  if (body && body[plainName] && typeof body[plainName] === "object") return body[plainName];
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return parseJsonText(plainQuery, fallback);
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function plainStructuredOr64($i, body, plainName, encodedName, fallback = null) {
  if (body && body[plainName] !== undefined) return body[plainName];
  const plainQuery = queryPlainOrUndefined($i, plainName);
  if (plainQuery !== undefined) return String(plainQuery ?? "");
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function boolFrom($i, body, name, fallback = false) {
  const got = boolValue(valueFrom($i, body, name, undefined));
  return got === undefined ? fallback : got;
}

function actionKind(action) {
  action = String(action || "");
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
    paths: plainStructuredOr64($i, body, "paths", "paths64", []),
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

    command: preferBodyOr64($i, body, "command", "command64"),
    scriptText: preferBodyOr64($i, body, "scriptText", "script64"),
    input: objectBodyOr64($i, body, "input", "input64", {}),
    shell: valueFrom($i, body, "shell", ""),
    cwd: valueFrom($i, body, "cwd", ""),
    timeoutMs: intFrom($i, body, "timeoutMs", FOUR_MINUTES_MS, FOUR_MINUTES_MS),

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
    packageJson: objectBodyOr64($i, body, "packageJson", "packageJson64", null),
    checkOnly: boolFrom($i, body, "checkOnly", false),
    workflowName: valueFrom($i, body, "workflowName", ""),
    workflow: objectBodyOr64($i, body, "workflow", "workflow64", null),
    steps: arrayBodyOr64($i, body, "steps", "steps64", []),
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
    order: valueFrom($i, body, "order", "asc")
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
  if (action.startsWith("command") || action === "nodeScriptRun") return "tunnel.command";
  if (action === "nodeCheck" || action === "nodeCheckTree" || action === "isolatedJsTest" || action === "isolatedNodeCheck") return "tunnel.command";
  if (action.startsWith("chrome") || action === "isolatedHtmlTest") return "tunnel.browser";

  if ([
    "write", "bulkWrite", "findReplace", "replaceRange", "applyPatch",
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
