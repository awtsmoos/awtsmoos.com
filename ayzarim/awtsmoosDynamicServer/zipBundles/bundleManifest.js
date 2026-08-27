// B"H
const path = require("path");
const crypto = require("crypto");
const { cleanRel } = require("./pathGuard.js");
const { sourceFileFor } = require("./sourceResolver.js");

const PART_ORDER = ["core", "fs", "runtime", "chatgpt", "tests", "ai"];

/**
 * B"H
 * Reads the agent manifest and groups it into a few install-sized bundles. The
 * partition rules are data-like and deterministic so Windows and Unix receive
 * the same constellation of files.
 */
async function buildBundleManifest({ fs, agentRoot, baseUrl = "/apps/tunnel/agent" }) {
  const manifestText = await fs.readFile(path.join(agentRoot, "manifest.txt"), "utf8");
  const parsed = parseManifest(manifestText);
  const files = unique([parsed.entry, ...parsed.files]).filter(Boolean);
  const parts = partitionFiles(files);
  const bundles = [];
  for (const name of PART_ORDER) {
    const partFiles = parts[name] || [];
    if (!partFiles.length) continue;
    const summary = await summarizeFiles(fs, agentRoot, partFiles);
    bundles.push({ name, files: partFiles.length, sourceBytes: summary.bytes, sha256: summary.sha256, url: `${baseUrl}/manifest.txt?bundle=zip&part=${encodeURIComponent(name)}` });
  }
  return { bh: "B\"H", version: parsed.version, entry: parsed.entry, baseUrl, fallbackManifest: `${baseUrl}/manifest.txt`, bundles };
}

function parseManifest(text) {
  const lines = String(text || "").split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== "B\"H" && x !== "# B\"H");
  const version = lines[0] || "0.0.0";
  const entry = cleanRel(lines[1] || "main.js");
  const files = lines.slice(2).map(cleanRel).filter(Boolean);
  return { version, entry, files };
}

function partitionFiles(files) {
  const out = { core: [], fs: [], runtime: [], chatgpt: [], tests: [], ai: [] };
  for (const file of files) out[partFor(file)].push(file);
  for (const name of Object.keys(out)) out[name] = unique(out[name]).sort((a, b) => a.localeCompare(b));
  return out;
}

function partFor(file) {
  if (file.startsWith("ai/")) return "ai";
  if (file.includes("/testing/") || file.endsWith(".test.cjs")) return "tests";
  if (file.startsWith("tools/chatgpt/")) return "chatgpt";
  if (file.startsWith("tools/fs/nodeDomRuntime/") || file === "tools/fs/chromeRuntime.js") return "runtime";
  if (file.startsWith("tools/fs/")) return "fs";
  return "core";
}

async function summarizeFiles(fs, agentRoot, files) {
  const hash = crypto.createHash("sha256");
  let bytes = 0;
  for (const file of files) {
    const full = sourceFileFor(agentRoot, file);
    if (!full) continue;
    const buf = await fs.readFile(full);
    hash.update(file).update("\0").update(buf);
    bytes += buf.length;
  }
  return { bytes, sha256: hash.digest("hex") };
}

function unique(list) { return [...new Set(list)]; }

module.exports = { buildBundleManifest, parseManifest, partitionFiles, partFor, PART_ORDER };
