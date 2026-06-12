// B"H
const assert = require('assert');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');
const vm = require('vm');

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    const hasTunnel = fs.existsSync(path.join(dir, 'apps/tunnel/agent/main.js'));
    const hasMerkava = fs.existsSync(path.join(dir, 'scripts/awtsmoos/MerkavaExecutor/merkavaexecutor.cjs'));
    if (hasTunnel && hasMerkava) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Could not locate geelooy public root from ' + start);
}

const repoRoot = findPublicRoot(__dirname);
const fsRoot = path.resolve(__dirname, '.tmp-source-suite');
const merkavaRoot = path.join(repoRoot, 'scripts/awtsmoos/MerkavaExecutor');
const runtimeDir = path.join(merkavaRoot, 'merkava-runtime');

function requireFromRepo(rel) {
  return require(path.join(repoRoot, rel));
}

function config() {
  return {
    root: fsRoot,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true }
  };
}

function findNode(root, tagName, id) {
  if (!root) return null;
  if ((!tagName || root.tagName === tagName) && (!id || root.id === id)) return root;
  for (const child of root.children || []) {
    const found = findNode(child, tagName, id);
    if (found) return found;
  }
  return null;
}

async function testMerkavaCjsService() {
  const service = await import(pathToFileURL(path.join(merkavaRoot, 'merkava-service/index.js')).href);
  const htmlResult = await service.simulateRuntime({
    runtime: 'browser',
    entry: 'index.html',
    files: {
      'index.html': '<body><h1 id="x">B"H Merkava</h1><script>console.log("SHOULD_NOT_HYDRATE_AS_TEXT")</script></body>'
    }
  });
  assert.equal(htmlResult.ok, true);
  assert.equal(htmlResult.errors.length, 0);
  assert.equal(htmlResult.score, 100);
  const h1 = findNode(htmlResult.domSnapshot.documentElement, 'H1', 'x');
  assert.equal(h1?.textContent, 'B"H Merkava');
  const body = findNode(htmlResult.domSnapshot.documentElement, 'BODY');
  assert.ok(!String(body?.textContent || '').includes('SHOULD_NOT_HYDRATE_AS_TEXT'));

  const jsResult = await service.simulateRuntime({
    runtime: 'browser',
    entry: 's.js',
    files: { 's.js': 'console.log("BH Merkava JS")' }
  });
  assert.equal(jsResult.ok, true);
  assert.equal(jsResult.errors.length, 0);
  assert.ok(JSON.stringify(jsResult.console).includes('BH Merkava JS'));

  return {
    ok: true,
    html: { score: htmlResult.score, h1Text: h1.textContent, bodyText: body.textContent },
    js: { score: jsResult.score, console: jsResult.console }
  };
}

function loadBrowserUmd(file, sandbox) {
  const code = fs.readFileSync(path.join(runtimeDir, file), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: file });
}

async function testMerkavaBrowserUmdBranch() {
  const sandbox = { console, URL, URLSearchParams, Blob, setTimeout, clearTimeout, setInterval, clearInterval, self: null };
  sandbox.self = sandbox;
  for (const file of [
    '../merkava-browser/VirtualStyleDeclaration.js',
    '../merkava-browser/VirtualClassList.js',
    '../merkava-browser/VirtualEvents.js',
    '../merkava-browser/VirtualHtmlSerializer.js',
    '../merkava-browser/VirtualWebGLTextureArena.js',
    '../merkava-browser/VirtualImagePaintResolver.js',
    '../merkava-browser/VirtualFontAtlas.js',
    '../merkava-browser/CssColorResolver.js',
    '../merkava-browser/CssValueResolver.js',
    '../merkava-browser/VirtualCssEngine.js',
    '../merkava-browser/VirtualCanvas2DContext.js',
    '../merkava-browser/VirtualWebGLContext.js',
    '../merkava-browser/VirtualWebGLBoxRenderer.js',
    '../merkava-browser/VirtualElement.js',
    '../merkava-browser/VirtualDocument.js',
    '../merkava-browser/VirtualStorage.js',
    '../merkava-browser/VirtualConsole.js',
    '../merkava-browser/VirtualFetch.js',
    '../merkava-browser/VirtualEvents.js',
    '../merkava-browser/VirtualMouse.js',
    '../merkava-browser/VirtualKeyboard.js',
    '../merkava-browser/VirtualInteractions.js',
    '../merkava-browser/RuntimeProbe.js',
    '../merkava-browser/VirtualWindow.js',
    '../merkava-browser/VirtualElement.js',
    '../merkava-browser/VirtualDocument.js',
    '../merkava-browser/VirtualStorage.js',
    '../merkava-browser/VirtualConsole.js',
    '../merkava-browser/VirtualFetch.js',
    '../merkava-browser/VirtualEvents.js',
    '../merkava-browser/VirtualMouse.js',
    '../merkava-browser/VirtualKeyboard.js',
    '../merkava-browser/VirtualInteractions.js',
    '../merkava-browser/RuntimeProbe.js',
    '../merkava-browser/VirtualWindow.js',
    'RuntimeGraph.js',
    'RuntimeAddress.js',
    'ImportResolver.js',
    'HTMLAssembler.js',
    'CSSAssembler.js',
    'ModuleExecutor.js',
    '../merkava-browser/SyntheticBrowserRuntime.js',
    '../merkava-node/VirtualNodeRuntime.js',
    'DOMHydrator.js',
    'RuntimeAssembler.js'
  ]) loadBrowserUmd(file, sandbox);

  assert.equal(typeof sandbox.Merkava.RuntimeAssembler, 'function');
  const htmlAssembler = new sandbox.Merkava.RuntimeAssembler({
    runtime: 'browser',
    entry: 'index.html',
    files: {
      'index.html': '<body><main id="app">B"H UMD</main><script>console.log("NO_TEXT_LEAK")</script></body>'
    }
  });
  const htmlResult = await htmlAssembler.run('index.html');
  assert.equal(htmlResult.ok, true);
  const main = findNode(htmlResult.result.snapshot.window.document.documentElement, 'MAIN', 'app');
  assert.equal(main?.textContent, 'B"H UMD');
  const body = findNode(htmlResult.result.snapshot.window.document.documentElement, 'BODY');
  assert.ok(!String(body?.textContent || '').includes('NO_TEXT_LEAK'));

  const jsAssembler = new sandbox.Merkava.RuntimeAssembler({
    runtime: 'browser',
    entry: 's.js',
    files: { 's.js': 'console.log("BH UMD JS")' }
  });
  const jsResult = await jsAssembler.run('s.js');
  assert.equal(jsResult.ok, true);
  assert.ok(JSON.stringify(jsResult.console).includes('BH UMD JS'));
  return { ok: true, htmlText: main.textContent, graphNodes: htmlResult.graph.nodes.length, jsConsole: jsResult.console };
}

async function testBulkReadSource() {
  const { readBulk, uniqueSpecs } = requireFromRepo('apps/tunnel/agent/tools/fs/bulkRead.js');
  await fsp.rm(fsRoot, { recursive: true, force: true });
  await fsp.mkdir(fsRoot, { recursive: true });
  await fsp.writeFile(path.join(fsRoot, 'a.txt'), 'Alef', 'utf8');
  await fsp.writeFile(path.join(fsRoot, 'b.txt'), 'Beis', 'utf8');

  assert.deepEqual(uniqueSpecs('a.txt\nb.txt'.split(/\n/)).map(x => x.path), ['a.txt', 'b.txt']);
  const newline = await readBulk(config(), { paths: 'a.txt\nb.txt', maxFiles: 5, maxChars: 20 });
  assert.equal(newline.ok, true);
  assert.equal(newline.requestedCount, 2);
  assert.equal(newline.returnedCount, 2);
  assert.equal(newline.files['a.txt'].content, 'Alef');
  assert.equal(newline.files['b.txt'].content, 'Beis');

  const json = await readBulk(config(), { paths: '["a.txt","b.txt"]', maxFiles: 1, maxChars: 20 });
  assert.equal(json.requestedCount, 2);
  assert.equal(json.returnedCount, 1);
  assert.equal(json.skippedCount, 1);
  assert.equal(json.partial, true);
  return { ok: true, newline: { requested: newline.requestedCount, returned: newline.returnedCount }, jsonLimited: { requested: json.requestedCount, returned: json.returnedCount, skipped: json.skippedCount } };
}

async function testCommandTreeSource() {
  const { buildWorkflowActions } = requireFromRepo('apps/tunnel/agent/tools/fs/actionGroups/workflowActions.js');
  function fakeBuildActions(_config, payload) {
    return {
      echo: async () => ({ ok: true, action: 'echo', value: payload.value }),
      fail: async () => ({ ok: false, action: 'fail', error: 'forced' })
    };
  }
  const payload = {
    action: 'commandTreeRun',
    steps: [
      { id: 'first', action: 'echo', payload: { value: 'one' }, saveAs: 'first' },
      { assert: { path: 'named.first.value', eq: 'one' } },
      { forEach: { in: ['a', 'b'], as: 'letter', do: [{ action: 'echo', payload: { value: '$vars.letter' } }] } }
    ]
  };
  const actions = buildWorkflowActions({ config: config(), payload, ws: null }, fakeBuildActions);
  assert.equal(typeof actions.commandTreeRun, 'function');
  const result = await actions.commandTreeRun();
  assert.equal(result.ok, true);
  assert.equal(result.count, 5);
  assert.equal(result.results[0].result.value, 'one');
  assert.equal(result.results[2].result.value, 'a');
  assert.equal(result.results[3].result.value, 'b');
  assert.equal(result.results[4].result.forEach, 2);

  const dry = await buildWorkflowActions({ config: config(), payload: { action: 'commandTreeDryRun', steps: payload.steps }, ws: null }, fakeBuildActions).commandTreeDryRun();
  assert.equal(dry.ok, true);
  assert.ok(Array.isArray(dry.plan));
  return { ok: true, runCount: result.count, dryPlanCount: dry.plan.length, first: result.results[0].result };
}

(async () => {
  const results = {
    merkavaCjsService: await testMerkavaCjsService(),
    merkavaBrowserUmdBranch: await testMerkavaBrowserUmdBranch(),
    bulkReadSource: await testBulkReadSource(),
    commandTreeSource: await testCommandTreeSource()
  };
  console.log(JSON.stringify({ ok: true, results }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
