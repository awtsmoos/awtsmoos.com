// B"H
const { cleanPath } = require("./path.js");
const { listFolder, readFile, readWhole } = require("./listRead.js");
const { writeFile, writeIfHash, sha256 } = require("./writeOps.js");
const { parsePlainList, parsePlainWrites, describePlainWrites } = require("./plainPayload.js");

/**
 * Chapter 483: Hosted bulk writes stopped saying yes to nothing.
 * The Virtual OS now parses native-style carriers and reports payload shape;
 * if no writes emerge, it returns a clear parse failure instead of ok/count:0.
 */
function bulkPathList(payload = {}) {
  const direct = Array.isArray(payload.paths) ? payload.paths : [];
  if (direct.length) return direct;
  const fromFiles = parsePlainList(payload.files);
  if (fromFiles.length) return fromFiles;
  return parsePlainList(payload.path && payload.path !== "." ? payload.path : payload.p);
}

async function bulk($i, userId, payload) {
  const files = {};
  const paths = bulkPathList(payload);
  const maxFiles = Number(payload.maxFiles || 5);
  const totalMaxChars = Number(payload.totalMaxChars || 24000);
  let usedChars = 0, stoppedBecause = null;
  for (const one of paths.slice(0, maxFiles)) {
    const path = typeof one === "string" ? one : one.path;
    const remaining = Math.max(0, totalMaxChars - usedChars);
    if (!remaining) { stoppedBecause = "totalMaxChars"; break; }
    try {
      const got = await readFile($i, userId, { ...payload, path, maxChars: Math.min(Number(one.maxChars || payload.maxChars || 12000), remaining) });
      usedChars += String(got.content || "").length;
      files[path] = got;
    } catch (e) { files[path] = { ok: false, path, error: e.message }; }
  }
  return { ok: true, action: "bulk", requestedCount: paths.length, returnedCount: Object.keys(files).length, skippedCount: Math.max(0, paths.length - Object.keys(files).length), usedChars, maxFiles, totalMaxChars, partial: Object.keys(files).length < paths.length, stoppedBecause, files };
}

async function bulkWrite($i, userId, payload) {
  const writes = parsePlainWrites(payload);
  const payloadShape = describePlainWrites(payload);
  if (!writes.length) return { ok: false, action: "bulkWrite", error: "no_writes_parsed", count: 0, payloadShape, guidance: "Use writes/files as an array, object map, JSON string, or XML <file path=...><content>...</content></file>." };
  const results = {};
  let okCount = 0, errorCount = 0;
  for (const w of writes) {
    const got = await writeFile($i, userId, { ...payload, path: w.path, content: w.content ?? "" });
    results[w.path] = got;
    got.ok === false ? errorCount++ : okCount++;
  }
  return { ok: errorCount === 0, action: "bulkWrite", count: writes.length, okCount, errorCount, partial: errorCount > 0, payloadShape, results };
}

async function bulkWriteIfHashes($i, userId, payload) {
  const writes = parsePlainWrites(payload);
  const payloadShape = describePlainWrites(payload);
  if (!writes.length) return { ok: false, action: "bulkWriteIfHashes", error: "no_writes_parsed", count: 0, payloadShape };
  const results = {};
  let okCount = 0, errorCount = 0;
  for (const w of writes) {
    const got = await writeIfHash($i, userId, { ...payload, ...w });
    results[w.path] = got;
    got.ok === false ? errorCount++ : okCount++;
  }
  return { ok: errorCount === 0, action: "bulkWriteIfHashes", count: writes.length, okCount, errorCount, partial: errorCount > 0, payloadShape, results };
}

async function fileHashes($i, userId, payload) {
  const paths = Array.isArray(payload.paths) ? payload.paths : (parsePlainList(payload.paths || payload.files || payload.path || payload.p) || ["."]);
  const files = {};
  for (const path of paths) {
    const got = await readWhole($i, userId, path);
    files[path] = { ok: true, path: cleanPath(path), sha256: sha256(got.content), bytes: Buffer.byteLength(got.content, "utf8") };
  }
  return { ok: true, action: "fileHashes", files };
}

async function tree($i, userId, payload) {
  const depth = Number(payload.depth || 2);
  const limit = Number(payload.limit || 150);
  let count = 0;
  const walk = async (path, prefix, level) => {
    if (count++ >= limit) return prefix + "...limit reached\n";
    if (level > depth) return "";
    const res = await listFolder($i, userId, { ...payload, path });
    if (res.ok === false) return prefix + `[error: ${res.error}]\n`;
    let out = "";
    for (const item of res.detailedItems || []) {
      out += `${prefix}${item.name}${item.isDirectory ? "/" : ""}\n`;
      if (item.isDirectory) out += await walk(item.path, prefix + "  ", level + 1);
    }
    return out;
  };
  return { ok: true, action: "tree", path: cleanPath(payload.path || "."), treeText: await walk(payload.path || ".", "", 0) };
}

module.exports = { bulk, bulkWrite, bulkWriteIfHashes, fileHashes, tree };
