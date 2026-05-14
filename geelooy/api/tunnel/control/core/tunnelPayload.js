
// B"H

const { bodyJson } = require("./bodyPayload.js");

function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

function jsonFrom64(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(from64(value));
  } catch (e) {
    return fallback;
  }
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

  if (body && body[name] !== undefined && body[name] !== null) {
    return body[name];
  }

  return q[name] ?? fallback;
}

function queryValue($i, name, fallback = "") {
  const q = queryMap($i);
  return q[name] ?? fallback;
}

function numberFrom($i, body, name, fallback, min, max) {
  const raw = Number(valueFrom($i, body, name, fallback));
  const n = Number.isFinite(raw) ? raw : fallback;

  return Math.max(min, Math.min(max, n));
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

    paths: body.paths || jsonFrom64(queryValue($i, "paths64"), []),
    files: body.files || jsonFrom64(queryValue($i, "files64"), null),
    writes: body.writes || jsonFrom64(queryValue($i, "writes64"), null),

    depth: numberFrom($i, body, "depth", 2, 0, 4),
    limit: numberFrom($i, body, "limit", 150, 1, 600),

    maxChars: numberFrom($i, body, "maxChars", 12000, 500, 30000),
    totalMaxChars: numberFrom($i, body, "totalMaxChars", 24000, 1000, 60000),
    maxFiles: numberFrom($i, body, "maxFiles", 5, 1, 10),
    offsetChars: numberFrom($i, body, "offsetChars", 0, 0, 5000000),

    maxBytes: numberFrom($i, body, "maxBytes", 24000, 512, 120000),
    offsetBytes: numberFrom($i, body, "offsetBytes", 0, 0, 100000000),

    content: preferBodyOr64($i, body, "content", "content64"),
    find: preferBodyOr64($i, body, "find", "find64"),
    replace: preferBodyOr64($i, body, "replace", "replace64"),
    regex: boolValue(valueFrom($i, body, "regex", false)) || false,
    replaceAll: boolValue(valueFrom($i, body, "replaceAll", true)) !== false,

    command: preferBodyOr64($i, body, "command", "command64"),
    scriptText: preferBodyOr64($i, body, "scriptText", "script64"),
    input: body.input || jsonFrom64(queryValue($i, "input64"), {}),
    shell: valueFrom($i, body, "shell", ""),
    cwd: valueFrom($i, body, "cwd", ""),
    timeoutMs: numberFrom($i, body, "timeoutMs", 20000, 1000, 30000),

    url: valueFrom($i, body, "url", ""),
    selector: valueFrom($i, body, "selector", ""),
    text: preferBodyOr64($i, body, "text", "text64"),
    expression: preferBodyOr64($i, body, "expression", "expression64"),
    script: body.script || jsonFrom64(queryValue($i, "script64"), []),
    port: numberFrom($i, body, "port", 9222, 1, 65535),
    chromePath: valueFrom($i, body, "chromePath", ""),
    userDataDir: valueFrom($i, body, "userDataDir", "")
  };

  const root = valueFrom($i, body, "root", "");
  const local = valueFrom($i, body, "local", "");
  const relay = valueFrom($i, body, "relay", "");
  const tunnelName = valueFrom($i, body, "setTunnelName", "");
  const tools = body.tools || jsonFrom64(queryValue($i, "tools64"), null);
  const chrome = body.chrome || jsonFrom64(queryValue($i, "chrome64"), null);
  const commandConfig = body.commandConfig || jsonFrom64(queryValue($i, "commandConfig64"), null);

  if (root) payload.root = root;
  if (local) payload.local = local;
  if (relay) payload.relay = relay;
  if (tunnelName) payload.tunnelName = tunnelName;
  if (tools) payload.tools = tools;
  if (chrome) payload.chrome = chrome;
  if (commandConfig) payload.commandConfig = commandConfig;

  const allowWrite = boolValue(valueFrom($i, body, "allowWrite", undefined));
  const allowSecrets = boolValue(valueFrom($i, body, "allowSecrets", undefined));
  const enableLocalHttpProxy = boolValue(valueFrom($i, body, "enableLocalHttpProxy", undefined));
  const allowCommands = boolValue(valueFrom($i, body, "allowCommands", undefined));

  if (allowWrite !== undefined) payload.allowWrite = allowWrite;
  if (allowSecrets !== undefined) payload.allowSecrets = allowSecrets;
  if (enableLocalHttpProxy !== undefined) payload.enableLocalHttpProxy = enableLocalHttpProxy;
  if (allowCommands !== undefined) payload.allowCommands = allowCommands;

  return payload;
}

function actionRequiredScope(action) {
  action = String(action || "");

  if (action.startsWith("command") || action === "nodeScriptRun") return "tunnel.command";
  if (action.startsWith("chrome")) return "tunnel.browser";

  if (
    action === "write" ||
    action === "bulkWrite" ||
    action === "findReplace" ||
    action === "configSet" ||
    action === "rootSelect"
  ) {
    return "tunnel.write";
  }

  return "tunnel.read";
}

module.exports = {
  buildFsPayload,
  actionRequiredScope,
  actionNeedsWrite: action => actionRequiredScope(action) === "tunnel.write"
};
