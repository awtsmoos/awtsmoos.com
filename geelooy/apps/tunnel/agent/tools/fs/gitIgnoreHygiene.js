// B"H
const fsp = require("fs/promises");
const { safePath } = require("./pathGuard.js");

const HEADER = "# B\"H Awtsmoos tunnel generated artifacts";
const TEMP_PATTERNS = [
  ".awtsmoos/",
  ".awtsmoos/actions/",
  ".awtsmoos/actions/results/",
  ".awtsmoos/previews/",
  ".awtsmoos/tmp/",
  ".awtsmoos-tmp/",
  ".Awtsmoos/",
  ".Awtsmoos/actions/",
  ".Awtsmoos/actions/results/",
  ".Awtsmoos/previews/",
  ".Awtsmoos/tmp/",
  ".Awtsmoos-tmp/",
  "*.awtsmoos.log",
  ".awtsmoos.local.json",
  ".awtsmoos.config.local.json",
  ".Awtsmoos.local.json",
  ".Awtsmoos.config.local.json"
];
const AI_THOUGHTS_PATTERNS = ["AI_THOUGHTS/"];

/**
 * B"H
 * Chapter: The flowers stayed in the garden, not in git.
 *
 * Awtsmoos writes temporary blossoms: action ledgers, preview cache, tunnel
 * scratch, and sometimes legacy uppercase `.Awtsmoos` flowers. If the root is a
 * git repo, this module carefully adds one managed block to .gitignore.
 * AI_THOUGHTS stays opt-in because some users want the planning novel committed.
 */
function gitHygieneConfig(config = {}) {
  const got = config.gitHygiene || {};
  return {
    autoUpdateGitignore: got.autoUpdateGitignore !== false,
    ignoreAwtsmoosTemp: got.ignoreAwtsmoosTemp !== false,
    ignoreAiThoughts: got.ignoreAiThoughts === true,
    managedHeader: got.managedHeader || HEADER
  };
}

async function isGitRepo(config = {}) {
  try {
    const stat = await fsp.stat(safePath(config, ".git"));
    return stat.isDirectory() || stat.isFile();
  } catch (_) {
    return false;
  }
}

async function ensureGitignoreHygiene(config = {}, reason = "awtsmoos-write") {
  const hygiene = gitHygieneConfig(config);
  if (!hygiene.autoUpdateGitignore) return { ok: true, changed: false, skipped: true, reason: "disabled" };
  if (!(await isGitRepo(config))) return { ok: true, changed: false, skipped: true, reason: "not_git_repo" };

  const wanted = wantedPatterns(hygiene);
  if (!wanted.length) return { ok: true, changed: false, skipped: true, reason: "no_patterns" };

  const gitignorePath = safePath(config, ".gitignore");
  const before = await readText(gitignorePath);
  const after = mergeManagedBlock(before, hygiene.managedHeader, wanted);
  if (after === before) return { ok: true, changed: false, path: ".gitignore", reason };
  await fsp.writeFile(gitignorePath, after, "utf8");
  return { ok: true, changed: true, path: ".gitignore", reason, patterns: wanted };
}

function wantedPatterns(hygiene) {
  return [...(hygiene.ignoreAwtsmoosTemp ? TEMP_PATTERNS : []), ...(hygiene.ignoreAiThoughts ? AI_THOUGHTS_PATTERNS : [])];
}

async function readText(file) {
  try { return await fsp.readFile(file, "utf8"); }
  catch (_) { return ""; }
}

function mergeManagedBlock(before = "", header = HEADER, wanted = []) {
  const normalized = String(before || "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const existing = new Set(lines.map(line => line.trim()).filter(Boolean));
  const missing = wanted.filter(pattern => !existing.has(pattern));
  if (!missing.length && normalized.includes(header)) return before;
  const blockLines = [header, ...wanted].filter((line, index, arr) => arr.indexOf(line) === index);
  const withoutOld = removeManagedBlock(lines, header).join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/g, "");
  return `${withoutOld ? withoutOld + "\n\n" : ""}${blockLines.join("\n")}\n`;
}

function removeManagedBlock(lines, header) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== header.trim()) { out.push(lines[i]); continue; }
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("# ")) i++;
    if (i < lines.length) out.push(lines[i]);
  }
  return out;
}

module.exports = { AI_THOUGHTS_PATTERNS, HEADER, TEMP_PATTERNS, ensureGitignoreHygiene, gitHygieneConfig, isGitRepo, mergeManagedBlock, wantedPatterns };
