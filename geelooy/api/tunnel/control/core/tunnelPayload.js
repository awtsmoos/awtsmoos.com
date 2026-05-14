
// B"H

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

function queryValue($i, name, fallback = "") {
  const q = $i.paramKinds?.GET || $i.$_GET || {};
  return q[name] ?? fallback;
}

function actionKind(action) {
  action = String(action || "");

  if (action.startsWith("chrome")) return "chrome";
  if (action.startsWith("command") || action === "nodeScriptRun") return "command";
  return "fs";
}

function buildFsPayload($i) {
  const action = queryValue($i, "action", "list");
  const kind = actionKind(action);
  const p = queryValue($i, "p", queryValue($i, "path", "."));

  const payload = {
    kind,
    action,
    path: p,
    absolutePath: queryValue($i, "absolutePath", ""),
    paths: jsonFrom64(queryValue($i, "paths64"), []),
    files: jsonFrom64(queryValue($i, "files64"), null),
    writes: jsonFrom64(queryValue($i, "writes64"), null),
    depth: Number(queryValue($i, "depth", 2)),
    limit: Number(queryValue($i, "limit", 150)),
    maxChars: Number(queryValue($i, "maxChars", 12000)),
    content: from64(queryValue($i, "content64")),

    command: from64(queryValue($i, "command64")),
    scriptText: from64(queryValue($i, "script64")),
    input: jsonFrom64(queryValue($i, "input64"), {}),
    shell: queryValue($i, "shell", ""),
    cwd: queryValue($i, "cwd", ""),
    timeoutMs: Number(queryValue($i, "timeoutMs", 20000)),

    url: queryValue($i, "url", ""),
    selector: queryValue($i, "selector", ""),
    text: from64(queryValue($i, "text64")),
    expression: from64(queryValue($i, "expression64")),
    script: jsonFrom64(queryValue($i, "script64"), []),
    port: Number(queryValue($i, "port", 9222)),
    chromePath: queryValue($i, "chromePath", ""),
    userDataDir: queryValue($i, "userDataDir", "")
  };

  const root = queryValue($i, "root", "");
  const local = queryValue($i, "local", "");
  const relay = queryValue($i, "relay", "");
  const tunnelName = queryValue($i, "setTunnelName", "");
  const tools = jsonFrom64(queryValue($i, "tools64"), null);
  const chrome = jsonFrom64(queryValue($i, "chrome64"), null);
  const commandConfig = jsonFrom64(queryValue($i, "commandConfig64"), null);

  if (root) payload.root = root;
  if (local) payload.local = local;
  if (relay) payload.relay = relay;
  if (tunnelName) payload.tunnelName = tunnelName;
  if (tools) payload.tools = tools;
  if (chrome) payload.chrome = chrome;
  if (commandConfig) payload.commandConfig = commandConfig;

  const allowWrite = boolValue(queryValue($i, "allowWrite", undefined));
  const allowSecrets = boolValue(queryValue($i, "allowSecrets", undefined));
  const enableLocalHttpProxy = boolValue(queryValue($i, "enableLocalHttpProxy", undefined));
  const allowCommands = boolValue(queryValue($i, "allowCommands", undefined));

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
    action === "configSet" ||
    action === "rootSelect"
  ) {
    return "tunnel.write";
  }

  return "tunnel.read";
}

function actionNeedsWrite(action) {
  return actionRequiredScope(action) === "tunnel.write";
}

module.exports = {
  buildFsPayload,
  actionRequiredScope,
  actionNeedsWrite
};
