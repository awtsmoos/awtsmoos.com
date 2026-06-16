// B"H
const crypto = require("crypto");
const { sp } = require("../../../../social/helper/_awtsmoos.constants.js");
const { cleanPath, dbPath, splitPath } = require("./path.js");
const { aliasOwned } = require("./aliases.js");
const { publicUrlReport } = require("./publicUrls.js");
const { readWhole } = require("./listRead.js");
const { syntaxAfterWrite } = require("./syntaxAfterWrite.js");

/**
 * B"H
 * Chapter 30: Every hosted write now carries a public-route lantern.
 */
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

function changedPacket(action, parsed, payload) {
  return { type: "AWTSMOOS_OS_CHANGED", action, aliasId: parsed.aliasId, path: cleanPath(payload.path || payload.p || "."), publicUrl: publicUrlReport(payload, parsed), at: Date.now() };
}

async function writeFile($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const wr = await $i.db.write(absolutePath, payload.content ?? "");
  const publicUrl = publicUrlReport(payload, got.parsed);
  broadcast($i, changedPacket(payload.action || "write", got.parsed, payload));
  const syntax = syntaxAfterWrite(absolutePath);
  return { ok: true, action: payload.action || "write", path: cleanPath(payload.path || payload.p || "."), absolutePath, wr, publicUrl, ...(syntax ? { syntax } : {}) };
}

async function makeFolder($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const wr = await $i.db.write(absolutePath);
  const publicUrl = publicUrlReport(payload, got.parsed);
  broadcast($i, changedPacket("makeFolder", got.parsed, payload));
  return { ok: true, action: payload.action || "makeFolder", path: cleanPath(payload.path || payload.p || "."), absolutePath, wr, publicUrl };
}

async function deletePath($i, userId, payload) {
  const got = await assertWritable($i, userId, payload);
  if (got.error) return got.error;
  const absolutePath = dbPath(sp, got.parsed.aliasId, got.parsed.innerPath);
  const deleted = await $i.db.delete(absolutePath);
  const publicUrl = publicUrlReport(payload, got.parsed);
  broadcast($i, changedPacket(payload.action || "delete", got.parsed, payload));
  return { ok: true, action: payload.action || "delete", path: cleanPath(payload.path || payload.p || "."), absolutePath, deleted, publicUrl };
}

async function writeIfHash($i, userId, payload) {
  const current = await readWhole($i, userId, payload.path || payload.p || ".");
  const currentSha = sha256(current.content);
  if (payload.expectedSha256 && payload.expectedSha256 !== currentSha) return { ok: false, action: "writeIfHash", error: "sha256_mismatch", sha256: currentSha, expectedSha256: payload.expectedSha256 };
  const wrote = await writeFile($i, userId, payload);
  return { ...wrote, action: "writeIfHash", previousSha256: currentSha, sha256: sha256(payload.content ?? "") };
}

module.exports = { sha256, writeFile, makeFolder, deletePath, writeIfHash };
