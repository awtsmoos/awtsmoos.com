// B"H
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { ROOT } = require("../../lib/config.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SANDBOX_ROOT = path.join(ROOT, "sandboxes");

function id(prefix = "iso-js") {
  return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

async function copyFile(config, sandbox, rel) {
  const src = safePath(config, rel);
  assertNotSecret(config, src);
  const dest = path.join(sandbox, rel);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);
  return { from: rel, to: path.relative(sandbox, dest).replace(/\\/g, "/") };
}

function runNode(cwd, args, timeoutMs, maxChars) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, args, { cwd, windowsHide: true, env: { ...process.env, NODE_ENV: "test" } });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const killer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on("data", d => { stdout += d.toString(); stdout = stdout.slice(-maxChars); });
    child.stderr.on("data", d => { stderr += d.toString(); stderr = stderr.slice(-maxChars); });
    child.on("close", code => {
      clearTimeout(killer);
      resolve({ ok: code === 0 && !timedOut, exitCode: code, timedOut, stdout, stderr });
    });
    child.on("error", e => { clearTimeout(killer); resolve({ ok: false, exitCode: null, timedOut, stdout, stderr: e.message }); });
  });
}

/**
 * B"H
 * Creates a small isolated sandbox, copies explicit files, and runs a Node check or test harness.
 */
function safeEntryName(payload = {}) {
  const candidates = [payload.entry, payload.path, payload.p];
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value || value === "." || value === "./" || value === "\\.") continue;
    return value;
  }
  return "test.js";
}

async function isolatedJsTest(config, payload = {}) {
  const sandboxId = payload.sandboxId || id();
  const sandbox = path.join(SANDBOX_ROOT, sandboxId);
  const files = Array.isArray(payload.files) ? payload.files : [];
  const maxFiles = Math.max(1, Math.min(Number(payload.maxFiles || 50), 200));
  const maxChars = Math.max(1000, Math.min(Number(payload.maxChars || 20000), 100000));
  const timeoutMs = Math.max(1000, Math.min(Number(payload.timeoutMs || 30000), 240000));
  const copied = [];

  await fsp.mkdir(sandbox, { recursive: true });

  for (const rel of files.slice(0, maxFiles)) copied.push(await copyFile(config, sandbox, rel));

  if (payload.packageJson && typeof payload.packageJson === "object") {
    await fsp.writeFile(path.join(sandbox, "package.json"), JSON.stringify(payload.packageJson, null, 2), "utf8");
  }

  const entry = safeEntryName(payload);
  if (payload.testCode) {
    const entryPath = path.join(sandbox, entry);
    await fsp.mkdir(path.dirname(entryPath), { recursive: true });
    await fsp.writeFile(entryPath, String(payload.testCode), "utf8");
  }

  const args = payload.checkOnly === true ? ["--check", entry] : [entry];
  const run = await runNode(sandbox, args, timeoutMs, maxChars);
  const kept = payload.keepSandbox === true;
  if (!kept) await fsp.rm(sandbox, { recursive: true, force: true }).catch(() => {});

  return {
    ok: run.ok,
    action: "isolatedJsTest",
    sandboxId,
    sandbox,
    kept,
    filesCopied: copied.length,
    copied,
    ...run
  };
}

async function isolatedNodeCheck(config, payload = {}) {
  return isolatedJsTest(config, { ...payload, checkOnly: true });
}

async function isolatedCleanup(payload = {}) {
  if (!payload.sandboxId) return { ok: false, action: "isolatedCleanup", error: "missing_sandboxId" };
  const target = path.join(SANDBOX_ROOT, payload.sandboxId);
  await fsp.rm(target, { recursive: true, force: true });
  return { ok: true, action: "isolatedCleanup", sandboxId: payload.sandboxId, removed: true };
}

module.exports = { isolatedJsTest, isolatedNodeCheck, isolatedCleanup, SANDBOX_ROOT };
