// B"H
const crypto = require("crypto");
const { sp } = require("../../../../social/helper/_awtsmoos.constants.js");
const { cleanPath, dbPath, splitPath } = require("./path.js");
const { aliasOwned } = require("./aliases.js");
const { readWhole } = require("./listRead.js");

function sha256(text) {
  return crypto.createHash("sha256").update(String(text ?? ""), "utf8").digest("hex");
}

function broadcast($i, packet) {
  try {
    if (!$i.ws?.clients) return;
    const msg = JSON.stringify(packet);
    for (const client of $i.ws.clients) try { client.send?.(msg); } catch (_) {}
  } catch (_) {}
}

async function assertWritable($i, userId, payload, needInner = true) {
  const parsed = splitPath(payload.path || payload.p || ".");
  if (parsed.root || (needInner && !parsed.innerPath)) return { error: { ok: false, status: 400, error: "path_required" } };
  if (!(await aliasOwned($i, userId, parsed.aliasId))) return { error: { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId } };
  return { parsed };
}

async function writeFile($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const wr = await $i.db.write(absolutePath, payload.content ?? "");
  broadcast($i, { type: "AWTSMOOS_OS_CHANGED", action: payload.action || "write", aliasId: got.parsed.aliasId, path: cleanPath(payload.path || "."), at: Date.now() });
  return { ok: true, action: payload.action || "write", path: cleanPath(payload.path || "."), absolutePath, wr };
}

async function makeFolder($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const wr = await $i.db.write(absolutePath);
  broadcast($i, { type: "AWTSMOOS_OS_CHANGED", action: "makeFolder", aliasId: got.parsed.aliasId, path: cleanPath(payload.path || "."), at: Date.now() });
  return { ok: true, action: payload.action || "makeFolder", path: cleanPath(payload.path || "."), absolutePath, wr };
}

async function deletePath($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const deleted = await $i.db.delete(absolutePath);
  broadcast($i, { type: "AWTSMOOS_OS_CHANGED", action: payload.action || "delete", aliasId: got.parsed.aliasId, path: cleanPath(payload.path || "."), at: Date.now() });
  return { ok: true, action: payload.action || "delete", path: cleanPath(payload.path || "."), absolutePath, deleted };
}

async function writeIfHash($i, userId, payload) {
  const current = await readWhole($i, userId, payload.path || payload.p || ".");
  const currentSha = sha256(current.content);
  if (payload.expectedSha256 && payload.expectedSha256 !== currentSha) return { ok: false, action: "writeIfHash", error: "sha256_mismatch", sha256: currentSha, expectedSha256: payload.expectedSha256 };
  const wrote = await writeFile($i, userId, payload);
  return { ...wrote, action: "writeIfHash", previousSha256: currentSha, sha256: sha256(payload.content ?? "") };
}

module.exports = { sha256, writeFile, makeFolder, deletePath, writeIfHash };
