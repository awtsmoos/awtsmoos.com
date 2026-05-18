// B"H
const { spawn } = require("child_process");
const { safePath, assertNotSecret } = require("./pathGuard.js");

function checkOne(config, rel, timeoutMs, cwd) {
  return new Promise(resolve => {
    const full = safePath(config, rel);
    assertNotSecret(config, full);
    const child = spawn(process.execPath, ["--check", full], { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const killer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);

    child.stdout.on("data", d => stdout += d.toString());
    child.stderr.on("data", d => stderr += d.toString());
    child.on("close", exitCode => {
      clearTimeout(killer);
      resolve({ path: rel, ok: exitCode === 0 && !timedOut, exitCode, timedOut, stdout, stderr });
    });
    child.on("error", e => {
      clearTimeout(killer);
      resolve({ path: rel, ok: false, exitCode: null, timedOut, stdout, stderr: e.message });
    });
  });
}

async function nodeCheckMany(config, payload = {}) {
  const paths = Array.isArray(payload.paths) ? payload.paths : [payload.path || payload.p || "."];
  const limit = Math.min(Number(payload.maxFiles || 50), 200);
  const timeoutMs = Math.max(1000, Math.min(Number(payload.timeoutMs || 20005), 60000));
  const cwd = safePath(config, payload.cwd || ".");
  const results = {};
  for (const rel of paths.slice(0, limit)) results[rel] = await checkOne(config, rel, timeoutMs, cwd);
  const failed = Object.values(results).filter(x => !x.ok).length;
  return { ok: failed === 0, action: "nodeCheckMany", count: Object.keys(results).length, failed, results };
}

module.exports = { nodeCheckMany };
