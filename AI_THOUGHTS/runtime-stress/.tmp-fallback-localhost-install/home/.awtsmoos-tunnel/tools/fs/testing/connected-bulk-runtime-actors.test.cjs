// B"H
/**
 * @file connected-bulk-runtime-actors.test.cjs
 * @description
 * Chapter 360: Four Node actors entered the tunnel furnace.
 * BulkPage tore at cursors, GraphHunter pulled scripts from HTML and CSS,
 * RuntimeWitness demanded Merkava execution, and RegistryScribe looked for
 * action families that can share one inner engine without losing names.
 */
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "apps/tunnel/agent/main.js"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate geelooy public root from " + start);
}

const repoRoot = findPublicRoot(__dirname);
const root = path.join(__dirname, ".tmp-connected-bulk-runtime-actors");
function requireFromRepo(rel) { return require(path.join(repoRoot, rel)); }
function config() { return { root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } }; }

async function resetFixture() {
  await fsp.rm(root, { recursive: true, force: true });
  await fsp.mkdir(path.join(root, "src"), { recursive: true });
  await fsp.writeFile(path.join(root, "index.html"), `<link rel="stylesheet" href="style.css"><script type="importmap">{"imports":{"alias":"./src/alias.js"}}</script><script type="module" src="./src/app.js"></script><script type="module">import './src/inline.js'; fetch('./src/inline-data.json')</script><main id="app">B'H actors</main>`);
  await fsp.writeFile(path.join(root, "style.css"), `@import './theme.css'; body{background:url('./sprite.svg')}`);
  await fsp.writeFile(path.join(root, "theme.css"), `main{color:green}`);
  await fsp.writeFile(path.join(root, "sprite.svg"), `<svg/>`);
  await fsp.writeFile(path.join(root, "src/app.js"), `import alias from './alias.js'; export * from './more.js'; import('./dyn.js'); fetch('./data.json'); window.actorValue=alias+2;`);
  await fsp.writeFile(path.join(root, "src/alias.js"), `export default 40`);
  await fsp.writeFile(path.join(root, "src/more.js"), `export const more=2`);
  await fsp.writeFile(path.join(root, "src/dyn.js"), `export const dyn=3`);
  await fsp.writeFile(path.join(root, "src/inline.js"), `window.inlineActor=true`);
  await fsp.writeFile(path.join(root, "src/data.json"), `{ "data": true }`);
  await fsp.writeFile(path.join(root, "src/inline-data.json"), `{ "inline": true }`);
}

async function bulkPageActor() {
  const { readBulk } = requireFromRepo("apps/tunnel/agent/tools/fs/bulkRead.js");
  const one = await readBulk(config(), { p: "src", paths: "app.js\nalias.js\nmore.js", maxFiles: 1, maxChars: 80 });
  assert.equal(one.files["src/app.js"].ok, true);
  assert.equal(one.partial, true);
  assert.equal(one.nextPagePayload.cursor, 1);
  const two = await readBulk(config(), one.nextPagePayload);
  assert.equal(two.files["src/alias.js"].ok, true);
  assert.ok(two.message.includes("This is one page of the bulk read"));
  return { pages: [one.order, two.order], next: one.nextPagePayload };
}

async function graphHunterActor() {
  const { connectedFiles } = requireFromRepo("apps/tunnel/agent/tools/fs/connectedFiles.js");
  const first = await connectedFiles(config(), { path: "index.html", maxDepth: 5, maxFiles: 4, mode: "graph" });
  assert.equal(first.returnedCount, 4);
  assert.equal(first.partial, true);
  const all = await connectedFiles(config(), { path: "index.html", maxDepth: 5, mode: "graph" });
  const paths = all.files.map(file => file.path);
  for (const needed of ["index.html", "style.css", "theme.css", "sprite.svg", "src/app.js", "src/alias.js", "src/more.js", "src/dyn.js", "src/data.json", "src/inline.js", "src/inline-data.json"]) assert.ok(paths.includes(needed), needed);
  assert.ok(all.edges.length >= 8);
  return { count: all.count, sample: paths.slice(0, 12) };
}

async function runtimeWitnessActor() {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const payload = { action: "simulateRuntime", runtime: "browser", entry: "index.html", returnValues: ["window.actorValue", "window.inlineActor"] };
  const result = await buildRuntimeActions({ payload, config: config() }).simulateRuntime();
  assert.equal(result.ok, true, JSON.stringify(result.errors || result.diagnostics || []));
  assert.equal(result.virtualEnv.source, "path");
  assert.ok(result.virtualEnv.files["src/app.js"].includes("actorValue"));
  return { score: result.score, files: Object.keys(result.virtualEnv.files).sort() };
}

function registryScribeActor() {
  const { buildActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actions.js");
  const names = Object.keys(buildActions(config(), { action: "list" }, null)).sort();
  const families = { read: names.filter(n => /read|bulk|connected|lines|md$/i.test(n)), runtime: names.filter(n => /runtime|merkava|workflow|simulate/i.test(n)), command: names.filter(n => /command|shell|nodeScript/i.test(n)) };
  assert.ok(families.read.includes("bulk"));
  assert.ok(families.read.includes("connectedFiles"));
  assert.ok(families.runtime.includes("simulateRuntime"));
  return { total: names.length, families, consolidationHint: "Keep aliases public; consolidate around shared engines: paged file reader, connected graph collector, runtime service runner, command runner." };
}

(async () => {
  await resetFixture();
  const report = { ok: true, actors: { bulkPageActor: await bulkPageActor(), graphHunterActor: await graphHunterActor(), runtimeWitnessActor: await runtimeWitnessActor(), registryScribeActor: registryScribeActor() } };
  console.log(JSON.stringify(report, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
