// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const refs = require('../../geelooy/apps/tunnel/agent/tools/fs/runtime/sourceRefs.js');
const vm = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');

const rows = [];

/**
 * B"H
 * Runs one regression. Every pass is a candle against yesterday's confusion.
 *
 * @param {string} name
 * @param {() => unknown|Promise<unknown>} fn
 * @returns {Promise<void>}
 */
async function test(name, fn) {
  const started = Date.now();
  try {
    await fn();
    rows.push({ name, ok: true, ms: Date.now() - started });
    console.log('PASS', name);
  } catch (error) {
    rows.push({ name, ok: false, error: error.message, stack: error.stack, ms: Date.now() - started });
    console.log('FAIL', name, error.message);
  }
}

const sample = String.raw`
import main from './real.js';
import {
  one,
  two as three
} from './multi.js';
export { one } from './reexport.js';
export const sealed = ` + '`' + String.raw`
  import x from './fake-template.js';
  require('./fake-require.js');
  export { y } from './fake-reexport.js';
` + '`' + String.raw`;
const regex = /(?:import|export)\s+(?:[^'"` + '`' + String.raw`]+?\s+from\s+)?(['"` + '`' + String.raw`])([^'"` + '`' + String.raw`]+)\1/g;
const text = "import z from './fake-string.js'; require('./fake-string-require.js')";
import('./dynamic.js');
fetch('./asset.json');
`;

(async () => {
  await test('collector ignores strings/templates/regex/require but keeps real refs', () => {
    assert.deepStrictEqual(refs.refsFromJs(sample).sort(), [
      './asset.json', './dynamic.js', './multi.js', './real.js', './reexport.js'
    ].sort());
  });

  await test('collector reads inline module script bodies from HTML', () => {
    const html = '<!--B"H--><script type="module">import { x } from "./broadcast.js"\ndocument.body.innerHTML = `<p>from \'./fake.js\'</p>`;</script>';
    assert.deepStrictEqual(refs.refsFrom(html, 'geelooy/apps/broadcaster/index.html'), [
      'geelooy/apps/broadcaster/broadcast.js'
    ]);
  });

  await test('collector supports multiline import without semicolon', () => {
    const source = 'import {\n  createBroadcastControls\n} from "./broadcast.js"\ncreateBroadcastControls();';
    assert.deepStrictEqual(refs.refsFromJs(source), ['./broadcast.js']);
  });

  await test('VM parser ignores worker-source template payload', () => {
    const p = 'geelooy/apps/code/js/node/worker-source.js';
    const source = fs.readFileSync(p, 'utf8');
    assert.deepStrictEqual(vm.parseImports(source, p, {}), []);
  });

  await test('VM parser preserves regex-net unchanged enough to execute', async () => {
    const p = 'geelooy/apps/code/js/tools/regex-net.js';
    const source = fs.readFileSync(p, 'utf8');
    const stripped = vm.stripExports(source, p, {});
    new Function(stripped.code);
    const result = await vm.executeVmFiles({ files: { [p]: source }, entry: p, runtime: 'browser' });
    assert.ok(result.exports.RegexNet);
  });

  await test('import map resolves real bare module fixture', async () => {
    const root = 'AI_THOUGHTS/runtime-stress/importmap-fixture';
    const files = {};
    for (const f of ['index.html', 'main.js', 'lib/three.module.js']) files[root + '/' + f] = fs.readFileSync(path.join(root, f), 'utf8');
    const { RuntimeAssembler } = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
    const asm = new RuntimeAssembler({ files, entry: root + '/index.html', runtime: 'browser', waitMs: 0 });
    const out = await asm.run(root + '/index.html');
    assert.strictEqual(out.runtime.window.document.getElementById('out').textContent, 'real-613');
  });

  await test('DOM raw script text and append API exist', async () => {
    const { RuntimeAssembler } = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
    const entry = 'virtual/raw/index.html';
    const files = { [entry]: '<!doctype html><body><script id="worker" type="javascript/worker">postMessage(1)</script><main id="m"></main><script>const s=document.createElement("span");s.append("hi");document.getElementById("m").append(s);</script></body>' };
    const out = await new RuntimeAssembler({ files, entry, runtime: 'browser', waitMs: 0 }).run(entry);
    assert.ok(out.runtime.window.document.getElementById('worker').textContent.includes('postMessage'));
    assert.strictEqual(out.runtime.window.document.getElementById('m').textContent, 'hi');
  });

  await test('apps/code boots under simulator without app-source workarounds', async () => {
    const config = loadConfig();
    const service = await import(pathToFileURL(path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js')).href + '?reg=' + Date.now());
    const options = await collectOptions({ p: 'geelooy/apps/code/index.html', waitMs: 0, timeoutMs: 15000 }, config);
    const result = await service.simulateRuntime(options);
    assert.strictEqual(result.ok, true, result.error || JSON.stringify(result.errors || []));
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    ok: rows.filter(r => r.ok).length,
    failed: rows.filter(r => !r.ok).length,
    rows
  };
  fs.writeFileSync('AI_THOUGHTS/runtime-stress/runtime-regression-tests.json', JSON.stringify(summary, null, 2));
  if (summary.failed) process.exit(1);
})();
