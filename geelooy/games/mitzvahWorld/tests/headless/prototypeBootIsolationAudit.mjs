// B"H
/**
 * PrototypeBootIsolationAudit
 *
 * This is the wall around the orchard. Generated feature packs and the
 * alternate universe stack may exist, be tested, postbuilt, or exposed through
 * explicit query-string tools; they may not silently become phone-critical
 * browser boot. The Awtsmoos gives every world a gate, and this audit keeps the
 * gates named.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '.';
const SOURCE_RE = /\.(js|mjs|html)$/i;
const PROTOTYPE_RE = /ckidsAwtsmoos\/systems\/(feature49|feature100)\//;
const UNIVERSE_RE = /systems\/universe\//;
const PHONE_BOOT_HINT_RE = /^(index\.js|index\.html|systems\/boot\/|systems\/mobile\/|systems\/performance\/|systems\/story\/|ckidsAwtsmoos\/systems\/tutorial\/|ckidsAwtsmoos\/systems\/livingWorld\/LivingWorldRuntime\.js|ckidsAwtsmoos\/systems\/village\/|ckidsAwtsmoos\/systems\/world\/WorldEventDirectorRuntime\.js)/;

function normalize(file) { return String(file).replaceAll('\\', '/').replace(/^\.\//, ''); }
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'AI_THOUGHTS'].includes(name)) continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else if (stat.isFile() && SOURCE_RE.test(file)) out.push(normalize(file));
  }
  return out;
}
function read(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return ''; } }
function importSpecifiers(text) {
  const specs = [];
  const patterns = [
    /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /<script[^>]+src=["']([^"']+)["']/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) specs.push(match[1]);
  }
  return specs;
}
function resolveSpecifier(fromFile, spec) {
  if (!spec || spec.startsWith('http') || spec.startsWith('@')) return normalize(spec || '');
  if (!spec.startsWith('.')) return normalize(spec);
  const base = path.posix.dirname(normalize(fromFile));
  return normalize(path.posix.normalize(path.posix.join(base, spec.split('?')[0])));
}
function queryGatedUniverseTool(file, text) {
  const normalized = normalize(file);
  return normalized.startsWith('systems/ui/universe/')
    && text.includes('window.location.search.includes(')
    && /awtsmoosUniverse(Paste|Inspect)=1/.test(text);
}
function allowedUniverseImporter(file, text) {
  const normalized = normalize(file);
  return normalized.startsWith('systems/universe/')
    || normalized.startsWith('tests/')
    || normalized.includes('/postbuild/UniverseJsonPostBuild.js')
    || queryGatedUniverseTool(normalized, text);
}
function allowedPrototypeFile(file) {
  const normalized = normalize(file);
  return normalized.startsWith('ckidsAwtsmoos/systems/feature49/') || normalized.startsWith('ckidsAwtsmoos/systems/feature100/') || normalized.startsWith('tests/headless/');
}

const files = walk(ROOT);
const violations = [];
const observed = [];
for (const file of files) {
  const text = read(file);
  for (const spec of importSpecifiers(text)) {
    const resolved = resolveSpecifier(file, spec);
    const prototypeHit = PROTOTYPE_RE.test(resolved) || /(^|\/)feature(49|100)(\/|$)/.test(resolved);
    const universeHit = UNIVERSE_RE.test(resolved);
    if (prototypeHit) {
      observed.push({ file, spec, resolved, kind:'generated-feature-pack', allowed:allowedPrototypeFile(file) && !PHONE_BOOT_HINT_RE.test(file) });
      if (!allowedPrototypeFile(file) || PHONE_BOOT_HINT_RE.test(file)) violations.push({ file, spec, resolved, kind:'generated-feature-pack-boot-leak' });
    }
    if (universeHit) {
      const allowed = allowedUniverseImporter(file, text) && !PHONE_BOOT_HINT_RE.test(file);
      observed.push({ file, spec, resolved, kind:'alternate-universe', allowed, queryGated:queryGatedUniverseTool(file, text) });
      if (!allowed) violations.push({ file, spec, resolved, kind:'alternate-universe-boot-leak' });
    }
  }
}

const report = {
  ok:violations.length === 0,
  scanned:files.length,
  observedImports:observed,
  violations,
  optionalUniverseTools:observed.filter(row => row.queryGated).map(row => row.file).filter((file, index, all) => all.indexOf(file) === index),
  policy:{
    generatedFeaturePacks:'Only self-imports/tests may reference feature49/feature100; phone boot may not.',
    alternateUniverse:'Allowed from systems/universe, tests, UniverseJsonPostBuild, and explicit query-gated systems/ui/universe tools only; phone boot may not.'
  }
};
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_prototype_boot_isolation_audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:report.ok, scanned:report.scanned, observedImports:report.observedImports.length, optionalUniverseTools:report.optionalUniverseTools.length, violations:report.violations.length }, null, 2));
if (!report.ok) process.exit(1);
