
// B"H
const { bodyJson } = require("./bodyPayload.js");

function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

function jsonFrom64(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(from64(value)); }
  catch (e) { return fallback; }
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
  const q = queryMap($i);
  return q[name] ?? fallback;
}

function numberFrom($i, body, name, fallback) {
  const raw = valueFrom($i, body, name, undefined);
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function intFrom($i, body, name, fallback) {
  const n = numberFrom($i, body, name, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function actionKind(action) {
  action = String(action || "");
  if (action.startsWith("chrome")) return "chrome";
  if (action.startsWith("command") || action === "nodeScriptRun") return "command";
  return "fs";
}

function preferBodyOr64($i, body, plainName, encodedName, fallback = "") {
  if (body && body[plainName] !== undefined) return String(body[plainName] ?? "");
  return from64(queryValue($i, encodedName, "")) || fallback;
}

function arrayBodyOr64($i, body, plainName, encodedName, fallback = []) {
  if (body && Array.isArray(body[plainName])) return body[plainName];
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

function objectBodyOr64($i, body, plainName, encodedName, fallback = null) {
  if (body && body[plainName] && typeof body[plainName] === "object") return body[plainName];
  return jsonFrom64(queryValue($i, encodedName), fallback);
}

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
    paths: arrayBodyOr64($i, body, "paths", "paths64", []),
    files: objectBodyOr64($i, body, "files", "files64", null),
    writes: arrayBodyOr64($i, body, "writes", "writes64", null),
    edits: arrayBodyOr64($i, body, "edits", "edits64", []),

    depth: intFrom($i, body, "depth", 2),
    limit: intFrom($i, body, "limit", 150),
    maxChars: intFrom($i, body, "maxChars", 12000),
    totalMaxChars: intFrom($i, body, "totalMaxChars", 24000),
    maxFiles: intFrom($i, body, "maxFiles", 5),
    offsetChars: intFrom($i, body, "offsetChars", 0),
    maxBytes: intFrom($i, body, "maxBytes", 24000),
    offsetBytes: intFrom($i, body, "offsetBytes", 0),
    startLine: intFrom($i, body, "startLine", 1),
    endLine: intFrom($i, body, "endLine", 250),
    maxResults: intFrom($i, body, "maxResults", 80),
    maxFileBytes: intFrom($i, body, "maxFileBytes", 800000),

    content: preferBodyOr64($i, body, "content", "content64"),
    find: preferBodyOr64($i, body, "find", "find64"),
    query: preferBodyOr64($i, body, "query", "query64"),
    replace: preferBodyOr64($i, body, "replace", "replace64"),
    regex: boolValue(valueFrom($i, body, "regex", false)) || false,
    replaceAll: boolValue(valueFrom($i, body, "replaceAll", true)) !== false,

    command: preferBodyOr64($i, body, "command", "command64"),
    scriptText: preferBodyOr64($i, body, "scriptText", "script64"),
    input: objectBodyOr64($i, body, "input", "input64", {}),
    shell: valueFrom($i, body, "shell", ""),
    cwd: valueFrom($i, body, "cwd", ""),
    timeoutMs: intFrom($i, body, "timeoutMs", 20000),

    url: valueFrom($i, body, "url", ""),
    selector: valueFrom($i, body, "selector", ""),
    text: preferBodyOr64($i, body, "text", "text64"),
    expression: preferBodyOr64($i, body, "expression", "expression64"),
    script: arrayBodyOr64($i, body, "script", "script64", []),
    port: intFrom($i, body, "port", 9222),
    chromePath: valueFrom($i, body, "chromePath", ""),
    userDataDir: valueFrom($i, body, "userDataDir", "")
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
  if (action.startsWith("chrome")) return "tunnel.browser";

  if ([
    "write", "bulkWrite", "findReplace", "replaceRange", "applyPatch",
    "configSet", "rootSelect", "openRoot"
  ].includes(action)) return "tunnel.write";

  return "tunnel.read";
}

module.exports = {
  buildFsPayload,
  actionRequiredScope,
  actionNeedsWrite: action => actionRequiredScope(action) === "tunnel.write"
};
