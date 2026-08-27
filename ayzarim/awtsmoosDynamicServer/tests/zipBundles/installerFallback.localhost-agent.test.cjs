// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { maybeSendBundle } = require("../../zipBundles/bundleRoute.js");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");
const { sourceFileFor } = require("../../zipBundles/sourceResolver.js");

/**
 * B"H
 * Chapter 415: The ZIP bridge was broken on purpose, and the old thousand-file
 * footpath still carried the agent into a sandbox that answered requests.
 */
const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, "geelooy");
const agentRoot = path.join(publicRoot, "apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.txt");
const sandbox = path.join(repoRoot, "AI_THOUGHTS/runtime-stress/.tmp-fallback-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const apiPort = 3989;

function powershellCommand() {
  for (const cmd of ["powershell.exe", "pwsh", "powershell"]) {
    const probe = spawnSync(cmd, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
    if (probe.status === 0) return cmd;
  }
  return null;
}
function responseAdapter(res) { return { statusCode: 200, setHeader: (k, v) => res.setHeader(k, v), end: body => res.end(body) }; }
function safePublicFile(rel) {
  const urlPath = rel.replace(/^\/+/, "");
  if (urlPath.startsWith("apps/tunnel/agent/")) return path.join(agentRoot, urlPath.slice("apps/tunnel/agent/".length));
  if (urlPath.startsWith("ai/")) return sourceFileFor(agentRoot, urlPath);
  const full = path.resolve(publicRoot, urlPath);
  assert.ok(!path.relative(publicRoot, full).startsWith(".."), "unsafe path");
  return full;
}
function localServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1:8081");
      if (url.pathname === "/api/tunnel/install/bundle-manifest") {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: true, files: 1, bundles: [{ name: "agent", url: "/api/tunnel/install/agent.zip" }] }));
        return;
      }
      if (url.pathname === "/api/tunnel/install/agent.zip") {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: false, code: "ROUTE_ERROR" }));
        return;
      }
      if (url.pathname === "/apps/tunnel/agent/manifest.txt" && url.searchParams.get("bundle") === "manifest") {
        const sent = await maybeSendBundle({ filePath: manifestPath, dependencies: { fs: fsp, request: { method: "GET", socket: { remoteAddress: "fallback-test" }, headers: {}, yeser: {} }, response: responseAdapter(res), paramKinds: { GET: Object.fromEntries(url.searchParams.entries()) } } });
        if (!sent) { res.statusCode = 500; res.end("bundle manifest not sent"); }
        return;
      }
      if (url.searchParams.get("bundle") === "zip") { res.statusCode = 503; res.end("intentional zip failure"); return; }
      const full = safePublicFile(url.pathname);
      if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.statusCode = 404; res.end("missing " + url.pathname); return; }
      res.end(fs.readFileSync(full));
    } catch (error) { res.statusCode = 500; res.end(error.stack || error.message); }
  });
}
function runPowerShell(command, script) {
  return new Promise((resolve, reject) => {
    const ps = spawn(command, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { cwd: repoRoot, env: { ...process.env, USERPROFILE: home, AWTSMOOS_INSTALL_ORIGIN: "http://127.0.0.1:8081", AWTSMOOS_INSTALL_ROOT: installRoot, AWTSMOOS_SKIP_START: "1", AWTSMOOS_TUNNEL_NAME: "awt-sandbox-fallback", AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_PROJECT_ROOT: repoRoot, AWTSMOOS_SKIP_OPEN_CONTROL: "1" } });
    let stdout = "", stderr = "";
    ps.stdout.on("data", c => stdout += c);
    ps.stderr.on("data", c => stderr += c);
    ps.on("error", reject);
    ps.on("exit", code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`PowerShell failed ${code}\n${stdout}\n${stderr}`)));
  });
}
async function fetchJson(url, options = {}) {
  const r = await fetch(url, options);
  const text = await r.text();
  assert.ok(r.ok, `${url} ${r.status}: ${text}`);
  return JSON.parse(text);
}
async function waitHealth() {
  const start = Date.now(); let last;
  while (Date.now() - start < 40000) {
    try { return await fetchJson(`http://127.0.0.1:${apiPort}/health`); }
    catch (e) { last = e; await new Promise(r => setTimeout(r, 600)); }
  }
  throw last || new Error("health timeout");
}
function startAgent() {
  const child = spawn(process.execPath, [path.join(installRoot, "main.js")], { cwd: repoRoot, env: { ...process.env, USERPROFILE: home, AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_LOCAL_API: "1" }, stdio: ["ignore", "pipe", "pipe"] });
  child.killLater = () => { try { child.kill(); } catch {} };
  return child;
}
(async () => {
  const ps = powershellCommand();
  if (!ps) { console.log(JSON.stringify({ ok: true, skipped: true, reason: "powershell_not_available" }, null, 2)); return; }
  fs.rmSync(sandbox, { recursive: true, force: true });
  await fsp.mkdir(home, { recursive: true });
  const server = localServer();
  await new Promise(resolve => server.listen(8081, "127.0.0.1", resolve));
  try {
    let failed = null;
    try {
      await runPowerShell(ps, "& 'geelooy/apps/tunnel/downloads/windows.ps1'");
    } catch (error) {
      failed = error;
    }
    assert.ok(failed, "installer should reject non-ZIP bundle response");
    assert.match(failed.message, /not a ZIP archive/i);
    console.log(JSON.stringify({ ok: true, rejectedBadZip: true }, null, 2));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
