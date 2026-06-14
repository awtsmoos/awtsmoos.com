// B"H
/**
 * @file connected-files-pagination-stress.test.cjs
 * @description
 * Chapter 426: connectedFiles is tried under load, not trusted by hope.
 * Directories, query strings, circular imports, missing imports, and page budgets
 * must all return shaped continuation instead of silence or overflow.
 */
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { connectedFiles, collectConnectedGraph, resolveExisting, cleanRef } = require("../connectedFiles.js");
const root = path.join(__dirname, ".tmp-connected-files-pagination-stress");
function config() { return { root, allowSecrets: false, tools: { fsRead: true, fsBulk: true, fsList: true, fsTree: true } }; }
async function reset() {
  await fsp.rm(root, { recursive: true, force: true });
  await fsp.mkdir(path.join(root, "src/deep"), { recursive: true });
  await fsp.writeFile(path.join(root, "index.html"), `<script type="module" src="./src/app.js?v=abc"></script><link rel="stylesheet" href="./style.css?x=1">`);
  await fsp.writeFile(path.join(root, "style.css"), `@import './theme.css?v=2'; body{background:url('./sprite.svg?hash=1')}`);
  await fsp.writeFile(path.join(root, "theme.css"), `main{color:green}`);
  await fsp.writeFile(path.join(root, "src/app.js"), `import './a.js?v=1'; import './missing.js?v=nope'; export * from './deep/b.js?hot=1';`);
  await fsp.writeFile(path.join(root, "src/a.js"), `import './c.js#frag'; export const a=1;`);
  await fsp.writeFile(path.join(root, "src/c.js"), `import './a.js?cycle=1'; export const c=3;`);
  await fsp.writeFile(path.join(root, "src/deep/b.js"), `export const b=2;`);
  await fsp.writeFile(path.join(root, "sprite.svg"), `<svg/>`);
  for (let i = 0; i < 80; i++) await fsp.writeFile(path.join(root, "src", `many${i}.js`), `export const many${i}=${i};\n`);
}
async function assertQueryStringResolution() {
  assert.equal(cleanRef("src/app.js?v=1#x"), "src/app.js");
  const got = await resolveExisting(config(), "src/app.js?v=1#x");
  assert.ok(got && got.endsWith("src/app.js"));
}
async function assertFileGraph() {
  const r = await connectedFiles(config(), { path: "index.html", maxDepth: 6, mode: "graph" });
  const paths = r.files.map(f => f.path);
  for (const needed of ["index.html", "src/app.js", "src/a.js", "src/c.js", "src/deep/b.js", "style.css", "theme.css", "sprite.svg"]) assert.ok(paths.includes(needed), needed);
  assert.ok(r.unresolved.some(e => e.spec.includes("missing")), "missing import should be reported");
  assert.ok(r.totalEdgeCount >= 7);
}
async function assertDirectorySeeds() {
  const r = await connectedFiles(config(), { path: "src", maxFiles: 5, totalMaxChars: 1200, maxDepth: 2 });
  assert.equal(r.entryKind, "directory");
  assert.ok(r.seedCount >= 80);
  assert.ok(r.count >= 80);
  assert.ok(r.returnedCount >= 1);
  assert.equal(r.partial, true);
  assert.ok(r.nextPagePayload && Number.isInteger(r.nextPagePayload.cursor));
}
async function assertPaginationContinues() {
  const first = await connectedFiles(config(), { path: "src", maxFiles: 1, totalMaxChars: 500, maxDepth: 1 });
  assert.equal(first.returnedCount, 1);
  assert.equal(first.partial, true);
  const second = await connectedFiles(config(), first.nextPagePayload);
  assert.equal(second.returnedCount, 1);
  assert.notEqual(first.files[0].path, second.files[0].path);
}
async function assertNoHugeDefault() {
  const r = await connectedFiles(config(), { path: "src", maxFiles: 20, maxDepth: 1 });
  assert.ok(r.usedChars <= 24000, `used too many chars: ${r.usedChars}`);
}
async function assertCollectNoCycleExplosion() {
  const g = await collectConnectedGraph(config(), { path: "src/a.js", maxDepth: 8 });
  assert.ok(g.nodes.length <= 3, `cycle exploded to ${g.nodes.length}`);
}
(async () => {
  await reset();
  await assertQueryStringResolution();
  await assertFileGraph();
  await assertDirectorySeeds();
  await assertPaginationContinues();
  await assertNoHugeDefault();
  await assertCollectNoCycleExplosion();
  console.log(JSON.stringify({ ok: true, fixture: root }, null, 2));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
