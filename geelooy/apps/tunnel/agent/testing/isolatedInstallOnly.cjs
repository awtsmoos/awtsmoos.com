// B"H
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const GEELOOY = path.resolve(__dirname, "../../../..");
const REPO = path.dirname(GEELOOY);
const DOWNLOADS = path.join(GEELOOY, "apps", "tunnel", "downloads");
const AGENT = path.join(GEELOOY, "apps", "tunnel", "agent");
const TMP = path.join(REPO, ".awtsmoos", "tmp-install-only");
const read = file => fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const rmrf = file => fs.rmSync(file, { recursive: true, force: true });
const mkdirp = file => fs.mkdirSync(file, { recursive: true });

function freePort() { return new Promise(resolve => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); }); }); }
function manifestLines() { return read(path.join(AGENT, "manifest.txt")).split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== 'B"H' && x !== '# B"H'); }
function assertScripts() {
  const windows = read(path.join(DOWNLOADS, "windows.ps1"));
  const unix = [
    "unix.sh",
    "unix-install-core.sh",
    "unix-activation-state.sh",
    "unix-process-runtime.sh"
  ].map(file => read(path.join(DOWNLOADS, file))).join("\n");
  assert(windows.includes("AWTSMOOS_INSTALL_ROOT"));
  assert(windows.includes("AWTSMOOS_SKIP_START"));
  assert(windows.includes("Stop-OldAwtsAgent $root $entry"));
  assert(unix.includes("AWTSMOOS_INSTALL_ROOT"));
  assert(unix.includes("AWTSMOOS_SKIP_START"));
  assert(unix.includes("stop_existing_runtime"));
  assert(unix.includes("stop_pid_set"));
}
function startStatic(root) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.searchParams.has("bundle")) return void (res.writeHead(404), res.end("no bundle"));
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const full = path.resolve(root, rel);
    if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) return void (res.writeHead(404), res.end("missing"));
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    fs.createReadStream(full).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}
function runInstaller(env) {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(DOWNLOADS, "windows.ps1")], { env: { ...process.env, ...env } });
    let stdout = "", stderr = "";
    const timeout = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("installer timeout\n" + stdout + stderr)); }, 60000);
    child.stdout.on("data", c => stdout += c.toString());
    child.stderr.on("data", c => stderr += c.toString());
    child.on("error", error => { clearTimeout(timeout); reject(error); });
    child.on("exit", code => { clearTimeout(timeout); code === 0 ? resolve({ stdout, stderr }) : reject(new Error("installer exited " + code + "\n" + stdout + stderr)); });
  });
}
(async () => {
  assertScripts();
  const powershell = spawnSync("powershell", ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
  if (powershell.error || powershell.status !== 0) {
    console.log(JSON.stringify({ ok: true, suite: "isolated-install-only", skipped: "powershell_unavailable" }, null, 2));
    return;
  }
  rmrf(TMP); mkdirp(TMP);
  const installRoot = path.join(TMP, "home", ".awtsmoos-tunnel");
  const projectRoot = path.join(TMP, "project");
  mkdirp(installRoot); mkdirp(projectRoot);
  const staticSite = await startStatic(GEELOOY);
  try {
    const run = await runInstaller({ AWTSMOOS_INSTALL_ORIGIN: staticSite.origin, AWTSMOOS_INSTALL_ROOT: installRoot, AWTSMOOS_TUNNEL_NAME: "awt-install-only-test", AWTSMOOS_PROJECT_ROOT: projectRoot, AWTSMOOS_RELAY: "ws://127.0.0.1:9", AWTSMOOS_LOCAL_API_PORT: String(await freePort()), AWTSMOOS_SKIP_START: "1", AWTSMOOS_SKIP_OPEN_CONTROL: "1" });
    const [version, entry, ...files] = manifestLines();
    assert.strictEqual(entry, "main.js");
    assert(fs.existsSync(path.join(installRoot, entry)));
    files.forEach(file => assert(fs.existsSync(path.join(installRoot, file)), file));
    const cfg = JSON.parse(read(path.join(installRoot, "config.json")));
    assert.strictEqual(cfg.tunnelName, "awt-install-only-test");
    assert.strictEqual(path.resolve(cfg.root), path.resolve(projectRoot));
    assert.strictEqual(read(path.join(installRoot, "install-state.txt")).trim(), version);
    console.log(JSON.stringify({ ok: true, suite: "isolated-install-only", version, fileCount: files.length, skippedStart: run.stdout.includes("AWTSMOOS_SKIP_START set") }, null, 2));
  } finally { staticSite.server.close(); rmrf(TMP); }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
