// B"H
const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 * Makes a sha256 seal for bytes so edits can be guarded from stale overwrite.
 *
 * @param {Buffer|string} data Data to hash.
 * @returns {string} Hex sha256.
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * B"H
 * Returns hashes for one or many files.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Hash result.
 */
async function fileHashes(config, payload = {}) {
  const paths = Array.isArray(payload.paths) && payload.paths.length
    ? payload.paths
    : [payload.path || payload.p || "."];

  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 50), 200));
  const results = {};

  for (const p of paths.slice(0, maxFiles)) {
    try {
      const full = safePath(config, p);
      assertNotSecret(config, full);
      const buf = await fsp.readFile(full);
      results[p] = {
        ok: true,
        path: p,
        absolutePath: full,
        bytes: buf.length,
        sha256: sha256(buf)
      };
    } catch (e) {
      results[p] = { ok: false, path: p, error: e.message };
    }
  }

  return {
    ok: Object.values(results).every(x => x.ok),
    action: "fileHashes",
    count: Object.keys(results).length,
    partial: paths.length > maxFiles,
    results
  };
}

/**
 * B"H
 * Writes one complete file only when its current hash matches expectation.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Write result.
 */
async function writeIfHash(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  const expected = String(payload.expectedSha256 || payload.sha256 || "").toLowerCase();
  content = String(payload.content || "");

  if (!p) return { ok: false, action: "writeIfHash", error: "missing_path" };
  if (!expected) return { ok: false, action: "writeIfHash", error: "missing_expectedSha256" };

  const full = safePath(config, p);
  assertNotSecret(config, full);

  const before = await fsp.readFile(full);
  const actual = sha256(before);

  if (actual.toLowerCase() !== expected) {
    return { ok: false, action: "writeIfHash", error: "hash_mismatch", path: p, expectedSha256: expected, actualSha256: actual };
  }

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content, "utf8");

  return {
    ok: true,
    action: "writeIfHash",
    path: p,
    absolutePath: full,
    beforeSha256: actual,
    afterSha256: sha256(Buffer.from(content, "utf8")),
    bytes: Buffer.byteLength(content, "utf8")
  };
}

/**
 * B"H
 * Writes multiple complete files with hash guards.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Batch result.
 */
async function bulkWriteIfHashes(config, payload = {}) {
  const files = payload.files && typeof payload.files === "object" ? payload.files : {};
  const entries = Object.entries(files);
  const results = {};
  let okCount = 0;

  for (const [p, spec] of entries) {
    const res = await writeIfHash(config, {
      path: p,
      expectedSha256: spec.expectedSha256 || spec.sha256,
      content: spec.content || ""
    });
    results[p] = res;
    if (res.ok) okCount++;
  }

  return {
    ok: okCount === entries.length,
    action: "bulkWriteIfHashes",
    count: entries.length,
    okCount,
    results
  };
}

module.exports = { sha256, fileHashes, writeIfHash, bulkWriteIfHashes };
