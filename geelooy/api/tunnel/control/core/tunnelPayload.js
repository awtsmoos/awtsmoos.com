
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

function queryValue($i, name, fallback = "") {
  const q = $i.paramKinds?.GET || $i.$_GET || {};
  return q[name] ?? fallback;
}

/**
 * B"H
 * Builds the filesystem payload used by the tunnel agent.
 *
 * Supports:
 * action=list|tree|read|md|bulk|write|bulkWrite
 * p/path
 * paths64
 * files64
 * writes64
 * content64
 */
function buildFsPayload($i) {
  const action = queryValue($i, "action", "list");
  const p = queryValue($i, "p", queryValue($i, "path", "."));

  return {
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
}

function actionNeedsWrite(action) {
  return action === "write" || action === "bulkWrite";
}

module.exports = {
  buildFsPayload,
  actionNeedsWrite
};
