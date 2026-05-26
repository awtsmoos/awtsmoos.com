//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

const AUDIT_DIRS = ["js/app", "js/automation", "js/chatgpt/stream", "js/chatgpt/transport", "js/services", "js/render", "relay/split-browser", "tests/harness"];
const AUDIT_FILES = ["index.js", "app-main.js", "AwtsmoosGPTify.js", "styles.css"];
const EXT_ROOT = path.resolve(ROOT, "../scripts/tricks/extensions/server");

async function run() {
  return test("static-regression-audit", async () => {
    const files = [...auditFiles(), ...collectFiles(EXT_ROOT, /\.(js|json)$/)];
    const duplicateImports = [], duplicateImportedNames = [], duplicateExports = [], duplicateFunctions = [], suspicious = [];
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8"), rel = relative(file), relUnix = rel.replace(/\\/g, "/");
      const imports = [...text.matchAll(/^(?:import\s+[^;]+;|const\s+\{?[^=]+\}?\s*=\s*require\([^\n]+\);)/gm)].map(m => m[0].trim());
      for (const line of imports.filter((line, i) => imports.indexOf(line) !== i)) duplicateImports.push({ file:rel, line });
      for (const item of duplicateNamedImports(text)) duplicateImportedNames.push({ file:rel, ...item });
      for (const item of duplicateExportedNames(text)) duplicateExports.push({ file:rel, ...item });
      for (const item of duplicateLocalFunctions(text)) duplicateFunctions.push({ file:rel, ...item });
      if (!relUnix.startsWith("tests/harness/") && /TODO|FIXME|not implemented/i.test(text)) suspicious.push({ file:rel, kind:"unfinished marker" });
      if (/\/\*[\s\S]*portManager\.on\("fetch"/.test(text)) suspicious.push({ file:rel, kind:"commented fetch handler" });
    }
    const bg = readExt("background.js"), logger = read("relay/split-browser/logger.cjs"), layout = read("css/layout.css"), forms = read("css/forms.css"), styles = read("styles.css"), index = read("index.js"), appMain = read("app-main.js"), scroll = read("js/render/runtime/scrollRuntime.js"), renderer = read("js/render/messageRenderer.js");
    const count = (s, re) => (s.match(re) || []).length;
    assert(duplicateImports.length === 0, "duplicate imports/requires found", { duplicateImports });
    assert(duplicateImportedNames.length === 0, "duplicate imported names found", { duplicateImportedNames });
    assert(duplicateExports.length === 0, "duplicate exported declarations found", { duplicateExports });
    assert(duplicateFunctions.length === 0, "duplicate local function declarations found", { duplicateFunctions });
    assert(suspicious.length === 0, "suspicious unfinished text found", { suspicious });
    assert(count(bg, /portManager\.on\("fetch"/g) === 1, "extension fetch handler count drifted");
    assert(count(bg, /portManager\.on\("fetch-body"/g) === 1, "extension fetch-body handler count drifted");
    assert(count(bg, /portManager\.on\("resume-stream"/g) === 1, "extension resume handler count drifted");
    assert(/Number\(facts\.status\) >= 400/.test(logger), "logger should only treat 4xx/5xx as important by default");
    assert(count(layout, /\.conversation-automation-badge\s*\{[\s\S]*?border-color:\s*rgba\(255,205,92,\.48\)/g) === 1, "conversation automation badge variant CSS must not duplicate blocks");
    assert(count(forms, /\.composer-chrome\s*\{/g) === 1, "composer chrome CSS must not duplicate blocks");
    assert(count(forms, /\.input-area\.is-fullscreen\s*\{/g) === 1, "composer fullscreen CSS must not duplicate blocks");
    assert(!/min-height:\s*42px/.test(forms), "mobile send button must not regress below 44px touch target");
    assert(uniqueCssImports(styles), "styles.css must not contain duplicate @import entries");
    assert(count(styles, /live-scroll-follow\.css/g) === 1, "live scroll follow CSS must be imported exactly once");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    assert(!/!options\.force\s*&&\s*!isNearBottom/.test(scroll), "auto-follow must not pin merely because content growth moved the bottom");
    assert(/liveFollowButton/.test(renderer) && /forceScrollDown\(\)/.test(renderer), "renderer must expose a live bottom button that re-enables auto-follow");
    assert(/isProgrammaticScroll/.test(renderer) && /deltaY < 0/.test(renderer), "scroll pinning must depend on explicit user upward intent");
    assert(/trackTouchStart/.test(renderer) && /trackTouchMove/.test(renderer), "mobile touch scroll must explicitly pause live-follow during upward scrolling");
    assert(count(renderer, /liveFollowButton = document\.createElement/g) === 1, "live follow button must not be duplicated");
    const resize = read("js/layout/resizeHandles.js");
    assert(/resizeMobilePanel/.test(resize) && /clientY/.test(resize), "mobile panel resize must use vertical pointer movement");
    const eventRuntime = read("js/render/runtime/eventRuntime.js");
    assert(/shouldFreezeOpenEventNode/.test(eventRuntime) && /pendingEventHtml/.test(eventRuntime), "open expanded event nodes must not be innerHTML-rewritten during streaming");
    return { files:files.length, duplicateImports:0, duplicateExports:0, duplicateFunctions:0, suspicious:0 };
  });
}

function auditFiles() {
  const files = AUDIT_FILES.map(file => path.join(ROOT, file)).filter(fs.existsSync);
  for (const dir of AUDIT_DIRS) files.push(...collectFiles(path.join(ROOT, dir), /\.(js|cjs|css|md)$/));
  return [...new Set(files)];
}
function collectFiles(dir, re, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })) {
    if (["node_modules", ".git"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectFiles(full, re, out); else if (re.test(ent.name)) out.push(full);
  }
  return out;
}
function uniqueCssImports(text) { const imports = [...text.matchAll(/^@import\s+["']([^"']+)["'];/gm)].map(match => match[1]); return imports.length === new Set(imports).size; }
function duplicateNamedImports(text) { return duplicatesFromMatches(text, /^import\s+([^;]+?)\s+from\s+["'][^"']+["'];?/gm, clause => importedNamesFromClause(clause)); }
function duplicateExportedNames(text) { return duplicatesFromMatches(text, /^export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, name => [name]); }
function duplicateLocalFunctions(text) { return duplicatesFromMatches(text, /^(?!export\s)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm, name => [name]); }
function duplicatesFromMatches(text, regex, namesOf) {
  const seen = new Map(), duplicates = [];
  for (const match of text.matchAll(regex)) for (const name of namesOf(match[1].trim())) {
    if (seen.has(name)) duplicates.push({ name, first:seen.get(name), line:match[0].trim() }); else seen.set(name, match[0].trim());
  }
  return duplicates;
}
function importedNamesFromClause(clause) {
  const names = [], brace = clause.match(/\{([^}]+)\}/);
  if (brace) names.push(...brace[1].split(",").map(part => part.trim().split(/\s+as\s+/i).pop()).filter(Boolean));
  const defaultPart = clause.replace(/\{[^}]+\}/, "").split(",")[0].trim();
  if (defaultPart && !defaultPart.startsWith("*")) names.push(defaultPart);
  return names;
}
function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function readExt(file) { return fs.readFileSync(path.join(EXT_ROOT, file), "utf8"); }
function relative(file) { return path.relative(ROOT, file).replace(/^\.\.\//, ""); }
module.exports = { run };
