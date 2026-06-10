// B"H

const fs = require("fs").promises;
const nativeFs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { compileCompactModule } = require("../compactJs/compiler.js");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const GEELOOY_ROOT = path.join(REPO_ROOT, "geelooy");
const ENTRY_RE = /^(ikar|index|main|entry|app|game)\.(m?js)$/i;
const DEFAULT_ROOTS = ["geelooy/games", "geelooy/apps"];

/**
 * B"H
 * The Entry Sweep walks public-looking gates of games and apps. It can run the
 * whole field, or a slice, because the Awtsmoos tests reality one vessel at a
 * time: no guessing, no cached victory, only compiled source passing syntax.
 *
 * Env controls:
 * - AWTS_ENTRY_ROOTS=geelooy/games,geelooy/apps
 * - AWTS_ENTRY_OFFSET=0
 * - AWTS_ENTRY_LIMIT=20
 * - AWTS_ENTRY_MATCH=ckidsAwtsmoos
 *
 * @returns {Promise<void>} Resolves when the selected entries compile.
 */
async function run() {
  const entries = sliceEntries(await discoverEntries());
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "awts-entry-sweep-"));
  const results = [];

  console.log(`B'H compact entry sweep selected ${entries.length} entries`);
  for (const entry of entries) {
    const result = await checkEntry(entry, tmp);
    results.push(result);
    console.log(`${result.ok ? "PASS" : "FAIL"} ${entry}`);
  }

  report(results);
  if (results.some((item) => !item.ok)) process.exitCode = 1;
}

async function discoverEntries() {
  const found = [];
  for (const root of rootsFromEnv()) await walk(path.join(REPO_ROOT, root), found);
  return found.sort((a, b) => a.localeCompare(b));
}

function rootsFromEnv() {
  const raw = process.env.AWTS_ENTRY_ROOTS;
  if (!raw) return DEFAULT_ROOTS;
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function sliceEntries(entries) {
  const match = process.env.AWTS_ENTRY_MATCH;
  const filtered = match ? entries.filter((entry) => entry.includes(match)) : entries;
  const offset = Math.max(0, Number(process.env.AWTS_ENTRY_OFFSET || 0));
  const limit = Number(process.env.AWTS_ENTRY_LIMIT || filtered.length);
  return filtered.slice(offset, offset + limit);
}

async function walk(dir, found) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const item of entries) {
    if (shouldSkipName(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) await walk(full, found);
    else if (item.isFile() && ENTRY_RE.test(item.name)) found.push(path.relative(REPO_ROOT, full));
  }
}

function shouldSkipName(name) {
  return name === "node_modules" || name === ".git" || name === ".awtsmoos" || name.startsWith(".tmp");
}

async function checkEntry(entry, tmp) {
  const absolute = path.join(REPO_ROOT, entry);
  const output = path.join(tmp, `${safeLabel(entry)}.mjs`);

  try {
    const compiled = await compileCompactModule({ fs, rootDir: GEELOOY_ROOT, entryFile: absolute });
    await fs.writeFile(output, compiled, "utf8");
    execFileSync(process.execPath, ["--check", output], { stdio: "pipe" });
    return { ok: true, entry, bytes: Buffer.byteLength(compiled) };
  } catch (error) {
    const message = String(error && (error.stderr || error.stack || error.message || error));
    maybeCopyFailure(output, entry);
    return { ok: false, entry, message: firstLines(message, 14) };
  }
}

function maybeCopyFailure(output, entry) {
  if (!nativeFs.existsSync(output)) return;
  const dir = path.join(REPO_ROOT, ".awtsmoos-tmp", "compact-entry-failures");
  nativeFs.mkdirSync(dir, { recursive: true });
  nativeFs.copyFileSync(output, path.join(dir, `${safeLabel(entry)}.mjs`));
}

function report(results) {
  const passed = results.filter((item) => item.ok);
  const failed = results.filter((item) => !item.ok);
  console.log(`B'H compact entry sweep: ${passed.length} passed, ${failed.length} failed, ${results.length} total`);
  for (const item of failed) console.log(`\n--- FAIL ${item.entry} ---\n${item.message}`);
}

function safeLabel(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]+/g, "_");
}

function firstLines(text, count) {
  return String(text).split(/\r?\n/).slice(0, count).join("\n");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
