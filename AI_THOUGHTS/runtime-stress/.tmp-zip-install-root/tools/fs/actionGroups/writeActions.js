// B"H
const { writeText, normalizeWrites } = require("../readWrite.js");
const { replaceRange, applyPatch } = require("../searchEdit.js");
const { writeIfHash, bulkWriteIfHashes } = require("../hashWrite.js");
const { verifyJsFile, verifyJsRuntime } = require("../jsWriteVerifier.js");

/**
 * B"H
 * Chapter 384: The write gate became one door with many modes.
 * Full-file writing remains sacred. Old action names stay alive, while GET
 * callers may use action=write&mode=bulk/hash/bulkHash without learning every
 * alias by heart.
 */
async function handleBulkWrite(config, payload, action) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
  const writes = normalizeWrites(payload);
  const results = {}, order = [];
  let okCount = 0, errorCount = 0;
  for (const one of writes) {
    order.push(one.path);
    try {
      const wrote = await writeText(config, one.path, one.content);
      wrote.jsVerification = verifyJsFile(wrote.absolutePath, payload);
      wrote.runtimeVerification = await verifyJsRuntime(wrote.absolutePath, payload);
      results[one.path] = wrote;
      okCount++;
    } catch (e) {
      results[one.path] = { ok: false, path: one.path, error: e.message };
      errorCount++;
    }
  }
  return { ok: errorCount === 0, action, root: config.root, count: writes.length, okCount, errorCount, partial: errorCount > 0, order, results };
}

async function handleOneWrite(config, payload, action, p) {
  const content = payload.content !== undefined ? payload.content : payload.text;
  const wrote = await writeText(config, p, content ?? "");
  const jsVerification = verifyJsFile(wrote.absolutePath, payload);
  const runtimeVerification = await verifyJsRuntime(wrote.absolutePath, payload);
  return { ok: true, action, root: config.root, ...wrote, jsVerification, runtimeVerification };
}

async function consolidatedWrite(config, payload, action, p) {
  const mode = String(payload.mode || payload.writeMode || "file").trim();
  if (["bulk", "many", "files"].includes(mode)) return await handleBulkWrite(config, payload, "bulkWrite");
  if (["hash", "ifHash", "writeIfHash"].includes(mode)) return await writeIfHash(config, { ...payload, action: "writeIfHash" });
  if (["bulkHash", "bulkIfHash", "bulkWriteIfHashes"].includes(mode)) return await bulkWriteIfHashes(config, { ...payload, action: "bulkWriteIfHashes" });
  return await handleOneWrite(config, payload, action, p);
}

function buildWriteActions(ctx) {
  const { config, payload } = ctx;
  const action = payload.action || "list";
  const p = payload.path || payload.p || ".";
  return {
    async write() { return await consolidatedWrite(config, payload, action, p); },
    async bulkWrite() { return await handleBulkWrite(config, payload, action); },
    async writeIfHash() { return await writeIfHash(config, payload); },
    async bulkWriteIfHashes() { return await bulkWriteIfHashes(config, payload); },
    async replaceRange() { return { root: config.root, ...(await replaceRange(config, payload)) }; },
    async applyPatch() { return { root: config.root, ...(await applyPatch(config, payload)) }; }
  };
}

module.exports = { buildWriteActions, handleBulkWrite, consolidatedWrite };
