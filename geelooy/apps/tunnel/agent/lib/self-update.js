// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const childProcess = require("child_process");
const { ROOT } = require("./config.js");

const STATE = path.join(ROOT, "install-state.txt");
const HASH_STATE = path.join(ROOT, "install-manifest.sha256");
const COPY = path.join(ROOT, "installed-manifest.txt");
const LOCK = path.join(ROOT, ".self-update.lock");
const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * B"H
 * Chapter 831, sharpened: the tunnel checks the king's newest decree before it
 * speaks again. Reconnects may force the check, while ordinary heartbeats stay
 * cheap. The manifest hash is the covenant; no stale agent should keep ruling
 * because a previous check was too recent.
 */
let lastCheckAt = 0;
let activeCheck = null;

async function maybeSelfUpdate(options = {}) {
  if (disabled(options)) return { ok: true, skipped: true, reason: "disabled" };
  const now = Date.now();
  const intervalMs = bounded(options.intervalMs || process.env.AWTSMOOS_SELF_UPDATE_INTERVAL_MS, DEFAULT_INTERVAL_MS, 500, 3600000);
  if (!options.force && now - lastCheckAt < intervalMs) return { ok: true, skipped: true, reason: "interval" };
  if (activeCheck) return activeCheck;
  activeCheck = runUpdateCheck(options).finally(() => { activeCheck = null; });
  return activeCheck;
}

async function runUpdateCheck(options = {}) {
  lastCheckAt = Date.now();
  await fsp.mkdir(ROOT, { recursive: true });
  const origin = originFromConfig(options.config || {}, options.origin);
  const manifestUrl = `${origin}/apps/tunnel/agent/manifest.txt`;
  const text = await fetchText(manifestUrl, options);
  const remote = parseManifest(text);
  const local = readLocalState();
  const complete = await allManifestFilesExist(remote);
  const needsUpdate = local.version !== remote.version || local.hash !== remote.hash || !complete;
  if (!needsUpdate) return { ok: true, updated: false, version: remote.version, hash: remote.hash, complete };
  if (options.dryRun) return { ok: true, updated: false, wouldUpdate: true, version: remote.version, hash: remote.hash, local, complete };
  const locked = await acquireLock();
  if (!locked) return { ok: true, skipped: true, reason: "another_update_running" };
  try {
    const afterLock = readLocalState();
    if (afterLock.version === remote.version && afterLock.hash === remote.hash && await allManifestFilesExist(remote)) {
      return { ok: true, updated: false, version: remote.version, hash: remote.hash, complete: true };
    }
    await installBundles(origin, options);
    if (!await allManifestFilesExist(remote)) throw new Error("self_update_verification_failed");
    await fsp.writeFile(STATE, `${remote.version}\n`, "utf8");
    await fsp.writeFile(HASH_STATE, `${remote.hash}\n`, "utf8");
    await fsp.writeFile(COPY, `${remote.lines.join("\n")}\n`, "utf8");
    return { ok: true, updated: true, version: remote.version, hash: remote.hash, entry: remote.entry };
  } finally {
    await releaseLock();
  }
}

function disabled(options = {}) {
  const value = String(options.disabled ?? process.env.AWTSMOOS_SELF_UPDATE_DISABLED ?? "").toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function originFromConfig(config = {}, forced = "") {
  if (forced) return String(forced).replace(/\/$/, "");
  const raw = String(process.env.AWTSMOOS_INSTALL_ORIGIN || config.origin || config.relay || "https://awtsmoos.com");
  if (raw.startsWith("wss://")) return `https://${raw.slice(6).split("/")[0]}`;
  if (raw.startsWith("ws://")) return `http://${raw.slice(5).split("/")[0]}`;
  return raw.replace(/\/$/, "");
}

function parseManifest(text = "") {
  const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== 'B"H' && x !== '# B"H');
  const version = lines[0] || "";
  const entry = lines[1] || "";
  const files = lines.slice(2).filter(isSafePath);
  if (!version || entry !== "main.js" || !files.length) throw new Error("bad_remote_manifest");
  return { version, entry, files, lines, hash: hashLines(lines) };
}

function hashLines(lines = []) {
  return crypto.createHash("sha256").update(lines.join("\n")).digest("hex");
}

function readLocalState() { return { version: readTrim(STATE), hash: readTrim(HASH_STATE), manifest: readTrim(COPY) }; }
function readTrim(file) { try { return fs.readFileSync(file, "utf8").trim(); } catch { return ""; } }

async function allManifestFilesExist(manifest) {
  if (!isSafePath(manifest.entry) || !fs.existsSync(path.join(ROOT, manifest.entry))) return false;
  for (const file of manifest.files) if (!fs.existsSync(path.join(ROOT, file))) return false;
  return true;
}

function isSafePath(filePath = "") {
  const normalized = String(filePath).replace(/\\/g, "/").trim();
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0") || /\s/.test(normalized)) return false;
  const parts = normalized.split("/").filter(Boolean);
  return parts.length > 0 && parts.join("/") === normalized && !parts.some(x => x === "." || x === ".." || x === "node_modules" || x === ".git" || x === "__MACOSX" || x.startsWith("._"));
}

async function installBundles(origin, options = {}) {
  const got = JSON.parse(await fetchText(`${origin}/api/tunnel/install/bundle-manifest`, options));
  if (!Array.isArray(got.bundles) || !got.bundles.length) throw new Error("no_update_bundles");
  const tmp = path.join(ROOT, `.self-update-${process.pid}-${Date.now()}`);
  await fsp.rm(tmp, { recursive: true, force: true });
  await fsp.mkdir(tmp, { recursive: true });
  try {
    for (const bundle of got.bundles) {
      const url = String(bundle.url || "").startsWith("http") ? bundle.url : `${origin}${bundle.url || ""}`;
      const zip = path.join(tmp, `${safeName(bundle.name || "agent")}.zip`);
      await fetchFile(url, zip, options);
      assertZip(zip);
      await extractZip(zip);
    }
  } finally {
    await fsp.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}

function safeName(value = "bundle") { return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_") || "bundle"; }
function assertZip(file) { const fd = fs.openSync(file, "r"); const buf = Buffer.alloc(4); try { fs.readSync(fd, buf, 0, 4, 0); } finally { fs.closeSync(fd); } if (buf.toString("hex") !== "504b0304") throw new Error("bundle_not_zip"); }
async function extractZip(zip) { if (await commandExists("unzip")) return run("unzip", ["-o", zip, "-d", ROOT]); if (await commandExists("python3")) return run("python3", ["-m", "zipfile", "-e", zip, ROOT]); if (process.platform === "win32") return run("powershell", ["-NoProfile", "-Command", `Expand-Archive -Force -Path ${JSON.stringify(zip)} -DestinationPath ${JSON.stringify(ROOT)}`]); throw new Error("no_zip_extractor"); }
function run(file, args) { return new Promise((resolve, reject) => { const child = childProcess.spawn(file, args, { stdio: "ignore", windowsHide: true }); child.on("error", reject); child.on("close", code => code === 0 ? resolve() : reject(new Error(`${file}_exit_${code}`))); }); }
function commandExists(name) { return new Promise(resolve => { const checker = process.platform === "win32" ? "where" : "command"; const args = process.platform === "win32" ? [name] : ["-v", name]; const child = childProcess.spawn(checker, args, { stdio: "ignore", shell: process.platform !== "win32", windowsHide: true }); child.on("error", () => resolve(false)); child.on("close", code => resolve(code === 0)); }); }
function fetchText(url, options = {}) { return fetchBuffer(url, options).then(buf => buf.toString("utf8")); }
async function fetchFile(url, out, options = {}) { const buf = await fetchBuffer(url, options); await fsp.writeFile(out, buf); }
function fetchBuffer(url, options = {}) { const timeoutMs = bounded(options.timeoutMs || process.env.AWTSMOOS_SELF_UPDATE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 1000, 120000); return new Promise((resolve, reject) => { const lib = String(url).startsWith("http://") ? http : https; const req = lib.get(url, res => { if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return resolve(fetchBuffer(new URL(res.headers.location, url).toString(), options)); } if (res.statusCode !== 200) { res.resume(); return reject(new Error(`http_${res.statusCode}_${url}`)); } const chunks = []; res.on("data", chunk => chunks.push(chunk)); res.on("end", () => resolve(Buffer.concat(chunks))); }); req.setTimeout(timeoutMs, () => req.destroy(new Error("self_update_timeout"))); req.on("error", reject); }); }

async function acquireLock() {
  try { await fsp.writeFile(LOCK, `${process.pid}\n${Date.now()}\n`, { flag: "wx" }); return true; }
  catch { const age = Date.now() - Number(readTrim(LOCK).split(/\s+/)[1] || 0); if (age > 2 * 60 * 1000) { await fsp.rm(LOCK, { force: true }).catch(() => {}); return acquireLock(); } return false; }
}
async function releaseLock() { await fsp.rm(LOCK, { force: true }).catch(() => {}); }
function restartIntoUpdatedAgent(extraArgs = process.argv.slice(2)) { const entry = path.join(ROOT, "main.js"); const child = childProcess.spawn(process.execPath, [entry, ...extraArgs], { cwd: ROOT, detached: true, stdio: "ignore", windowsHide: true }); child.unref(); }
function bounded(value, fallback, min, max) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }

module.exports = { maybeSelfUpdate, runUpdateCheck, parseManifest, hashLines, originFromConfig, readLocalState, restartIntoUpdatedAgent, isSafePath };
