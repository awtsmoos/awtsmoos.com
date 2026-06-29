// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Chapter 628: The manifest learned to carry only living vessels.
 * Split browser and AwtsmoosDB travel with the installed agent, while backups,
 * tests, smoke scraps, and old husks remain behind in the source wilderness.
 */
const ROOT = __dirname;
const REPO_ROOT = path.resolve(ROOT, "../../../..");
const OUT = path.join(ROOT, "manifest.txt");
const SKIP_DIRS = new Set(["node_modules", ".git", ".awtsmoos", ".cache", "testing", "test", "tests", "__MACOSX"]);
const SKIP_NAMES = new Set([
  "manifest.txt",
  ".DS_Store",
  ".AppleDouble",
  ".LSOverride",
  ".Spotlight-V100",
  ".TemporaryItems",
  ".Trashes",
  ".VolumeIcon.icns",
  ".fseventsd"
]);
const EXTERNAL_DIRS = [
  { source: path.join(REPO_ROOT, "geelooy/ai/relay/split-browser"), dest: "ai/relay/split-browser" },
  { source: path.join(REPO_ROOT, "ayzarim/DosDB/awtsmoosBinary/awtsmoosDB"), dest: "ayzarim/DosDB/awtsmoosBinary/awtsmoosDB" }
];

function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function pathSegments(value) { return slash(value).split("/").filter(Boolean); }
function isMacMetadataName(name) { return name === ".DS_Store" || name.startsWith("._"); }
function isGeneratedArtifact(value) { return /\.bak$/.test(value) || /\.before-/.test(value) || /\.tmp-/.test(value) || /\.smoke-server/.test(value); }
function shouldSkipManifestPath(value) {
  const normalized = slash(value).trim();
  if (!normalized || isGeneratedArtifact(normalized)) return true;
  const segments = pathSegments(normalized);
  if (!segments.length) return true;
  return segments.some(segment => SKIP_DIRS.has(segment) || SKIP_NAMES.has(segment) || isMacMetadataName(segment));
}
function readCurrentVersion() {
  try {
    const version = fs.readFileSync(OUT, "utf8").split(/\r?\n/).map(x => x.trim()).find(x => /^\d+\.\d+\.\d+$/.test(x));
    return version || null;
  } catch (_) { return null; }
}
function nextVersion() {
  const forced = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
  if (forced && /^\d+\.\d+\.\d+$/.test(forced)) return forced;
  const current = readCurrentVersion();
  if (!current) return "1.0.1";
  const [major, minor, patch] = current.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}
function ignored(full, name) {
  if (shouldSkipManifestPath(name) || shouldSkipManifestPath(path.relative(ROOT, full))) return true;
  if (SKIP_NAMES.has(name) || SKIP_DIRS.has(name)) return true;
  const s = slash(full);
  return /(^|\/)testing(\/|$)/.test(s) || /(^|\/)tests(\/|$)/.test(s) || /(^|\/)test(\/|$)/.test(s) || /\.test\.(cjs|mjs|js)$/.test(s);
}
function walk(dir, out = [], base = ROOT, prefix = "") {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (ignored(full, entry.name)) continue;
    if (entry.isDirectory()) walk(full, out, base, prefix);
    else if (entry.isFile()) out.push(slash(path.join(prefix, path.relative(base, full))));
  }
  return out;
}
function agentFiles() { return walk(ROOT).filter(x => x !== "manifest.txt").sort((a, b) => a.localeCompare(b)); }
function externalFiles() {
  const out = [];
  for (const item of EXTERNAL_DIRS) walk(item.source, out, item.source, item.dest);
  return out.sort((a, b) => a.localeCompare(b));
}
function buildManifest() {
  const version = nextVersion();
  const files = [...new Set([...agentFiles(), ...externalFiles()])].sort((a, b) => a.localeCompare(b));
  return { version, files, text: ['B"H', version, "main.js", "", ...files].join("\n") + "\n" };
}
function main() {
  const built = buildManifest();
  fs.writeFileSync(OUT, built.text, "utf8");
  console.log(JSON.stringify({ ok: true, manifest: slash(path.relative(process.cwd(), OUT)), version: built.version, files: built.files.length }, null, 2));
}
if (require.main === module) main();
module.exports = { buildManifest, walk, slash, agentFiles, externalFiles, ignored, nextVersion, shouldSkipManifestPath };
