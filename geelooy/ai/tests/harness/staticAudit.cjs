//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

const AUDIT_DIRS = [
  "js/app",
  "js/automation",
  "js/chatgpt/stream",
  "js/chatgpt/transport",
  "js/services",
  "relay/split-browser",
  "tests/harness"
];
const AUDIT_FILES = ["index.js", "app-main.js", "AwtsmoosGPTify.js", "styles.css"];
const EXT_ROOT = path.resolve(ROOT, "../scripts/tricks/extensions/server");

/**
 * B"H — Static regression audit for the hardened cockpit surface.
 *
 * This catches the boring devils in the actively hardened files: duplicate
 * imports/requires, stale commented handlers, handler-count drift, noisy logger
 * regressions, and accidental raw sidebar hiding.
 */
async function run() {
  return test("static-regression-audit", async () => {
    const files = [...auditFiles(), ...collectFiles(EXT_ROOT, /\.(js|json)$/)];
    const duplicateImports = [];
    const duplicateImportedNames = [];
    const suspicious = [];
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      const rel = relative(file);
      const imports = [...text.matchAll(/^(?:import\s+[^;]+;|const\s+\{?[^=]+\}?\s*=\s*require\([^\n]+\);)/gm)].map(m => m[0].trim());
      for (const line of imports.filter((line, i) => imports.indexOf(line) !== i)) duplicateImports.push({ file: rel, line });
      for (const item of duplicateNamedImports(text)) duplicateImportedNames.push({ file: rel, ...item });
      const relUnix = rel.replace(/\\/g, "/");
      if (!relUnix.startsWith("tests/harness/") && /TODO|FIXME|not implemented/i.test(text)) suspicious.push({ file: rel, kind: "unfinished marker" });
      if (/\/\*[\s\S]*portManager\.on\("fetch"/.test(text)) suspicious.push({ file: rel, kind: "commented fetch handler" });
    }
    const bg = readExt("background.js");
    const logger = read("relay/split-browser/logger.cjs");
    const layout = read("css/layout.css");
    const forms = read("css/forms.css");
    const index = read("index.js");
    const appMain = read("app-main.js");
    const count = (s, re) => (s.match(re) || []).length;
    assert(duplicateImports.length === 0, "duplicate imports/requires found", { duplicateImports });
    assert(duplicateImportedNames.length === 0, "duplicate imported names found", { duplicateImportedNames });
    assert(suspicious.length === 0, "suspicious unfinished text found", { suspicious });
    assert(count(bg, /portManager\.on\("fetch"/g) === 1, "extension fetch handler count drifted");
    assert(count(bg, /portManager\.on\("fetch-body"/g) === 1, "extension fetch-body handler count drifted");
    assert(count(bg, /portManager\.on\("resume-stream"/g) === 1, "extension resume handler count drifted");
    assert(/Number\(facts\.status\) >= 400/.test(logger), "logger should only treat 4xx/5xx as important by default");
    assert(count(layout, /\.conversation-automation-badge\s*\{[\s\S]*?border-color:\s*rgba\(255,205,92,\.48\)/g) === 1, "conversation automation badge variant CSS must not duplicate blocks");
    assert(count(forms, /\.composer-chrome\s*\{/g) === 1, "composer chrome CSS must not duplicate blocks");
    assert(count(forms, /\.input-area\.is-fullscreen\s*\{/g) === 1, "composer fullscreen CSS must not duplicate blocks");
    assert(!/min-height:\s*42px/.test(forms), "mobile send button must not regress below 44px touch target");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    return { files: files.length, duplicateImports: 0, suspicious: 0 };
  });
}

function auditFiles() {
  const files = AUDIT_FILES.map(file => path.join(ROOT, file)).filter(fs.existsSync);
  for (const dir of AUDIT_DIRS) files.push(...collectFiles(path.join(ROOT, dir), /\.(js|cjs|css|md)$/));
  return [...new Set(files)];
}
function collectFiles(dir, re, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectFiles(full, re, out);
    else if (re.test(ent.name)) out.push(full);
  }
  return out;
}
function duplicateNamedImports(text) {
  const seen = new Map();
  const duplicates = [];
  for (const match of text.matchAll(/^import\s+([^;]+?)\s+from\s+["'][^"']+["'];?/gm)) {
    const clause = match[1].trim();
    const names = importedNamesFromClause(clause);
    for (const name of names) {
      if (seen.has(name)) duplicates.push({ name, first: seen.get(name), line: match[0].trim() });
      else seen.set(name, match[0].trim());
    }
  }
  return duplicates;
}
function importedNamesFromClause(clause) {
  const names = [];
  const brace = clause.match(/\{([^}]+)\}/);
  if (brace) names.push(...brace[1].split(",").map(part => part.trim().split(/\s+as\s+/i).pop()).filter(Boolean));
  const defaultPart = clause.replace(/\{[^}]+\}/, "").split(",")[0].trim();
  if (defaultPart && !defaultPart.startsWith("*")) names.push(defaultPart);
  return names;
}
function duplicateNamedImports(text) {
  const seen = new Map();
  const duplicates = [];
  for (const match of text.matchAll(/^import\s+([^;]+?)\s+from\s+["'][^"']+["'];?/gm)) {
    const clause = match[1].trim();
    const names = importedNamesFromClause(clause);
    for (const name of names) {
      if (seen.has(name)) duplicates.push({ name, first: seen.get(name), line: match[0].trim() });
      else seen.set(name, match[0].trim());
    }
  }
  return duplicates;
}
function importedNamesFromClause(clause) {
  const names = [];
  const brace = clause.match(/\{([^}]+)\}/);
  if (brace) names.push(...brace[1].split(",").map(part => part.trim().split(/\s+as\s+/i).pop()).filter(Boolean));
  const defaultPart = clause.replace(/\{[^}]+\}/, "").split(",")[0].trim();
  if (defaultPart && !defaultPart.startsWith("*")) names.push(defaultPart);
  return names;
}
function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function readExt(file) { return fs.readFileSync(path.join(EXT_ROOT, file), "utf8"); }
function relative(file) { return path.relative(ROOT, file).replace(/^\.\.\//, ""); }
module.exports = { run };
