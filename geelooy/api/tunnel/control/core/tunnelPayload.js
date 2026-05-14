
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

/**
 * B"H
 * Builds the filesystem/control payload used by the tunnel agent.
 *
 * Supports:
 * list/tree/read/md/bulk/write/bulkWrite
 * configGet/configSet/roots
 */
function buildFsPayload($i) {
  const action = queryValue($i, "action", "list");
  const p = queryValue($i, "p", queryValue($i, "path", "."));

  const payload = {
    kind: "fs",
    action,
    path: p,
    paths: jsonFrom64(queryValue($i, "paths64"), []),
    files: jsonFrom64(queryValue($i, "files64"), null),
    writes: jsonFrom64(queryValue($i, "writes64"), null),
    depth: Number(queryValue($i, "depth", 2)),
    limit: Number(queryValue($i, "limit", 150)),
    maxChars: Number(queryValue($i, "maxChars", 12000)),
    content: from64(queryValue($i, "content64"))
  };

  const root = queryValue($i, "root", "");
  const local = queryValue($i, "local", "");
  const relay = queryValue($i, "relay", "");
  const tunnelName = queryValue($i, "setTunnelName", "");
  const tools = jsonFrom64(queryValue($i, "tools64"), null);

  if (root) payload.root = root;
  if (local) payload.local = local;
  if (relay) payload.relay = relay;
  if (tunnelName) payload.tunnelName = tunnelName;
  if (tools) payload.tools = tools;

  const allowWrite = boolValue(queryValue($i, "allowWrite", undefined));
  const allowSecrets = boolValue(queryValue($i, "allowSecrets", undefined));
  const enableLocalHttpProxy = boolValue(queryValue($i, "enableLocalHttpProxy", undefined));

  if (allowWrite !== undefined) payload.allowWrite = allowWrite;
  if (allowSecrets !== undefined) payload.allowSecrets = allowSecrets;
  if (enableLocalHttpProxy !== undefined) payload.enableLocalHttpProxy = enableLocalHttpProxy;

  return payload;
}

function actionNeedsWrite(action) {
  return (
    action === "write" ||
    action === "bulkWrite" ||
    action === "configSet"
  );
}

module.exports = {
  buildFsPayload,
  actionNeedsWrite
};
