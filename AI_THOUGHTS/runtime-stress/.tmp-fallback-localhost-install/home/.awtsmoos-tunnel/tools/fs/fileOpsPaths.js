// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 * Creates one or many directories, like `mkdir -p`, while the Awtsmoos reveals each folder
 * as a bounded vessel inside the approved root.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Directory creation result.
 */
async function mkdirp(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const paths = Array.isArray(payload.paths) && payload.paths.length
    ? payload.paths
    : [payload.path || payload.p].filter(Boolean);

  const results = {};

  for (const p of paths) {
    const full = safePath(config, p);
    assertNotSecret(config, full);
    const existed = fs.existsSync(full);
    await fsp.mkdir(full, { recursive: true });

    results[p] = {
      ok: true,
      path: p,
      absolutePath: full,
      existed,
      created: !existed
    };
  }

  return { ok: true, action: "mkdirp", count: paths.length, results };
}

/**
 * B"H
 * Ensures a file exists, writing initial content only if the vessel is not already present.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Ensure result.
 */
async function ensureFile(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "ensureFile", error: "missing_path" };

  const full = safePath(config, p);
  assertNotSecret(config, full);

  const existed = fs.existsSync(full);

  if (!existed) {
    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, String(payload.content || ""), "utf8");
  }

  const st = await fsp.stat(full);

  return {
    ok: true,
    action: "ensureFile",
    path: p,
    absolutePath: full,
    existed,
    created: !existed,
    bytes: st.size
  };
}

/**
 * B"H
 * Touches a file timestamp, optionally creating the file when missing.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Touch result.
 */
async function touch(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");

  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "touch", error: "missing_path" };

  const full = safePath(config, p);
  assertNotSecret(config, full);

  const existed = fs.existsSync(full);

  if (!existed) {
    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, "", "utf8");
  }

  const now = new Date();
  await fsp.utimes(full, now, now);

  return {
    ok: true,
    action: "touch",
    path: p,
    absolutePath: full,
    existed,
    created: !existed
  };
}

module.exports = { mkdirp, ensureFile, touch };
