// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 * Hashes file bytes for guarded destructive operations.
 *
 * @param {Buffer|string} data Data.
 * @returns {string} Hex sha256.
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * B"H
 * Blocks operations that would strike the approved root itself.
 *
 * @param {object} config Agent config.
 * @param {string} full Absolute path.
 * @returns {void}
 */
function assertNotRoot(config, full) {
  const root = path.resolve(config.root).toLowerCase();
  const target = path.resolve(full).toLowerCase();

  if (target === root) throw new Error("Refusing to operate on the root itself.");
}

/**
 * B"H
 * Moves or renames one file.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Move result.
 */
async function moveFile(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const from = payload.from || payload.source || payload.path || payload.p;
  const to = payload.to || payload.dest || payload.target;

  if (!from || !to) return { ok: false, action: "moveFile", error: "missing_from_or_to" };

  const src = safePath(config, from);
  const dst = safePath(config, to);
  assertNotSecret(config, src);
  assertNotSecret(config, dst);

  const st = await fsp.stat(src);
  if (!st.isFile()) return { ok: false, action: "moveFile", error: "source_not_file", from };

  if (fs.existsSync(dst) && payload.overwrite !== true) {
    return { ok: false, action: "moveFile", error: "destination_exists", from, to };
  }

  await fsp.mkdir(path.dirname(dst), { recursive: true });
  if (fs.existsSync(dst) && payload.overwrite === true) await fsp.rm(dst, { force: true });
  await fsp.rename(src, dst);

  return { ok: true, action: "moveFile", from, to, bytes: st.size };
}

/**
 * B"H
 * Moves or renames a directory tree, dry-run by default.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Move result.
 */
async function moveTree(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const from = payload.from || payload.source || payload.path || payload.p;
  const to = payload.to || payload.dest || payload.target;

  if (!from || !to) return { ok: false, action: "moveTree", error: "missing_from_or_to" };

  const src = safePath(config, from);
  const dst = safePath(config, to);
  assertNotSecret(config, src);
  assertNotSecret(config, dst);
  assertNotRoot(config, src);

  const st = await fsp.stat(src);
  if (!st.isDirectory()) return { ok: false, action: "moveTree", error: "source_not_directory", from };

  const dryRun = payload.dryRun !== false;
  if (fs.existsSync(dst) && payload.overwrite !== true) {
    return { ok: false, action: "moveTree", error: "destination_exists", from, to, dryRun };
  }

  if (!dryRun) {
    await fsp.mkdir(path.dirname(dst), { recursive: true });
    if (fs.existsSync(dst) && payload.overwrite === true) await fsp.rm(dst, { recursive: true, force: true });
    await fsp.rename(src, dst);
  }

  return { ok: true, action: "moveTree", from, to, dryRun, moved: !dryRun };
}

/**
 * B"H
 * Deletes one file with dry-run and optional hash guard.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Delete result.
 */
async function deleteFile(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "deleteFile", error: "missing_path" };

  const full = safePath(config, p);
  assertNotSecret(config, full);
  assertNotRoot(config, full);

  const data = await fsp.readFile(full);
  const actualSha256 = sha256(data);

  if (payload.expectedSha256 && String(payload.expectedSha256).toLowerCase() !== actualSha256) {
    return { ok: false, action: "deleteFile", error: "hash_mismatch", path: p, actualSha256 };
  }

  const dryRun = payload.dryRun !== false;
  if (!dryRun) await fsp.rm(full, { force: true });

  return { ok: true, action: "deleteFile", path: p, dryRun, deleted: !dryRun, bytes: data.length, sha256: actualSha256 };
}

/**
 * B"H
 * Deletes a directory tree with strong dry-run default and confirmation requirement.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Delete result.
 */
async function deleteTree(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "deleteTree", error: "missing_path" };

  const full = safePath(config, p);
  assertNotSecret(config, full);
  assertNotRoot(config, full);

  const st = await fsp.stat(full);
  if (!st.isDirectory()) return { ok: false, action: "deleteTree", error: "not_directory", path: p };

  const dryRun = payload.dryRun !== false;
  const confirm = payload.confirm === true || payload.confirm === "true";

  if (!dryRun && !confirm) {
    return { ok: false, action: "deleteTree", error: "confirm_required", path: p, dryRun };
  }

  if (!dryRun) await fsp.rm(full, { recursive: true, force: true });

  return { ok: true, action: "deleteTree", path: p, dryRun, confirmed: confirm, deleted: !dryRun };
}

/**
 * B"H
 * Empties a directory while leaving the directory itself standing.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Empty result.
 */
async function emptyDir(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "emptyDir", error: "missing_path" };

  const full = safePath(config, p);
  assertNotSecret(config, full);
  assertNotRoot(config, full);

  const dryRun = payload.dryRun !== false;
  const entries = await fsp.readdir(full);

  if (!dryRun) {
    for (const entry of entries) {
      await fsp.rm(path.join(full, entry), { recursive: true, force: true });
    }
  }

  return { ok: true, action: "emptyDir", path: p, dryRun, entries: entries.length, emptied: !dryRun };
}

module.exports = { moveFile, moveTree, deleteFile, deleteTree, emptyDir };
