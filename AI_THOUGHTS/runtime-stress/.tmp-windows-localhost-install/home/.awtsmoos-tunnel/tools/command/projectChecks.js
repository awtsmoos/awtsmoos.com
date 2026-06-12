// B"H
const childProcess = require("child_process");
const fsp = require("fs/promises");
const path = require("path");

const { safePath } = require("../fs/pathGuard.js");
const { boundedTimeout } = require("./run.js");

const JS_EXTS = new Set([".js", ".mjs", ".cjs"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache"]);

/**
 * B"H
 * Runs Node's own parser against one file without asking PowerShell to carry the lamp.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Structured syntax result.
 */
async function nodeCheck(config, payload = {}) {
  if (!config.allowCommands || !config.tools.command || !config.command.enabled) {
    return { ok: false, action: "nodeCheck", error: "commands_disabled" };
  }

  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const startedAt = Date.now();
  const timeoutMs = boundedTimeout(payload.timeoutMs, 30000);

  return await new Promise(resolve => {
    childProcess.execFile(
      process.execPath,
      ["--check", full],
      { cwd: path.dirname(full), timeout: timeoutMs, windowsHide: true, maxBuffer: 120000 },
      (err, stdout, stderr) => {
        resolve({
          ok: !err,
          action: "nodeCheck",
          path: p,
          absolutePath: full,
          exitCode: err?.code ?? 0,
          durationMs: Date.now() - startedAt,
          timeoutMs,
          stdout: String(stdout || ""),
          stderr: String(stderr || ""),
          error: err ? err.message : null
        });
      }
    );
  });
}

/**
 * B"H
 * Finds JavaScript files under a folder and checks them one by one with Node's parser.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Tree syntax result.
 */
async function nodeCheckTree(config, payload = {}) {
  const rootRel = payload.path || payload.p || ".";
  const rootFull = safePath(config, rootRel);
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 120), 500));
  const files = [];

  async function walk(full) {
    if (files.length >= maxFiles) return;

    const entries = await fsp.readdir(full, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) return;

      const next = path.join(full, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(next);
        continue;
      }

      if (entry.isFile() && JS_EXTS.has(path.extname(entry.name).toLowerCase())) {
        files.push(path.relative(config.root, next).replace(/\\/g, "/"));
      }
    }
  }

  await walk(rootFull);

  const results = [];
  for (const file of files) {
    const result = await nodeCheck(config, { ...payload, path: file, timeoutMs: payload.timeoutMs || 30000 });
    results.push(result);
  }

  const failed = results.filter(x => !x.ok);

  return {
    ok: failed.length === 0,
    action: "nodeCheckTree",
    path: rootRel,
    absolutePath: rootFull,
    checked: results.length,
    maxFiles,
    partial: files.length >= maxFiles,
    failedCount: failed.length,
    results
  };
}

module.exports = { nodeCheck, nodeCheckTree };
