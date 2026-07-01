// B"H
const fs = require('fs');
const path = require('path');

/**
 * B"H
 * Chapter 629: The manifest stopped asking whether the dawn was new.
 * Every rebuild is a footprint in time, so every successful invocation raises
 * the vessel number. The Awtsmoos breathes; the manifest counts the breath.
 */
const ROOT = __dirname;
const REPO_ROOT = path.resolve(ROOT, '../../../..');
const OUT = path.join(ROOT, 'manifest.txt');
const SKIP_DIRS = new Set(['node_modules', '.git', '.awtsmoos', '.cache', 'testing', 'test', 'tests', '__MACOSX']);
const SKIP_NAMES = new Set(['manifest.txt', '.DS_Store', '.AppleDouble', '.LSOverride', '.Spotlight-V100', '.TemporaryItems', '.Trashes', '.VolumeIcon.icns', '.fseventsd']);
const EXTERNAL_DIRS = [
  { source: path.join(REPO_ROOT, 'geelooy/ai/relay/split-browser'), dest: 'ai/relay/split-browser' },
  { source: path.join(REPO_ROOT, 'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB'), dest: 'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB' }
];
function slash(value) { return String(value || '').replace(/\\/g, '/'); }
function pathSegments(value) { return slash(value).split('/').filter(Boolean); }
function isMacMetadataName(name) { return name === '.DS_Store' || name.startsWith('._'); }
function isGeneratedArtifact(value) { return /\.bak$/.test(value) || /\.before-/.test(value) || /\.tmp-/.test(value) || /\.smoke-server/.test(value); }
function shouldSkipManifestPath(value) {
  const normalized = slash(value).trim();
  if (!normalized || isGeneratedArtifact(normalized)) return true;
  return pathSegments(normalized).some(x => SKIP_DIRS.has(x) || SKIP_NAMES.has(x) || isMacMetadataName(x));
}
function readManifest(file = OUT) {
  try {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(x => x.trim()).filter(Boolean).filter(x => x !== 'B"H' && x !== '# B"H');
    return { version: lines[0] || null, entry: lines[1] || null, files: lines.slice(2).sort((a, b) => a.localeCompare(b)) };
  } catch (_) { return { version: null, entry: null, files: [] }; }
}
function nextVersion(current) {
  const forced = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
  if (forced && /^\d+\.\d+\.\d+$/.test(forced)) return forced;
  if (!current || !/^\d+\.\d+\.\d+$/.test(current)) return '1.0.1';
  const [major, minor, patch] = current.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}
function ignored(full, name) {
  if (shouldSkipManifestPath(name) || shouldSkipManifestPath(path.relative(ROOT, full))) return true;
  if (SKIP_NAMES.has(name) || SKIP_DIRS.has(name)) return true;
  const s = slash(full);
  return /(^|\/)testing(\/|$)/.test(s) || /(^|\/)tests(\/|$)/.test(s) || /(^|\/)test(\/|$)/.test(s) || /\.test\.(cjs|mjs|js)$/.test(s);
}
function walk(dir, out = [], base = ROOT, prefix = '') {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (ignored(full, entry.name)) continue;
    if (entry.isDirectory()) walk(full, out, base, prefix);
    else if (entry.isFile()) out.push(slash(path.join(prefix, path.relative(base, full))));
  }
  return out;
}
function agentFiles() { return walk(ROOT).filter(x => x !== 'manifest.txt').sort((a, b) => a.localeCompare(b)); }
function externalFiles() { const out = []; for (const item of EXTERNAL_DIRS) walk(item.source, out, item.source, item.dest); return out.sort((a, b) => a.localeCompare(b)); }
function sameFiles(a, b) { return a.length === b.length && a.every((value, index) => value === b[index]); }
function manifestText(version, files) { return ['B"H', version, 'main.js', '', ...files].join('\n') + '\n'; }
function buildManifest() {
  const current = readManifest();
  const files = [...new Set([...agentFiles(), ...externalFiles()])].sort((a, b) => a.localeCompare(b));
  const unchanged = current.entry === 'main.js' && sameFiles(current.files, files);
  const version = nextVersion(current.version);
  return { version, previousVersion: current.version, files, unchanged, text: manifestText(version, files) };
}
function main() {
  const built = buildManifest();
  fs.writeFileSync(OUT, built.text, 'utf8');
  console.log(JSON.stringify({ ok: true, manifest: slash(path.relative(process.cwd(), OUT)), previousVersion: built.previousVersion, version: built.version, files: built.files.length, unchanged: built.unchanged, bumpedEveryRun: true }, null, 2));
}
if (require.main === module) main();
module.exports = { OUT, buildManifest, walk, slash, agentFiles, externalFiles, ignored, nextVersion, readManifest, sameFiles, shouldSkipManifestPath };
