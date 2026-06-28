// B"H
/**
 * @file assetPipelineAudit.mjs
 * @description
 * The asset ledger listens for the doorway-scroll of the manifest and for the
 * alternate-universe example shelf.
 *
 * Chapter of the small village under the infinite Awtsmoos:
 * A PNG icon may be held by the manifest; a JSON example may be held by the
 * universe fixture shelf. The audit refuses to call such children orphaned when
 * their parent is archival/example ownership rather than browser boot.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '.';
const REPORT_PATH = 'AI_THOUGHTS/hardening_reports/latest_asset_pipeline.json';
const ASSET_RE = /\.(glb|gltf|png|jpg|jpeg|webp|mp3|ogg|wav|json)$/i;
const SOURCE_RE = /\.(js|mjs|html|css)$/i;

function normalizePath(value = '') {
  return String(value).replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\//, '');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'AI_THOUGHTS' || name === '.git') continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out);
    if (stat.isFile()) out.push(normalizePath(file));
  }
  return out;
}

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch { return ''; }
}

function findManifestLinks(sourceFiles) {
  const links = new Set();
  for (const file of sourceFiles) {
    const text = read(file);
    const relManifest = text.match(/<link[^>]+rel=["']manifest["'][^>]*>/gi) || [];
    for (const tag of relManifest) {
      const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
      if (href) links.add(normalizePath(path.posix.join(path.posix.dirname(file), href.split('?')[0])));
    }
  }
  return links;
}

function parseManifestReferences(manifestFile) {
  const refs = new Set();
  const raw = read(manifestFile);
  if (!raw.trim()) return refs;
  try {
    const manifest = JSON.parse(raw);
    for (const icon of manifest.icons || []) {
      if (icon?.src) refs.add(normalizePath(icon.src));
    }
  } catch (error) {
    refs.add(`__MANIFEST_PARSE_ERROR__:${error.message}`);
  }
  return refs;
}

function directReference(file, blob) {
  const normalized = normalizePath(file);
  const base = path.basename(normalized);
  return blob.includes(normalized) || blob.includes(`./${normalized}`) || blob.includes(`/${normalized}`) || blob.includes(base);
}

function universeExampleFixture(file) {
  return normalizePath(file).startsWith('data/universe/examples/') && path.extname(file).toLowerCase() === '.json';
}

const allFiles = walk(ROOT);
const assets = allFiles.filter(file => ASSET_RE.test(file));
const sourceFiles = allFiles.filter(file => SOURCE_RE.test(file)).slice(0, 5000);
const sourceBlob = sourceFiles.map(read).join('\n');
const manifestLinks = findManifestLinks(sourceFiles);
const manifestRefs = new Set();
for (const manifestFile of manifestLinks) {
  for (const ref of parseManifestReferences(manifestFile)) manifestRefs.add(ref);
}

const rows = assets.map(file => {
  const ext = path.extname(file).toLowerCase();
  const manifestLinked = manifestLinks.has(file);
  const manifestOwned = manifestRefs.has(file);
  const exampleOwned = universeExampleFixture(file);
  const sourceReferenced = directReference(file, sourceBlob);
  const referenced = sourceReferenced || manifestLinked || manifestOwned || exampleOwned;
  const owner = manifestOwned ? 'manifest-icon'
    : manifestLinked ? 'html-manifest'
      : exampleOwned ? 'universe-example-fixture'
        : sourceReferenced ? 'source'
          : 'unowned';
  return { file, referenced, owner, ext };
});

const summary = rows.reduce((acc, row) => {
  acc.total += 1;
  acc.byExt[row.ext] = (acc.byExt[row.ext] || 0) + 1;
  acc.byOwner[row.owner] = (acc.byOwner[row.owner] || 0) + 1;
  if (row.referenced) acc.referenced += 1;
  return acc;
}, { total:0, referenced:0, byExt:{}, byOwner:{} });

const manifestParseErrors = [...manifestRefs].filter(ref => ref.startsWith('__MANIFEST_PARSE_ERROR__'));
const report = {
  ok: manifestParseErrors.length === 0,
  summary,
  manifestLinks:[...manifestLinks].sort(),
  manifestRefs:[...manifestRefs].filter(ref => !ref.startsWith('__MANIFEST_PARSE_ERROR__')).sort(),
  manifestParseErrors,
  universeExampleFixtures:rows.filter(row => row.owner === 'universe-example-fixture').map(row => row.file).sort(),
  unreferenced:rows.filter(row => !row.referenced).slice(0, 200)
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive:true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:report.ok, summary, unreferencedShown:report.unreferenced.length }, null, 2));
if (!report.ok) process.exit(1);
