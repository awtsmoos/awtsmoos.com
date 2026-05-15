// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP_DIRS = new Set([".git", "node_modules"]);

/**
 * B"H
 * Seals bytes with sha256 so copy operations can report what passed through the gate.
 *
 * @param {Buffer|string} data Data to hash.
 * @returns {string} Hex sha256.
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * B"H
 * Checks if a path is safely below another path.
 *
 * @param {string} parent Parent path.
 * @param {string} child Child path.
 * @returns {boolean} Whether child is inside parent.
 */
function inside(parent, child) {
  const rel = path.relative(parent, child);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * B"H
 * Copies one file with optional overwrite and source hash guard.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Copy result.
 */
async function copyFileNative(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const from = payload.from || payload.source || payload.path || payload.p;
  const to = payload.to || payload.dest || payload.target;

  if (!from || !to) return { ok: false, action: "copyFile", error: "missing_from_or_to" };

  const src = safePath(config, from);
  const dst = safePath(config, to);
  assertNotSecret(config, src);
  assertNotSecret(config, dst);

  const data = await fsp.readFile(src);
  const sourceSha256 = sha256(data);

  if (payload.expectedSourceSha256 && String(payload.expectedSourceSha256).toLowerCase() !== sourceSha256) {
    return { ok: false, action: "copyFile", error: "source_hash_mismatch", from, to, sourceSha256 };
  }

  if (fs.existsSync(dst) && payload.overwrite !== true) {
    return { ok: false, action: "copyFile", error: "destination_exists", from, to };
  }

  await fsp.mkdir(path.dirname(dst), { recursive: true });
  await fsp.copyFile(src, dst);

  const destinationSha256 = sha256(await fsp.readFile(dst));

  return {
    ok: true,
    action: "copyFile",
    from,
    to,
    sourceAbsolutePath: src,
    destinationAbsolutePath: dst,
    bytes: data.length,
    sourceSha256,
    destinationSha256
  };
}

/**
 * B"H
 * Walks a source tree and returns bounded file copy candidates.
 *
 * @param {string} root Source root.
 * @param {object} options Limits.
 * @returns {Promise<object>} Walk result.
 */
async function collectTree(root, options = {}) {
  const maxFiles = Math.max(1, Math.min(Number(options.maxFiles || 1000), 10000));
  const maxBytes = Math.max(1, Number(options.maxBytes || 200 * 1024 * 1024));
  const files = [];
  let totalBytes = 0;
  let dirs = 0;
  let partial = false;

  async function walk(dir) {
    if (partial) return;
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (partial) return;

      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) && options.includeSkipped !== true) continue;
        dirs++;
        await walk(full);
        continue;
      }

      if (!entry.isFile()) continue;

      const st = await fsp.stat(full);
      if (files.length >= maxFiles || totalBytes + st.size > maxBytes) {
        partial = true;
        return;
      }

      files.push({ full, rel, bytes: st.size });
      totalBytes += st.size;
    }
  }

  await walk(root);
  return { files, dirs, totalBytes, partial, maxFiles, maxBytes };
}

/**
 * B"H
 * Copies a whole tree with dry-run preview by default, bounded by file and byte limits.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Tree copy result.
 */
async function copyTree(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const from = payload.from || payload.source || payload.path || payload.p;
  const to = payload.to || payload.dest || payload.target;

  if (!from || !to) return { ok: false, action: "copyTree", error: "missing_from_or_to" };

  const srcRoot = safePath(config, from);
  const dstRoot = safePath(config, to);
  assertNotSecret(config, srcRoot);
  assertNotSecret(config, dstRoot);

  const srcStat = await fsp.stat(srcRoot);
  if (!srcStat.isDirectory()) return { ok: false, action: "copyTree", error: "source_not_directory", from };

  if (inside(srcRoot, dstRoot)) {
    return { ok: false, action: "copyTree", error: "destination_inside_source_blocked", from, to };
  }

  const walk = await collectTree(srcRoot, payload);
  const dryRun = payload.dryRun !== false;
  const overwrite = payload.overwrite === true;
  const conflicts = [];
  const copied = [];

  for (const file of walk.files) {
    const dst = path.join(dstRoot, file.rel);
    if (fs.existsSync(dst) && !overwrite) conflicts.push(file.rel);
  }

  if (conflicts.length && !dryRun) {
    return { ok: false, action: "copyTree", error: "conflicts", from, to, conflicts: conflicts.slice(0, 200), conflictCount: conflicts.length };
  }

  if (!dryRun) {
    await fsp.mkdir(dstRoot, { recursive: true });

    for (const file of walk.files) {
      const dst = path.join(dstRoot, file.rel);
      await fsp.mkdir(path.dirname(dst), { recursive: true });
      await fsp.copyFile(file.full, dst);
      copied.push(file.rel);
    }
  }

  return {
    ok: true,
    action: "copyTree",
    from,
    to,
    dryRun,
    overwrite,
    files: walk.files.length,
    dirs: walk.dirs,
    bytes: walk.totalBytes,
    partial: walk.partial,
    conflicts: conflicts.slice(0, 200),
    conflictCount: conflicts.length,
    copied: dryRun ? [] : copied.slice(0, 500)
  };
}

module.exports = { copyFileNative, copyTree };
