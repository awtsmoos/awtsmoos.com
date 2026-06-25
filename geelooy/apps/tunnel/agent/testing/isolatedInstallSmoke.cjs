// B"H
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const crypto = require("crypto");
const { spawn, spawnSync } = require("child_process");

const GEELOOY = path.resolve(__dirname, "../../../..");
const REPO = path.dirname(GEELOOY);
const DOWNLOADS = path.join(GEELOOY, "apps", "tunnel", "downloads");
const AGENT = path.join(GEELOOY, "apps", "tunnel", "agent");
const TMP = path.join(REPO, ".awtsmoos", "tmp-install-tests");

const read = file => fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const rmrf = file => fs.rmSync(file, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
const mkdirp = file => fs.mkdirSync(file, { recursive: true });

function manifestLines() { return read(path.join(AGENT, "manifest.txt")).split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== 'B"H' && x !== '# B"H'); }
function freePort() { return new Promise(resolve => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); }); }); }

function assertInstallerScripts() {
  const windows = read(path.join(DOWNLOADS, "windows.ps1"));
  const unix = read(path.join(DOWNLOADS, "unix.sh"));
  assert(windows.includes("AWTSMOOS_INSTALL_ROOT"));
  assert(windows.includes("AWTSMOOS_SKIP_START"));
  assert(windows.includes("Stop-OldAwtsAgent $root $entry"));
  assert(!windows.includes("Install-AwtsmoosFiles"));
  assert(!windows.includes("per-file install"));
  assert(unix.includes("AWTSMOOS_INSTALL_ROOT"));
  assert(unix.includes("AWTSMOOS_SKIP_START"));
  assert(unix.includes("stop_existing_runtime"));
  assert(unix.includes("wait_for_pids_to_exit"));
  assert(!unix.includes("install_awtsmoos_files"));
  assert(!unix.includes("falling back to per-file"));
  const bash = spawnSync("bash", ["-n", path.join(DOWNLOADS, "unix.sh")], { encoding: "utf8" });
  if (!bash.error) assert.strictEqual(bash.status, 0, bash.stderr);
}

function sourcePathFor(filePath) {
  return filePath.startsWith("ai/") ? path.join(GEELOOY, filePath) : path.join(AGENT, filePath);
}
function createBundleZip(zipPath) {
  const staging = path.join(TMP, "bundle-staging");
  rmrf(staging); mkdirp(staging);
  const [_version, entry, ...files] = manifestLines();
  for (const filePath of [entry, ...files]) {
    const src = sourcePathFor(filePath);
    const dest = path.join(staging, filePath);
    mkdirp(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
  rmrf(zipPath);
  const ps = spawnSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Force -Path '${staging}\\*' -DestinationPath '${zipPath}'`], { encoding: "utf8" });
  if (!ps.error && ps.status === 0) return zipPath;
  const zip = spawnSync("zip", ["-qr", zipPath, "."], { cwd: staging, encoding: "utf8" });
  if (!zip.error && zip.status === 0) return zipPath;
  const py = spawnSync("python3", ["-m", "zipfile", "-c", zipPath, "."], { cwd: staging, encoding: "utf8" });
  assert.strictEqual(py.status, 0, (ps.stdout || "") + (ps.stderr || "") + (zip.stdout || "") + (zip.stderr || "") + (py.stdout || "") + (py.stderr || ""));
  return zipPath;
}
function startStatic(root) {
  const zipPath = createBundleZip(path.join(TMP, "awtsmoos-agent.zip"));
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.searchParams.has("bundle") || url.pathname === "/api/tunnel/install/bundle-manifest") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      return void res.end(JSON.stringify({ bundles: [{ name: "agent", url: "/awtsmoos-agent.zip" }] }));
    }
    if (url.pathname === "/awtsmoos-agent.zip" || url.pathname === "/api/tunnel/install/agent.zip") {
      res.writeHead(200, { "content-type": "application/zip" });
      return void fs.createReadStream(zipPath).pipe(res);
    }
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const full = path.resolve(root, rel);
    if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) return void (res.writeHead(404), res.end("missing"));
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    fs.createReadStream(full).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

function installWithPowerShell({ origin, installRoot, projectRoot, relay, localApiPort }) {
  const child = spawn("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(DOWNLOADS, "windows.ps1")], {
    env: { ...process.env, AWTSMOOS_INSTALL_ORIGIN: origin, AWTSMOOS_INSTALL_ROOT: installRoot, AWTSMOOS_TUNNEL_NAME: "awt-isolated-install-test", AWTSMOOS_RELAY: relay, AWTSMOOS_PROJECT_ROOT: projectRoot, AWTSMOOS_LOCAL_API_PORT: String(localApiPort), AWTSMOOS_SKIP_START: "1", AWTSMOOS_SKIP_OPEN_CONTROL: "1" }
  });
  return new Promise((resolve, reject) => {
    let stdout = "", stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("installer timeout\n" + stdout + stderr));
    }, 120000);
    child.stdout.on("data", c => stdout += c.toString());
    child.stderr.on("data", c => stderr += c.toString());
    child.on("error", error => { clearTimeout(timeout); reject(error); });
    child.on("exit", code => {
      clearTimeout(timeout);
      try {
        assert.strictEqual(code, 0, stdout + stderr);
        assert(stdout.includes("AWTSMOOS_SKIP_START set"));
        resolve(stdout);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function installWithUnix({ origin, installRoot, projectRoot, relay, localApiPort }) {
  const child = spawn("bash", [path.join(DOWNLOADS, "unix.sh")], {
    env: { ...process.env, AWTSMOOS_INSTALL_ORIGIN: origin, AWTSMOOS_INSTALL_ROOT: installRoot, AWTSMOOS_TUNNEL_NAME: "awt-isolated-install-test", AWTSMOOS_RELAY: relay, AWTSMOOS_PROJECT_ROOT: projectRoot, AWTSMOOS_LOCAL_API_PORT: String(localApiPort), AWTSMOOS_SKIP_START: "1", AWTSMOOS_SKIP_OPEN_CONTROL: "1" }
  });
  return new Promise((resolve, reject) => {
    let stdout = "", stderr = "";
    const timeout = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("unix installer timeout\n" + stdout + stderr)); }, 120000);
    child.stdout.on("data", c => stdout += c.toString());
    child.stderr.on("data", c => stderr += c.toString());
    child.on("error", error => { clearTimeout(timeout); reject(error); });
    child.on("exit", code => {
      clearTimeout(timeout);
      try {
        assert.strictEqual(code, 0, stdout + stderr);
        assert(stdout.includes("AWTSMOOS_SKIP_START set"));
        resolve(stdout);
      } catch (error) { reject(error); }
    });
  });
}

function hasPowerShell() {
  const got = spawnSync("powershell", ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
  return !got.error && got.status === 0;
}

function installWithPlatform(opts) {
  return hasPowerShell() ? installWithPowerShell(opts) : installWithUnix(opts);
}

function verifyInstall(root) {
  const [version, entry, ...files] = manifestLines();
  assert.strictEqual(entry, "main.js");
  assert(fs.existsSync(path.join(root, entry)));
  files.forEach(file => assert(fs.existsSync(path.join(root, file)), file));
  assert.strictEqual(read(path.join(root, "install-state.txt")).trim(), version);
  const config = JSON.parse(read(path.join(root, "config.json")));
  assert.strictEqual(config.tunnelName, "awt-isolated-install-test");
  return { version, entry, fileCount: files.length, config };
}

class Relay {
  constructor() { this.messages = []; this.buffer = Buffer.alloc(0); }
  async start() { this.server = net.createServer(socket => this.attach(socket)); await new Promise(resolve => this.server.listen(0, "127.0.0.1", resolve)); return `ws://127.0.0.1:${this.server.address().port}`; }
  close() { try { this.socket?.destroy(); } catch {} try { this.server?.close(); } catch {} }
  attach(socket) { this.socket = socket; let head = Buffer.alloc(0); socket.on("data", chunk => { if (!this.ready) { head = Buffer.concat([head, chunk]); const end = head.indexOf("\r\n\r\n"); if (end < 0) return; const key = /Sec-WebSocket-Key:\s*(.+)/i.exec(head.slice(0, end).toString("utf8"))[1].trim(); const accept = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64"); socket.write(["HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", "Sec-WebSocket-Accept: " + accept, "", ""].join("\r\n")); this.ready = true; const rest = head.slice(end + 4); if (rest.length) this.frames(rest); return; } this.frames(chunk); }); }
  frames(chunk) { this.buffer = Buffer.concat([this.buffer, chunk]); while (true) { const got = clientFrame(this.buffer); if (!got) return; this.buffer = this.buffer.slice(got.consumed); try { this.messages.push(JSON.parse(got.payload.toString("utf8"))); } catch (_) { /* ignore non-json control/binary frames in smoke harness */ } } }
  send(obj) { this.socket.write(serverFrame(JSON.stringify(obj))); }
  waitFor(fn, ms = 12000) { return new Promise((resolve, reject) => { const start = Date.now(); const t = setInterval(() => { const got = this.messages.find(fn); if (got) return clearInterval(t), resolve(got); if (Date.now() - start > ms) return clearInterval(t), reject(new Error("mock relay timeout")); }, 20); }); }
}

function clientFrame(buf) {
  if (buf.length < 2) return null;
  let len = buf[1] & 127, off = 2;
  if (len === 126) { if (buf.length < 4) return null; len = buf.readUInt16BE(2); off = 4; }
  if (len === 127) { if (buf.length < 10) return null; len = Number(buf.readBigUInt64BE(2)); off = 10; }
  if (buf.length < off + 4 + len) return null;
  const mask = buf.slice(off, off + 4); off += 4;
  const payload = Buffer.from(buf.slice(off, off + len));
  for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  return { payload, consumed: off + len };
}
function serverFrame(text) { const p = Buffer.from(text); if (p.length < 126) return Buffer.concat([Buffer.from([129, p.length]), p]); const h = Buffer.alloc(4); h[0] = 129; h[1] = 126; h.writeUInt16BE(p.length, 2); return Buffer.concat([h, p]); }

async function smokeInstalled({ installRoot, tempHome, projectRoot, relay }) {
  fs.writeFileSync(path.join(projectRoot, "seed.txt"), "BHY seed");
  const child = spawn(process.execPath, [path.join(installRoot, "main.js")], { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, USERPROFILE: tempHome, HOME: tempHome, AWTSMOOS_MAX_INFLIGHT: "4", AWTSMOOS_MAX_QUEUE: "80" } });
  try {
    const reg = await relay.waitFor(m => m.type === "TUNNEL_REGISTER", 15000);
    assert.strictEqual(reg.name, "awt-isolated-install-test");
    assert.strictEqual(path.resolve(reg.root), path.resolve(projectRoot));
    assert.strictEqual(reg.vesselType, "native-local");
    assert.strictEqual(reg.targetVessel, "local-tunnel");
    assert.strictEqual(reg.localTunnel, true);
    assert.strictEqual(reg.virtualOs, false);
    assert.strictEqual(reg.capabilities.storage, "native-filesystem");
    relay.send({ type: "TUNNEL_REQUEST", id: "w", payload: { kind: "fs", action: "write", path: "out.txt", content: "BHY isolated" } });
    assert.strictEqual((await relay.waitFor(m => m.id === "w")).ok, true);
    relay.send({ type: "TUNNEL_REQUEST", id: "r", payload: { kind: "fs", action: "read", path: "out.txt" } });
    assert.strictEqual((await relay.waitFor(m => m.id === "r")).content, "BHY isolated");
    for (let i = 0; i < 25; i++) relay.send({ type: "TUNNEL_REQUEST", id: "s" + i, payload: { kind: "fs", action: "read", path: "out.txt" } });
    for (let i = 0; i < 25; i++) assert.strictEqual((await relay.waitFor(m => m.id === "s" + i, 15000)).ok, true);
    return { tunnelName: reg.name, stressRequests: 25 };
  } finally { child.kill(); }
}

async function main() {
  rmrf(TMP); mkdirp(TMP); assertInstallerScripts();
  const tempHome = path.join(TMP, "home");
  const installRoot = path.join(tempHome, ".awtsmoos-tunnel");
  const projectRoot = path.join(TMP, "project");
  mkdirp(installRoot); mkdirp(projectRoot);
  const relay = new Relay();
  const relayUrl = await relay.start();
  const staticSite = await startStatic(GEELOOY);
  try {
    const localApiPort = await freePort();
    const installerTail = (await installWithPlatform({ origin: staticSite.origin, installRoot, projectRoot, relay: relayUrl, localApiPort })).split(/\r?\n/).slice(-8);
    const installed = verifyInstall(installRoot);
    const smoke = await smokeInstalled({ installRoot, tempHome, projectRoot, relay });
    console.log(JSON.stringify({ ok: true, suite: "isolated-tunnel-install-smoke", installed: { version: installed.version, fileCount: installed.fileCount }, smoke, installerTail }, null, 2));
  } finally { staticSite.server.close(); relay.close(); rmrf(TMP); }
}

main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
