// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { maybeSendBundle } = require("../../zipBundles/bundleRoute.js");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");
const { buildAgentZip, manifestFiles } = require("../../../../geelooy/api/tunnel/install/tools/zipBundle.js");

/**
 * B"H
 * Chapter 404: A full Windows bootstrap walked through localhost, installed a
 * separate agent root, started a separate local API port, and answered requests.
 */
const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, "geelooy");
const agentRoot = path.join(publicRoot, "apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.txt");
const sandbox = path.join(repoRoot, "AI_THOUGHTS/runtime-stress/.tmp-windows-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const apiPort = 3988;

function powershellCommand() {
  for (const cmd of ["powershell.exe", "pwsh", "powershell"]) {
    const probe = spawnSync(cmd, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
    if (probe.status === 0) return cmd;
  }
  return null;
}
function responseAdapter(res) { return { statusCode: 200, setHeader: (k, v) => res.setHeader(k, v), end: body => res.end(body) }; }
function safeFile(root, rel) {
  const full = path.resolve(root, rel.replace(/^\/+/, ""));
  assert.ok(!path.relative(root, full).startsWith(".."), "unsafe serve path");
  return full;
}

function localServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1:8080");
      if (url.pathname === "/apps/tunnel/agent/manifest.txt" && url.searchParams.get("bundle")) {
        const sent = await maybeSendBundle({ filePath: manifestPath, dependencies: { fs: fsp, request: { method: "GET", socket: { remoteAddress: "installer-localhost" }, headers: {}, yeser: {} }, response: responseAdapter(res), paramKinds: { GET: Object.fromEntries(url.searchParams.entries()) } } });
        if (!sent) { res.statusCode = 500; res.end("bundle not sent"); }
        return;
      }
      if (url.pathname === "/api/tunnel/install/bundle-manifest") {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: true, files: manifestFiles(repoRoot).length, bundles: [{ name: "agent", url: "/api/tunnel/install/agent.zip" }] }));
        return;
      }
      if (url.pathname === "/api/tunnel/install/agent.zip") {
        res.setHeader("Content-Type", "application/zip");
        res.end(buildAgentZip(repoRoot));
        return;
      }
      const full = safeFile(publicRoot, url.pathname);
      if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.statusCode = 404; res.end("missing"); return; }
      res.end(fs.readFileSync(full));
    } catch (error) { res.statusCode = 500; res.end(error.stack || error.message); }
  });
}

function runPowerShell(command, script) {
  return new Promise((resolve, reject) => {
    const ps = spawn(command, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { cwd: repoRoot, env: { ...process.env, USERPROFILE: home, AWTSMOOS_INSTALL_ORIGIN: "http://127.0.0.1:8080", AWTSMOOS_INSTALL_ROOT: installRoot, AWTSMOOS_SKIP_START: "1", AWTSMOOS_TUNNEL_NAME: "awt-sandbox-localhost-zip", AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_PROJECT_ROOT: repoRoot, AWTSMOOS_SKIP_OPEN_CONTROL: "1" } });
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
  assert.ok(r.ok, `${url} ${r.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

async function waitHealth() {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < 45000) {
    try { return await fetchJson(`http://127.0.0.1:${apiPort}/health`); }
    catch (error) { last = error; await new Promise(r => setTimeout(r, 750)); }
  }
  throw last || new Error("health timeout");
}

function startInstalledAgent() {
  const entry = path.join(installRoot, "main.js");
  const child = spawn(process.execPath, [entry], { cwd: repoRoot, env: { ...process.env, USERPROFILE: home, AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_LOCAL_API: "1" }, stdio: ["ignore", "pipe", "pipe"] });
  let out = "", err = "";
  child.stdout.on("data", c => out += c);
  child.stderr.on("data", c => err += c);
  child.logs = () => ({ out, err });
  return child;
}

(async () => {
  const ps = powershellCommand();
  if (!ps) { console.log(JSON.stringify({ ok: true, skipped: true, reason: "powershell_not_available" }, null, 2)); return; }
  fs.rmSync(sandbox, { recursive: true, force: true });
  await fsp.mkdir(home, { recursive: true });
  const server = localServer();
  await new Promise(resolve => server.listen(8080, "127.0.0.1", resolve));
  let agent = null;
  try {
    const manifest = parseManifest(fs.readFileSync(manifestPath, "utf8"));
    const install = await runPowerShell(ps, "& 'geelooy/apps/tunnel/downloads/windows.ps1'");
    assert.ok(fs.existsSync(path.join(installRoot, manifest.entry)), "installed main.js missing");
    for (const file of manifest.files) assert.ok(fs.existsSync(path.join(installRoot, file)), "installed file missing: " + file);
    agent = startInstalledAgent();
    const health = await waitHealth();
    assert.equal(health.ok, true);
    assert.equal(health.tunnelName, "awt-sandbox-localhost-zip");
    const list = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "list", arguments: { p: "." } }) });
    assert.equal(list.ok, true, JSON.stringify(list));
    const read = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "read", arguments: { path: "geelooy/apps/tunnel/agent/manifest.txt", maxChars: 64 } }) });
    assert.equal(read.ok, true, JSON.stringify(read));
    console.log(JSON.stringify({ ok: true, installedFiles: manifest.files.length, health: { tunnelName: health.tunnelName, agentVersion: health.agentVersion }, listItems: list.items?.length || 0, readChars: read.content?.length || 0, installStdout: install.stdout.split(/\r?\n/).filter(Boolean).slice(0, 20) }, null, 2));
  } finally {
    if (agent) agent.kill();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
