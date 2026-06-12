// B"H
const { execFile } = require("child_process");
const path = require("path");
const { safePath } = require("../fs/pathGuard.js");
const { boundedTimeout } = require("./run.js");

function runNode(args, cwd, timeoutMs) {
  return new Promise(resolve => {
    execFile(process.execPath, args, {
      cwd,
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 200000
    }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        exitCode: err?.code ?? 0,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        error: err ? err.message : null
      });
    });
  });
}

function limitedArray(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

/**
 * B"H
 * The AI asks the agent to verify a handful of vessels without summoning a shell.
 * Syntax checks, module loads, and miniature smoke scripts run directly in Node.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Structured test results.
 */
async function instantTests(config, payload = {}) {
  const timeoutMs = boundedTimeout(payload.timeoutMs, 30000);
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 80), 300));
  const syntax = [];
  const requires = [];
  const smokes = [];
  const cwd = safePath(config, payload.cwd || ".");

  for (const rel of limitedArray(payload.syntax, maxFiles)) {
    const full = safePath(config, rel);
    syntax.push({ path: rel, ...await runNode(["--check", full], cwd, timeoutMs) });
  }

  for (const rel of limitedArray(payload.requires, maxFiles)) {
    const full = safePath(config, rel);
    const code = "require(" + JSON.stringify(full) + "); console.log('OK')";
    requires.push({ path: rel, ...await runNode(["-e", code], cwd, timeoutMs) });
  }

  for (const one of limitedArray(payload.smokes, maxFiles)) {
    const code = String(one.code || "");
    if (!code.trim()) continue;
    smokes.push({ name: one.name || "smoke", ...await runNode(["-e", code], cwd, timeoutMs) });
  }

  const all = [...syntax, ...requires, ...smokes];
  const failed = all.filter(x => !x.ok);

  return {
    ok: failed.length === 0,
    action: "instantTests",
    cwd: path.relative(config.root, cwd).replace(/\\/g, "/") || ".",
    count: all.length,
    failed: failed.length,
    syntax,
    requires,
    smokes
  };
}

module.exports = { instantTests };
