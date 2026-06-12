// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { maybeSendBundle } = require("../../zipBundles/bundleRoute.js");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");

/**
 * B"H
 * Chapter 416: The Unix bootstrap walked on Windows through bash, drinking
 * bundles from localhost and leaving a bootable installed agent behind.
 */
const repoRoot = process.cwd();
const agentRoot = path.join(repoRoot, "geelooy/apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.txt");
const sandbox = path.join(repoRoot, "AI_THOUGHTS/runtime-stress/.tmp-unix-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const apiPort = 3990;

function bashAvailable() { return spawnSync("bash", ["--version"], { encoding: "utf8" }).status === 0; }
function posix(file) { return file.replace(/\\/g, "/"); }
function responseAdapter(res) { return { statusCode: 200, setHeader: (k, v) => res.setHeader(k, v), end: body => res.end(body) }; }
function safeFile(root, rel) {
  const full = path.resolve(root, rel.replace(/^\/+/, ""));
  assert.ok(!path.relative(root, full).startsWith(".."), "unsafe serve path");
  return full;
}
function server() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1:8082");
      if (url.pathname === "/apps/tunnel/agent/manifest.txt" && url.searchParams.get("bundle")) {
        const sent = await maybeSendBundle({ filePath: manifestPath, dependencies: { fs: fsp, request: { method: "GET", socket: { remoteAddress: "unix-test" }, headers: {}, yeser: {} }, response: responseAdapter(res), paramKinds: { GET: Object.fromEntries(url.searchParams.entries()) } } });
        if (!sent) { res.statusCode = 500; res.end("bundle not sent"); }
        return;
      }
      const full = safeFile(path.join(repoRoot, "geelooy"), url.pathname);
      if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.statusCode = 404; res.end("missing"); return; }
      res.end(fs.readFileSync(full));
    } catch (error) { res.statusCode = 500; res.end(error.stack || error.message); }
  });
}
function runUnixInstaller() {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["geelooy/apps/tunnel/downloads/unix.sh"], { cwd: repoRoot, env: { ...process.env, HOME: posix(home), AWTSMOOS_INSTALL_ORIGIN: "http://127.0.0.1:8082", AWTSMOOS_INSTALL_ROOT: posix(installRoot), AWTSMOOS_SKIP_START: "1", AWTSMOOS_TUNNEL_NAME: "awt-sandbox-unix-zip", AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_PROJECT_ROOT: posix(repoRoot), AWTSMOOS_SKIP_OPEN_CONTROL: "1" } });
    let stdout = "", stderr = "";
    child.stdout.on("data", c => stdout += c);
    child.stderr.on("data", c => stderr += c);
    child.on("exit", code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`unix installer failed ${code}\n${stdout}\n${stderr}`)));
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
    try { return await fetchJson(`http://127.0.0.1:${apiPort}/health`); } catch (e) { last = e; await new Promise(r => setTimeout(r, 600)); }
  }
  throw last || new Error("health timeout");
}
function startAgent() {
  return spawn(process.execPath, [path.join(installRoot, "main.js")], { cwd: repoRoot, env: { ...process.env, HOME: home, USERPROFILE: home, AWTSMOOS_LOCAL_API: "1", AWTSMOOS_LOCAL_API_PORT: String(apiPort) }, stdio: ["ignore", "pipe", "pipe"] });
}
(async () => {
  if (!bashAvailable()) { console.log(JSON.stringify({ ok: true, skipped: true, reason: "bash_not_available" }, null, 2)); return; }
  fs.rmSync(sandbox, { recursive: true, force: true });
  await fsp.mkdir(home, { recursive: true });
  const parsed = parseManifest(fs.readFileSync(manifestPath, "utf8"));
  const s = server();
  await new Promise(resolve => s.listen(8082, "127.0.0.1", resolve));
  let agent = null;
  try {
    const install = await runUnixInstaller();
    for (const file of [parsed.entry, ...parsed.files]) assert.ok(fs.existsSync(path.join(installRoot, file)), "missing " + file);
    agent = startAgent();
    const health = await waitHealth();
    const list = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "list", arguments: { p: ".", maxResults: 10 } }) });
    assert.equal(list.ok, true, JSON.stringify(list));
    console.log(JSON.stringify({ ok: true, installedFiles: parsed.files.length, health: { tunnelName: health.tunnelName, agentVersion: health.agentVersion }, listItems: list.items?.length || 0, stdout: install.stdout.split(/\r?\n/).filter(Boolean).slice(0, 16) }, null, 2));
  } finally {
    if (agent) agent.kill();
    await new Promise(resolve => s.close(resolve));
  }
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
