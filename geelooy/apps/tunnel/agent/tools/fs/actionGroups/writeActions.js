// B"H
const { writeText, findReplaceText, normalizeWrites } = require("../readWrite.js");
const { replaceRange, applyPatch } = require("../searchEdit.js");
const { writeIfHash, bulkWriteIfHashes } = require("../hashWrite.js");
const { verifyJsFile, verifyJsRuntime } = require("../jsWriteVerifier.js");

async function handleBulkWrite(config, payload, action) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");

  const writes = normalizeWrites(payload);
  const results = {};
  let okCount = 0;

  for (const one of writes) {
    try {
      results[one.path] = await writeText(config, one.path, one.content);
      results[one.path].jsVerification = verifyJsFile(results[one.path].absolutePath, payload);
      results[one.path].runtimeVerification = await verifyJsRuntime(results[one.path].absolutePath, payload);
      okCount++;
    } catch (e) {
      results[one.path] = { ok: false, error: e.message };
    }
  }

  return { ok: true, action, root: config.root, count: writes.length, okCount, results };
}

function buildWriteActions(ctx) {
  const { config, payload } = ctx;
  const action = payload.action || "list";
  const p = payload.path || payload.p || ".";

  return {
    async write() {
      const content = payload.content !== undefined ? payload.content : payload.text;
      const wrote = await writeText(config, p, content ?? "");
      const jsVerification = verifyJsFile(wrote.absolutePath, payload);
      const runtimeVerification = await verifyJsRuntime(wrote.absolutePath, payload);
      return { ok: true, action, root: config.root, ...wrote, jsVerification, runtimeVerification };
    },
    async bulkWrite() { return await handleBulkWrite(config, payload, action); },
    async writeIfHash() { return await writeIfHash(config, payload); },
    async bulkWriteIfHashes() { return await bulkWriteIfHashes(config, payload); },
    async findReplace() { return { root: config.root, ...(await findReplaceText(config, payload)) }; },
    async replaceRange() { return { root: config.root, ...(await replaceRange(config, payload)) }; },
    async applyPatch() { return { root: config.root, ...(await applyPatch(config, payload)) }; }
  };
}

module.exports = { buildWriteActions };
